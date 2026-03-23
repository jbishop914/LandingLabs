import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertProjectSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Simple session tracking via in-memory map (no cookies needed for demo)
  const sessions = new Map<string, number>();

  // Auth: Signup
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const parsed = insertUserSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid input", details: parsed.error.errors });
      }

      const existing = await storage.getUserByUsername(parsed.data.username);
      if (existing) {
        return res.status(409).json({ error: "Username already taken" });
      }

      const user = await storage.createUser(parsed.data);
      const sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      sessions.set(sessionId, user.id);

      // Set session header for client
      res.setHeader("X-Session-Id", sessionId);
      res.json({ success: true, user: { id: user.id, username: user.username, subscriptionStatus: user.subscriptionStatus } });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Auth: Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      sessions.set(sessionId, user.id);

      res.setHeader("X-Session-Id", sessionId);
      res.json({ success: true, user: { id: user.id, username: user.username, subscriptionStatus: user.subscriptionStatus } });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Auth: Get current user
  app.get("/api/auth/me", async (req, res) => {
    // For demo purposes, return the last created user or a mock
    const sessionId = req.headers["x-session-id"] as string;
    const userId = sessionId ? sessions.get(sessionId) : undefined;

    if (userId) {
      const user = await storage.getUser(userId);
      if (user) {
        return res.json({ id: user.id, username: user.username, subscriptionStatus: user.subscriptionStatus, email: user.email });
      }
    }

    // Fallback: return first user if exists
    const users = await storage.getUserByUsername("demo");
    if (users) {
      return res.json({ id: users.id, username: users.username, subscriptionStatus: users.subscriptionStatus });
    }

    res.status(401).json({ error: "Not authenticated" });
  });

  // Auth: Logout
  app.post("/api/auth/logout", (req, res) => {
    const sessionId = req.headers["x-session-id"] as string;
    if (sessionId) sessions.delete(sessionId);
    res.json({ success: true });
  });

  // Projects: List
  app.get("/api/projects", async (req, res) => {
    try {
      // For demo, return all projects for user 1
      const projectList = await storage.getProjectsByUser(1);
      res.json(projectList);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Projects: Create
  app.post("/api/projects", async (req, res) => {
    try {
      const project = await storage.createProject({
        ...req.body,
        userId: req.body.userId || 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      res.json(project);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Projects: Get single
  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProject(parseInt(req.params.id));
      if (!project) return res.status(404).json({ error: "Not found" });
      res.json(project);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Projects: Update
  app.patch("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.updateProject(parseInt(req.params.id), {
        ...req.body,
        updatedAt: new Date().toISOString(),
      });
      if (!project) return res.status(404).json({ error: "Not found" });
      res.json(project);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Projects: Delete
  app.delete("/api/projects/:id", async (req, res) => {
    try {
      await storage.deleteProject(parseInt(req.params.id));
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  return httpServer;
}
