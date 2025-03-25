import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import fetch from "node-fetch";
import { DeploymentsResponse, ProcessedDeployment } from "@shared/types";

// Cache mechanism for API responses
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
let cachedDeployments: {
  data: ProcessedDeployment[];
  timestamp: number;
} | null = null;

// Function to fetch and process data from LayerZero API
async function fetchLayerZeroDeployments(): Promise<ProcessedDeployment[]> {
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

    // If we didn't get any data, use mock data for development purposes
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

export async function registerRoutes(app: Express): Promise<Server> {
  // API endpoint to get all deployments
  app.get("/api/deployments", async (req, res) => {
    try {
      const deployments = await fetchLayerZeroDeployments();
      res.json(deployments);
    } catch (error) {
      console.error("Error fetching deployments:", error);
      res.status(500).json({ 
        message: "Failed to fetch deployments",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // API endpoint to get filter options
  app.get("/api/filter-options", async (req, res) => {
    try {
      const deployments = await fetchLayerZeroDeployments();
      
      // Convert to arrays safely even if empty
      const chains = deployments.length > 0 ? Array.from(new Set(deployments.map(d => d.chainKey))) : [];
      const stages = deployments.length > 0 ? Array.from(new Set(deployments.map(d => d.stage))) : [];
      const versions = deployments.length > 0 ? Array.from(new Set(deployments.map(d => d.version))) : [];
      
      res.json({
        chains,
        stages,
        versions
      });
    } catch (error) {
      console.error("Error fetching filter options:", error);
      res.status(500).json({ 
        message: "Failed to fetch filter options",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // API endpoint to get deployment stats
  app.get("/api/stats", async (req, res) => {
    try {
      const deployments = await fetchLayerZeroDeployments();
      
      const totalDeployments = deployments.length;
      const uniqueChains = deployments.length > 0 ? new Set(deployments.map(d => d.chainKey)).size : 0;
      const latestUpdate = new Date().toISOString().split('T')[0]; // Today's date in YYYY-MM-DD format
      
      res.json({
        totalDeployments,
        uniqueChains,
        latestUpdate
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ 
        message: "Failed to fetch stats",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // API endpoint to get network graph data
  app.get("/api/network", async (req, res) => {
    try {
      const deployments = await fetchLayerZeroDeployments();
      
      if (deployments.length === 0) {
        // Return empty network data if no deployments
        return res.json({
          nodes: [],
          links: []
        });
      }
      
      // Create nodes for each unique chain
      const chainsSet = new Set(deployments.map(d => d.chainKey));
      const chains = Array.from(chainsSet);
      
      const nodes = chains.map((chain, index) => {
        // Find a deployment for this chain to get its EID
        const deployment = deployments.find(d => d.chainKey === chain);
        return {
          id: chain,
          name: chain,
          eid: deployment?.eid || "",
          stage: deployment?.stage || "",
          connections: 0, // Will count later
          group: index % 5 // Group for coloring (0-4)
        };
      });
      
      // Create links between chains (simplified approach - all chains are connected to each other)
      // In a real implementation, you'd need to analyze actual connections from the data
      const links = [];
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          links.push({
            source: nodes[i].id,
            target: nodes[j].id,
            value: 1 // Connection strength
          });
          
          // Increment connection count for both nodes
          nodes[i].connections++;
          nodes[j].connections++;
        }
      }
      
      res.json({
        nodes,
        links
      });
    } catch (error) {
      console.error("Error generating network data:", error);
      res.status(500).json({ 
        message: "Failed to generate network data",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
