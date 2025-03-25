import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { initializeDatabase } from "./db";
import { storage } from "./storage";
import { fetchLayerZeroDeployments } from "./layerzero";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Data syncing function to periodically refresh cache
async function syncDeploymentsData() {
  try {
    log("Starting LayerZero deployments sync", "sync");
    const deployments = await fetchLayerZeroDeployments();
    await storage.cacheDeployments(deployments);
    log(`Synced ${deployments.length} deployments to database`, "sync");
    
    // Schedule next sync
    setTimeout(syncDeploymentsData, 5 * 60 * 1000); // Every 5 minutes
  } catch (error) {
    console.error("Error syncing deployments:", error);
    
    // On error, retry after 1 minute
    setTimeout(syncDeploymentsData, 60 * 1000);
  }
}

(async () => {
  // Initialize database
  try {
    // Migrate and initialize database
    try {
      // Import and run migrations first
      const migrate = (await import('./migrate')).default;
      await migrate();
      log("Database migrations completed", "db");
      
      // Verify database initialization
      const dbInitialized = await initializeDatabase();
      if (dbInitialized) {
        log("Database initialized successfully", "db");
      } else {
        log("Database initialization failed, will use in-memory storage", "db");
      }
    } catch (dbError) {
      console.error("Database setup error:", dbError);
      log("Using in-memory storage instead of database", "db");
    }
    
    // Start data sync process - populate with data regardless of storage type
    await syncDeploymentsData();
    log("Initial data sync completed", "sync");
  } catch (error) {
    console.error("Application initialization error:", error);
  }

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
