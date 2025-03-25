import { users, type User, type InsertUser } from "@shared/schema";
import { ProcessedDeployment } from "@shared/types";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Cache for LayerZero deployments
  cacheDeployments(deployments: ProcessedDeployment[]): Promise<void>;
  getDeployments(): Promise<ProcessedDeployment[]>;
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
}

export const storage = new MemStorage();
