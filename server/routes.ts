import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { WebSocketServer } from "ws";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";
import { executeCodeInContainer } from "./services/container";
import { azureAuthenticate, azureDeploy, azureGetResources } from "./services/azure";
import { aiGenerateCode, aiGenerateContextAwareCode, aiCompleteSuggestions, aiExplainCode, aiDebugCode, aiGenerateChatResponse } from "./services/openai";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // WebSocket server for terminal and real-time collaboration
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: "/ws",
    perMessageDeflate: false,
    clientTracking: true,
    verifyClient: (info, callback) => {
      // Allow all origins
      callback(true);
    }
  });

  // WebSocket connection handler
  wss.on("connection", (ws) => {
    console.log("WebSocket client connected");
    
    ws.on("message", async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === "terminal-command") {
          // Execute command in container and return output
          const output = await executeCodeInContainer(data.command, data.language);
          ws.send(JSON.stringify({ type: "terminal-output", output }));
        }
      } catch (error) {
        console.error("WebSocket error:", error);
        ws.send(JSON.stringify({ type: "error", message: "Error processing message" }));
      }
    });
    
    ws.on("close", () => {
      console.log("WebSocket client disconnected");
    });
  });

  // User routes
  app.post("/api/users/register", async (req: Request, res: Response) => {
    try {
      const userSchema = insertUserSchema.extend({
        confirmPassword: z.string(),
      }).refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
      
      const userData = userSchema.parse(req.body);
      const user = await storage.createUser({
        username: userData.username,
        password: userData.password,
        email: userData.email || "",
        fullName: userData.fullName || "",
      });
      
      res.status(201).json({
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create user" });
      }
    }
  });

  app.post("/api/users/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // In a real app, you would use proper authentication with sessions/JWT
      res.status(200).json({
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
      });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Code execution route
  app.post("/api/execute", async (req: Request, res: Response) => {
    try {
      const { code, language } = req.body;
      
      if (!code || !language) {
        return res.status(400).json({ message: "Code and language are required" });
      }
      
      const output = await executeCodeInContainer(code, language);
      res.status(200).json({ output });
    } catch (error) {
      res.status(500).json({ message: "Code execution failed", error: String(error) });
    }
  });

  // Azure integration routes
  app.get("/api/azure/auth-status", async (req: Request, res: Response) => {
    // Check if user is authenticated with Azure
    // This would typically check for valid tokens in the session
    res.status(200).json({ isAuthenticated: false });
  });

  app.get("/api/azure/login", async (req: Request, res: Response) => {
    try {
      // In a real implementation, this would redirect to Azure login
      const loginUrl = await azureAuthenticate();
      res.redirect(loginUrl);
    } catch (error) {
      res.status(500).json({ message: "Azure authentication failed" });
    }
  });

  app.post("/api/azure/deploy", async (req: Request, res: Response) => {
    try {
      const { resourceGroup, region, serviceName, deploymentType } = req.body;
      
      // In a production app, validate all parameters and authenticate user
      
      const deploymentResult = await azureDeploy({
        resourceGroup: resourceGroup || "default-rg",
        region: region || "eastus",
        serviceName: serviceName || "cloudide-app",
        deploymentType: deploymentType || "AppService"
      });
      
      res.status(200).json(deploymentResult);
    } catch (error) {
      res.status(500).json({ message: "Deployment failed", error: String(error) });
    }
  });

  app.get("/api/azure/resources", async (req: Request, res: Response) => {
    try {
      const { type } = req.query;
      
      if (!type || typeof type !== "string") {
        return res.status(400).json({ message: "Resource type is required" });
      }
      
      const resources = await azureGetResources(type);
      res.status(200).json({ resources });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch Azure resources", error: String(error) });
    }
  });

  // AI assistant routes
  app.post("/api/ai/message", async (req: Request, res: Response) => {
    try {
      const { message, context } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }
      
      const response = await aiGenerateChatResponse(message, context || "");
      res.status(200).json({ response });
    } catch (error) {
      res.status(500).json({ message: "AI processing failed", error: String(error) });
    }
  });

  app.post("/api/ai/generate-code", async (req: Request, res: Response) => {
    try {
      const { prompt, language, context } = req.body;
      
      if (!prompt || !language) {
        return res.status(400).json({ message: "Prompt and language are required" });
      }
      
      const code = await aiGenerateCode(prompt, language, context || "");
      res.status(200).json({ code });
    } catch (error) {
      res.status(500).json({ message: "Code generation failed", error: String(error) });
    }
  });
  
  // Context-aware code generation
  app.post("/api/ai/context-aware-code", async (req: Request, res: Response) => {
    try {
      const { prompt, language, codeContext } = req.body;
      
      if (!prompt || !language) {
        return res.status(400).json({ message: "Prompt and language are required" });
      }
      
      // Generate context-aware code with the detailed project context
      const result = await aiGenerateContextAwareCode(prompt, language, codeContext || {});
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: "Context-aware code generation failed", error: String(error) });
    }
  });

  app.post("/api/ai/explain-code", async (req: Request, res: Response) => {
    try {
      const { code, language } = req.body;
      
      if (!code) {
        return res.status(400).json({ message: "Code is required" });
      }
      
      const explanation = await aiExplainCode(code, language || "");
      res.status(200).json({ explanation });
    } catch (error) {
      res.status(500).json({ message: "Code explanation failed", error: String(error) });
    }
  });

  app.post("/api/ai/debug", async (req: Request, res: Response) => {
    try {
      const { code, error, language } = req.body;
      
      if (!code || !error) {
        return res.status(400).json({ message: "Code and error are required" });
      }
      
      const solution = await aiDebugCode(code, error, language || "");
      res.status(200).json({ solution });
    } catch (error) {
      res.status(500).json({ message: "Debugging failed", error: String(error) });
    }
  });

  app.post("/api/ai/completion", async (req: Request, res: Response) => {
    try {
      const { code, position, language } = req.body;
      
      if (!code || !position || !language) {
        return res.status(400).json({ message: "Code, position, and language are required" });
      }
      
      const suggestions = await aiCompleteSuggestions(code, position, language);
      res.status(200).json({ suggestions });
    } catch (error) {
      res.status(500).json({ message: "Completion failed", error: String(error) });
    }
  });

  return httpServer;
}
