import {
  ProcessedDeployment,
  NetworkData,
  DeploymentStats,
  FilterOptions,
  CrossChainQuery,
  LzReadRequest
} from "@shared/types";
import { apiRequest } from "./queryClient";

// Fetch all deployments with optional pagination
export async function fetchDeployments(page: number = 1, limit: number = 100): Promise<ProcessedDeployment[]> {
  const response = await apiRequest("GET", `/api/deployments?page=${page}&limit=${limit}`);
  return response.json();
}

// Fetch a specific deployment by ID - this will make a fresh API call for the latest data
export async function fetchDeploymentById(id: string): Promise<ProcessedDeployment> {
  const response = await apiRequest("GET", `/api/deployments/${id}`);
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Deployment with ID ${id} not found`);
    }
    throw new Error(`Failed to fetch deployment: ${response.statusText}`);
  }
  
  return response.json();
}

// Search deployments with filters
export async function searchDeployments(filters: {
  chains?: string[];
  stages?: string[];
  versions?: number[];
  searchTerm?: string;
}): Promise<ProcessedDeployment[]> {
  // Build query string
  const params = new URLSearchParams();
  
  if (filters.chains && filters.chains.length > 0) {
    params.append('chains', filters.chains.join(','));
  }
  
  if (filters.stages && filters.stages.length > 0) {
    params.append('stages', filters.stages.join(','));
  }
  
  if (filters.versions && filters.versions.length > 0) {
    params.append('versions', filters.versions.join(','));
  }
  
  if (filters.searchTerm) {
    params.append('q', filters.searchTerm);
  }
  
  const response = await apiRequest("GET", `/api/search?${params.toString()}`);
  return response.json();
}

// Fetch network graph data
export async function fetchNetworkData(): Promise<NetworkData> {
  const response = await apiRequest("GET", "/api/network");
  return response.json();
}

// Fetch deployment statistics
export async function fetchStats(): Promise<DeploymentStats> {
  const response = await apiRequest("GET", "/api/stats");
  return response.json();
}

// Fetch filter options
export async function fetchFilterOptions(): Promise<FilterOptions> {
  const response = await apiRequest("GET", "/api/filter-options");
  return response.json();
}

// lzRead API functions

// Perform a cross-chain query using lzRead
export async function performCrossChainQuery(query: CrossChainQuery): Promise<LzReadRequest> {
  const response = await apiRequest("POST", "/api/lzread/query", query);
  
  if (!response.ok) {
    throw new Error(`Failed to perform cross-chain query: ${response.statusText}`);
  }
  
  return response.json();
}

// Fetch recent lzRead requests
export async function fetchRecentLzReadRequests(limit: number = 10): Promise<LzReadRequest[]> {
  const response = await apiRequest("GET", `/api/lzread/recent?limit=${limit}`);
  return response.json();
}

// Fetch a specific lzRead request by ID
export async function fetchLzReadRequestById(id: string): Promise<LzReadRequest> {
  const response = await apiRequest("GET", `/api/lzread/request/${id}`);
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Request with ID ${id} not found`);
    }
    throw new Error(`Failed to fetch request: ${response.statusText}`);
  }
  
  return response.json();
}
