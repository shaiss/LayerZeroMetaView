import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Original users table (keeping for reference)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// New tables for LayerZero data
export const deployments = pgTable("deployments", {
  id: serial("id").primaryKey(),
  chainKey: text("chain_key").notNull(),
  eid: text("eid").notNull(),
  stage: text("stage").notNull(),
  endpoint: jsonb("endpoint").notNull(),
  relayerV2: jsonb("relayer_v2"),
  ultraLightNodeV2: jsonb("ultra_light_node_v2"),
  sendUln301: jsonb("send_uln_301"),
  receiveUln301: jsonb("receive_uln_301"),
  nonceContract: jsonb("nonce_contract"),
  version: integer("version").notNull(),
  timestamp: text("timestamp"),
  isActive: boolean("is_active").default(true),
  rawData: jsonb("raw_data").notNull(),
});

export const insertDeploymentSchema = createInsertSchema(deployments).omit({
  id: true,
});

export type InsertDeployment = z.infer<typeof insertDeploymentSchema>;
export type Deployment = typeof deployments.$inferSelect;
