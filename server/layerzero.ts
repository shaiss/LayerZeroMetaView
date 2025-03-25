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
    // Fetch both the metadata and deployments endpoints for complete data
    const metadataResponse = await fetch("https://metadata.layerzero-api.com/v1/metadata");
    if (!metadataResponse.ok) {
      throw new Error(`Metadata API responded with status: ${metadataResponse.status}`);
    }

    const metadataData = await metadataResponse.json();
    const processedData: ProcessedDeployment[] = [];
    
    // Process the response using the metadata endpoint format
    if (typeof metadataData === 'object' && metadataData !== null) {
      // The metadata endpoint returns a more complex structure with chainKeys as primary keys
      Object.entries(metadataData).forEach(([chainKeyStage, chainData]: [string, any]) => {
        if (chainData && typeof chainData === 'object') {
          // Parse chainKey and stage from the key
          // For mainnet chains, the key is just the chainKey (e.g., "ethereum")
          // For testnet chains, the key is chainKey-stage (e.g., "ethereum-testnet")
          let chainKey, stage;
          
          if (chainKeyStage.includes('-')) {
            const parts = chainKeyStage.split('-');
            chainKey = parts[0];
            stage = parts.slice(1).join('-');
          } else {
            chainKey = chainKeyStage;
            stage = 'mainnet'; // Default for keys without explicit stage
          }
          
          // Extract chain details and block explorers
          const chainDetails = chainData.chainDetails || {};
          const blockExplorers = chainData.blockExplorers || [];
          const dvns = chainData.dvns || {};
          
          // Get deployments array
          const deployments = chainData.deployments || [];
          
          // Process each deployment
          deployments.forEach((deployment: any) => {
            if (deployment && deployment.eid) {
              // Handle both v1 and v2 contract addresses
              // V1 contracts
              const endpoint = deployment.endpoint || null;
              // Handle both relayerV2 and relayer (legacy support)
              const relayerV2 = deployment.relayerV2 || deployment.relayer || null;
              const ultraLightNodeV2 = deployment.ultraLightNodeV2 || null;
              const sendUln301 = deployment.sendUln301 || null;
              const receiveUln301 = deployment.receiveUln301 || null;
              const nonceContract = deployment.nonceContract || null;
              
              // V2 contracts
              const endpointV2 = deployment.endpointV2 || null;
              const sendUln302 = deployment.sendUln302 || null;
              const receiveUln302 = deployment.receiveUln302 || null;
              const executor = deployment.executor || null;
              
              // Determine which version to use based on available contracts
              let version = deployment.version;
              // If version is explicitly 0, make it 1 for UI purposes
              if (version === 0) version = 1;
              // If version is undefined, infer from available contracts
              if (version === undefined) version = endpointV2 ? 2 : 1;
              
              // Create a deployment entry with safe property access
              processedData.push({
                id: `${chainKey}-${deployment.eid}-${stage}`,
                chainKey,
                eid: deployment.eid,
                stage,
                endpoint: endpoint || endpointV2 || { address: 'N/A' }, // Use v2 endpoint if v1 not available
                relayerV2,
                ultraLightNodeV2,
                sendUln301: sendUln301 || sendUln302, // Use v2 if v1 not available
                receiveUln301: receiveUln301 || receiveUln302, // Use v2 if v1 not available
                nonceContract,
                version,
                isActive: true, // Assuming all deployments from the API are active
                rawData: {
                  ...deployment,
                  chainKey,
                  stage,
                  chainDetails,
                  dvns,
                  blockExplorers,
                  // Include v2 specific contracts in the raw data
                  endpointV2,
                  sendUln302,
                  receiveUln302,
                  executor,
                  // Add chain-level metadata for display
                  chainType: chainDetails?.chainType || '',
                  nativeChainId: chainDetails?.nativeChainId || '',
                  chainLayer: chainDetails?.chainLayer || '',
                  nativeCurrency: chainDetails?.nativeCurrency || {},
                },
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