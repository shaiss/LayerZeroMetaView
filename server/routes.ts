import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { fetchLayerZeroDeployments, fetchDeploymentById } from "./layerzero";
import { performCrossChainQuery, getRecentRequests, getRequestById } from "./lzread";
import { ProcessedDeployment, CrossChainQuery } from "@shared/types";

export async function registerRoutes(app: Express): Promise<Server> {
  // API endpoint to get all deployments
  app.get("/api/deployments", async (req, res) => {
    try {
      // Get query parameters for pagination
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = (page - 1) * limit;
      
      // Get deployments from storage (database) with pagination
      const deployments = await storage.getDeploymentsBatch(offset, limit);
      res.json(deployments);
    } catch (error) {
      console.error("Error fetching deployments:", error);
      res.status(500).json({ 
        message: "Failed to fetch deployments",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // API endpoint to get a specific deployment by ID
  app.get("/api/deployments/:id", async (req, res) => {
    try {
      const deploymentId = req.params.id;
      
      // Try to get from database first
      let deployment = await storage.getDeploymentById(deploymentId);
      
      // If not found in database, fetch fresh from API
      if (!deployment) {
        deployment = await fetchDeploymentById(deploymentId);
      }
      
      if (!deployment) {
        return res.status(404).json({ message: "Deployment not found" });
      }
      
      res.json(deployment);
    } catch (error) {
      console.error(`Error fetching deployment ${req.params.id}:`, error);
      res.status(500).json({ 
        message: "Failed to fetch deployment details",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // API endpoint to search deployments with filtering
  app.get("/api/search", async (req, res) => {
    try {
      const chains = req.query.chains ? (req.query.chains as string).split(',') : undefined;
      const stages = req.query.stages ? (req.query.stages as string).split(',') : undefined;
      const versions = req.query.versions 
        ? (req.query.versions as string).split(',').map(v => parseInt(v)) 
        : undefined;
      const searchTerm = req.query.q as string;
      
      const results = await storage.searchDeployments({
        chains,
        stages,
        versions,
        searchTerm
      });
      
      res.json(results);
    } catch (error) {
      console.error("Error searching deployments:", error);
      res.status(500).json({ 
        message: "Failed to search deployments",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // API endpoint to get filter options
  app.get("/api/filter-options", async (req, res) => {
    try {
      const deployments = await storage.getDeployments();
      
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
      const deployments = await storage.getDeployments();
      
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
      const deployments = await storage.getDeployments();
      
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

  // API endpoint to perform a cross-chain query
  app.post("/api/lzread/query", async (req, res) => {
    try {
      const query: CrossChainQuery = req.body;
      
      // Validate required fields
      if (!query.address) {
        return res.status(400).json({ message: "Address is required" });
      }
      if (!query.queryType) {
        return res.status(400).json({ message: "Query type is required" });
      }
      if (!query.chains || !Array.isArray(query.chains) || query.chains.length === 0) {
        return res.status(400).json({ message: "At least one chain must be specified" });
      }
      
      const result = await performCrossChainQuery(query);
      res.json(result);
    } catch (error) {
      console.error("Error performing cross-chain query:", error);
      res.status(500).json({ 
        message: "Failed to perform cross-chain query",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // API endpoint to get recent lzRead requests
  app.get("/api/lzread/recent", (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const recentRequests = getRecentRequests(limit);
      res.json(recentRequests);
    } catch (error) {
      console.error("Error fetching recent requests:", error);
      res.status(500).json({ 
        message: "Failed to fetch recent requests",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // API endpoint to get a specific lzRead request by ID
  app.get("/api/lzread/request/:id", (req, res) => {
    try {
      const requestId = req.params.id;
      const request = getRequestById(requestId);
      
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }
      
      res.json(request);
    } catch (error) {
      console.error(`Error fetching request ${req.params.id}:`, error);
      res.status(500).json({ 
        message: "Failed to fetch request details",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
