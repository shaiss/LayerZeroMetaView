import {
  ProcessedDeployment,
  NetworkData,
  DeploymentStats,
  FilterOptions
} from "@shared/types";
import { apiRequest } from "./queryClient";

// Fetch all deployments
export async function fetchDeployments(): Promise<ProcessedDeployment[]> {
  const response = await apiRequest("GET", "/api/deployments");
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
