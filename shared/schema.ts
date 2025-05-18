import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  fullName: text("full_name"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
});

// Projects table for storing user projects
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  userId: integer("user_id").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const insertProjectSchema = createInsertSchema(projects).pick({
  name: true,
  description: true,
  userId: true,
});

// Files table for storing project files
export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  path: text("path").notNull(),
  content: text("content"),
  projectId: integer("project_id").notNull(),
  isFolder: boolean("is_folder").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const insertFileSchema = createInsertSchema(files).pick({
  name: true,
  path: true,
  content: true,
  projectId: true,
  isFolder: true,
});

// Deployments table for tracking Azure deployments
export const deployments = pgTable("deployments", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  userId: integer("user_id").notNull(),
  status: text("status").notNull(),
  resourceGroup: text("resource_group"),
  region: text("region"),
  serviceName: text("service_name"),
  serviceType: text("service_type"),
  deploymentUrl: text("deployment_url"),
  deploymentDetails: jsonb("deployment_details"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const insertDeploymentSchema = createInsertSchema(deployments).pick({
  projectId: true,
  userId: true,
  status: true,
  resourceGroup: true,
  region: true,
  serviceName: true,
  serviceType: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

export type InsertFile = z.infer<typeof insertFileSchema>;
export type File = typeof files.$inferSelect;

export type InsertDeployment = z.infer<typeof insertDeploymentSchema>;
export type Deployment = typeof deployments.$inferSelect;

// Code Snippets table for one-click sharing with vanity URLs
export const codeSnippets = pgTable("code_snippets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  code: text("code").notNull(),
  language: text("language").notNull(),
  vanityUrl: text("vanity_url").unique(),
  views: integer("views").default(0),
  complexity: integer("complexity").default(1), // 1-5 scale
  mood: text("mood").default("neutral"), // happy, sad, neutral, confused, etc.
  isPublic: boolean("is_public").default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const insertCodeSnippetSchema = createInsertSchema(codeSnippets).pick({
  userId: true,
  title: true,
  description: true,
  code: true,
  language: true,
  vanityUrl: true,
  complexity: true,
  mood: true,
  isPublic: true,
});

// Git repositories for version control integration
export const gitRepositories = pgTable("git_repositories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  projectId: integer("project_id").notNull(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  provider: text("provider").notNull(), // github, gitlab, azure_devops
  branch: text("branch").notNull().default("main"),
  lastSynced: timestamp("last_synced"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const insertGitRepositorySchema = createInsertSchema(gitRepositories).pick({
  userId: true,
  projectId: true,
  name: true,
  url: true,
  provider: true,
  branch: true,
});

// Collaboration sessions for real-time multi-user editing
export const collaborationSessions = pgTable("collaboration_sessions", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  hostUserId: integer("host_user_id").notNull(),
  sessionKey: text("session_key").notNull().unique(),
  status: text("status").notNull().default("active"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const insertCollaborationSessionSchema = createInsertSchema(collaborationSessions).pick({
  projectId: true,
  hostUserId: true,
  sessionKey: true,
  status: true,
});

// CI/CD Pipelines for Azure DevOps integration
export const cicdPipelines = pgTable("cicd_pipelines", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  provider: text("provider").notNull().default("azure_devops"),
  status: text("status").notNull().default("inactive"),
  configuration: jsonb("configuration"), // Pipeline configuration
  lastRun: timestamp("last_run"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const insertCicdPipelineSchema = createInsertSchema(cicdPipelines).pick({
  projectId: true,
  userId: true,
  name: true,
  provider: true,
  status: true,
  configuration: true,
});

export type InsertCodeSnippet = z.infer<typeof insertCodeSnippetSchema>;
export type CodeSnippet = typeof codeSnippets.$inferSelect;

export type InsertGitRepository = z.infer<typeof insertGitRepositorySchema>;
export type GitRepository = typeof gitRepositories.$inferSelect;

export type InsertCollaborationSession = z.infer<typeof insertCollaborationSessionSchema>;
export type CollaborationSession = typeof collaborationSessions.$inferSelect;

export type InsertCicdPipeline = z.infer<typeof insertCicdPipelineSchema>;
export type CicdPipeline = typeof cicdPipelines.$inferSelect;
