import { users, deployments, type User, type InsertUser, type Deployment, type InsertDeployment } from "@shared/schema";
import { ProcessedDeployment } from "@shared/types";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // LayerZero deployments methods
  cacheDeployments(deployments: ProcessedDeployment[]): Promise<void>;
  getDeployments(): Promise<ProcessedDeployment[]>;
  getDeploymentById(id: string): Promise<ProcessedDeployment | undefined>;
  getDeploymentsBatch(offset: number, limit: number): Promise<ProcessedDeployment[]>;
  searchDeployments(filters: {
    chains?: string[];
    stages?: string[];
    versions?: number[];
    searchTerm?: string;
  }): Promise<ProcessedDeployment[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private deployments: ProcessedDeployment[];
  private deploymentsTimestamp: number;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.deployments = [];
    this.deploymentsTimestamp = 0;
    this.currentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async cacheDeployments(deployments: ProcessedDeployment[]): Promise<void> {
    this.deployments = deployments;
    this.deploymentsTimestamp = Date.now();
  }
  
  async getDeployments(): Promise<ProcessedDeployment[]> {
    return this.deployments;
  }

  async getDeploymentById(id: string): Promise<ProcessedDeployment | undefined> {
    return this.deployments.find(d => d.id === id);
  }

  async getDeploymentsBatch(offset: number, limit: number): Promise<ProcessedDeployment[]> {
    return this.deployments.slice(offset, offset + limit);
  }

  async searchDeployments(filters: {
    chains?: string[];
    stages?: string[];
    versions?: number[];
    searchTerm?: string;
  }): Promise<ProcessedDeployment[]> {
    let filtered = [...this.deployments];
    
    if (filters.chains && filters.chains.length > 0) {
      filtered = filtered.filter(d => filters.chains?.includes(d.chainKey));
    }
    
    if (filters.stages && filters.stages.length > 0) {
      filtered = filtered.filter(d => filters.stages?.includes(d.stage));
    }
    
    if (filters.versions && filters.versions.length > 0) {
      filtered = filtered.filter(d => filters.versions?.includes(d.version));
    }
    
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(d => 
        d.chainKey.toLowerCase().includes(searchLower) || 
        d.eid.toLowerCase().includes(searchLower) ||
        d.stage.toLowerCase().includes(searchLower)
      );
    }
    
    return filtered;
  }
}

// Database implementation of the storage interface
export class DatabaseStorage implements IStorage {
  constructor() {
    console.log("Using DatabaseStorage for persistence");
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  async cacheDeployments(processedDeployments: ProcessedDeployment[]): Promise<void> {
    // Transform ProcessedDeployment[] to InsertDeployment[]
    const deploymentsToInsert: InsertDeployment[] = processedDeployments.map(d => ({
      chainKey: d.chainKey,
      eid: d.eid,
      stage: d.stage,
      endpoint: d.endpoint,
      relayerV2: d.relayerV2 || null,
      ultraLightNodeV2: d.ultraLightNodeV2 || null,
      sendUln301: d.sendUln301 || null,
      receiveUln301: d.receiveUln301 || null,
      nonceContract: d.nonceContract || null,
      version: d.version,
      timestamp: new Date().toISOString(),
      isActive: d.isActive,
      rawData: d.rawData
    }));

    // Use a transaction to ensure atomicity
    await db.transaction(async (tx) => {
      // Clear existing deployments
      await tx.delete(deployments);
      
      // Insert new deployments in batches of 100
      const batchSize = 100;
      for (let i = 0; i < deploymentsToInsert.length; i += batchSize) {
        const batch = deploymentsToInsert.slice(i, i + batchSize);
        await tx.insert(deployments).values(batch);
      }
    });
    
    console.log(`Cached ${deploymentsToInsert.length} deployments to database`);
  }
  
  async getDeployments(): Promise<ProcessedDeployment[]> {
    const dbDeployments = await db.select().from(deployments);
    
    // Transform Deployment[] to ProcessedDeployment[]
    return dbDeployments.map(this.mapDbDeploymentToProcessed);
  }

  async getDeploymentById(id: string): Promise<ProcessedDeployment | undefined> {
    // Parse the id to get chainKey, eid, and stage
    const parts = id.split('-');
    if (parts.length < 3) return undefined;
    
    const chainKey = parts[0];
    const eid = parts[1];
    const stage = parts.slice(2).join('-'); // In case stage has hyphens
    
    const [deployment] = await db.select().from(deployments).where(
      and(
        eq(deployments.chainKey, chainKey),
        eq(deployments.eid, eid),
        eq(deployments.stage, stage)
      )
    );
    
    if (!deployment) return undefined;
    return this.mapDbDeploymentToProcessed(deployment);
  }

  async getDeploymentsBatch(offset: number, limit: number): Promise<ProcessedDeployment[]> {
    const dbDeployments = await db.select().from(deployments)
      .orderBy(desc(deployments.timestamp))
      .limit(limit)
      .offset(offset);
    
    return dbDeployments.map(this.mapDbDeploymentToProcessed);
  }

  async searchDeployments(filters: {
    chains?: string[];
    stages?: string[];
    versions?: number[];
    searchTerm?: string;
  }): Promise<ProcessedDeployment[]> {
    let query = db.select().from(deployments);
    
    // Apply filters
    const conditions = [];
    
    if (filters.chains && filters.chains.length > 0) {
      conditions.push(sql`${deployments.chainKey} IN (${filters.chains.join(',')})`);
    }
    
    if (filters.stages && filters.stages.length > 0) {
      conditions.push(sql`${deployments.stage} IN (${filters.stages.join(',')})`);
    }
    
    if (filters.versions && filters.versions.length > 0) {
      conditions.push(sql`${deployments.version} IN (${filters.versions.join(',')})`);
    }
    
    if (filters.searchTerm) {
      const searchTerm = `%${filters.searchTerm}%`;
      conditions.push(
        sql`${deployments.chainKey} ILIKE ${searchTerm} OR 
            ${deployments.eid} ILIKE ${searchTerm} OR 
            ${deployments.stage} ILIKE ${searchTerm}`
      );
    }
    
    // Apply WHERE clause if any conditions
    if (conditions.length > 0) {
      // @ts-ignore - TypeScript doesn't recognize sql template literals correctly
      query = query.where(sql.and(...conditions));
    }
    
    const dbDeployments = await query;
    return dbDeployments.map(this.mapDbDeploymentToProcessed);
  }

  private mapDbDeploymentToProcessed(deployment: Deployment): ProcessedDeployment {
    return {
      id: `${deployment.chainKey}-${deployment.eid}-${deployment.stage}`,
      chainKey: deployment.chainKey,
      eid: deployment.eid,
      stage: deployment.stage,
      endpoint: deployment.endpoint as any,
      relayerV2: deployment.relayerV2 as any,
      ultraLightNodeV2: deployment.ultraLightNodeV2 as any,
      sendUln301: deployment.sendUln301 as any,
      receiveUln301: deployment.receiveUln301 as any,
      nonceContract: deployment.nonceContract as any,
      version: deployment.version,
      isActive: deployment.isActive === null ? true : !!deployment.isActive,
      rawData: deployment.rawData
    };
  }
}

// Use DatabaseStorage instead of MemStorage
export const storage = new DatabaseStorage();
