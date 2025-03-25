import fetch from "node-fetch";
import { ProcessedDeployment } from "@shared/types";

// Cache mechanism for API responses
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
let cachedDeployments: {
  data: ProcessedDeployment[];
  timestamp: number;
} | null = null;

// Function to fetch and process data from LayerZero API
export async function fetchLayerZeroDeployments(): Promise<ProcessedDeployment[]> {
  // If we have cached data and it's not expired, return it
  if (cachedDeployments && Date.now() - cachedDeployments.timestamp < CACHE_DURATION) {
    return cachedDeployments.data;
  }

  try {
    const response = await fetch("https://metadata.layerzero-api.com/v1/metadata/deployments");
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    const processedData: ProcessedDeployment[] = [];
    
    // Process the response - handle the structure change in the API
    if (typeof data === 'object' && data !== null) {
      Object.entries(data).forEach(([chainKeyStage, chainData]) => {
        if (chainData && typeof chainData === 'object' && 'deployments' in chainData && Array.isArray(chainData.deployments)) {
          chainData.deployments.forEach((deployment: any) => {
            if (deployment && deployment.chainKey && deployment.eid && deployment.stage) {
              // Create a deployment entry with safe property access
              processedData.push({
                id: `${deployment.chainKey}-${deployment.eid}-${deployment.stage}`,
                chainKey: deployment.chainKey,
                eid: deployment.eid,
                stage: deployment.stage,
                endpoint: deployment.endpoint || { address: 'N/A' },
                relayerV2: deployment.relayerV2,
                ultraLightNodeV2: deployment.ultraLightNodeV2,
                sendUln301: deployment.sendUln301,
                receiveUln301: deployment.receiveUln301,
                nonceContract: deployment.nonceContract,
                version: deployment.version || 0,
                isActive: true, // Assuming all deployments from the API are active
                rawData: deployment,
              });
            }
          });
        }
      });
    }

    // Log the processed data count for debugging
    console.log(`Processed ${processedData.length} deployments from the API`);

    // Update cache
    cachedDeployments = {
      data: processedData,
      timestamp: Date.now(),
    };

    // If we didn't get any data, return an empty array
    if (processedData.length === 0) {
      console.warn("No deployments found in API response, returning empty array");
      return [];
    }

    return processedData;
  } catch (error) {
    console.error("Failed to fetch LayerZero deployments:", error);
    
    // If we have cached data, return it even if expired
    if (cachedDeployments) {
      return cachedDeployments.data;
    }
    
    // If no cached data, return an empty array instead of throwing
    console.warn("No cached data available, returning empty array");
    return [];
  }
}

// Function to fetch a specific deployment by ID
export async function fetchDeploymentById(id: string): Promise<ProcessedDeployment | undefined> {
  // Get all deployments
  const allDeployments = await fetchLayerZeroDeployments();
  
  // Find the specific deployment
  return allDeployments.find(deployment => deployment.id === id);
}