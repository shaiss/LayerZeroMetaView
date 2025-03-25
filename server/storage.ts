import { deployments, type Deployment, type InsertDeployment } from "@shared/schema";
import { ProcessedDeployment } from "@shared/types";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

// Storage interface for LayerZero API data
export interface IStorage {
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
  private deployments: ProcessedDeployment[];
  private deploymentsTimestamp: number;

  constructor() {
    this.deployments = [];
    this.deploymentsTimestamp = 0;
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
  
  async cacheDeployments(processedDeployments: ProcessedDeployment[]): Promise<void> {
    try {
      console.log(`Caching ${processedDeployments.length} deployments to database`);
      
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

      // Delete existing data without using transactions
      await db.delete(deployments);
      console.log("Cleared existing deployments");
      
      // Insert new deployments in batches of 20 (smaller batches for reliability)
      const batchSize = 20;
      for (let i = 0; i < deploymentsToInsert.length; i += batchSize) {
        const batch = deploymentsToInsert.slice(i, i + batchSize);
        await db.insert(deployments).values(batch);
        console.log(`Inserted batch ${i/batchSize + 1}/${Math.ceil(deploymentsToInsert.length/batchSize)}`);
      }
      
      console.log(`Successfully cached ${deploymentsToInsert.length} deployments to database`);
    } catch (error) {
      console.error("Error in cacheDeployments:", error);
      throw error;
    }
  }
  
  async getDeployments(): Promise<ProcessedDeployment[]> {
    // Add orderBy to ensure consistent results
    const dbDeployments = await db.select().from(deployments)
      .orderBy(deployments.chainKey);
    
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
      .orderBy(deployments.chainKey)
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
      // Combine all conditions with AND logic
      const combinedCondition = conditions.reduce((acc, curr) => 
        acc ? sql`${acc} AND ${curr}` : curr, null as any);
      
      if (combinedCondition) {
        query = query.where(combinedCondition);
      }
    }
    
    // Add consistent ordering
    const dbDeployments = await query.orderBy(deployments.chainKey);
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

// Use DatabaseStorage for persistence
// With fallback to MemStorage on initialization error
let storageImplementation: IStorage;

try {
  console.log("Initializing database storage");
  storageImplementation = new DatabaseStorage();
} catch (error) {
  console.error("Failed to initialize database storage:", error);
  console.log("Falling back to in-memory storage");
  storageImplementation = new MemStorage();
}

export const storage = storageImplementation;
