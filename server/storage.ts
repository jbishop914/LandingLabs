import { type User, type InsertUser, type Project, type InsertProject, users, projects } from "@shared/schema";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { eq } from "drizzle-orm";

const sqlite = new Database("data.db");
sqlite.pragma("journal_mode = WAL");

export const db = drizzle(sqlite);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getProjectsByUser(userId: number): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, updates: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    return db.select().from(users).where(eq(users.id, id)).get();
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return db.select().from(users).where(eq(users.username, username)).get();
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    return db.insert(users).values({
      ...insertUser,
      trialStartedAt: new Date().toISOString(),
      subscriptionStatus: "trial",
    }).returning().get();
  }

  async getProjectsByUser(userId: number): Promise<Project[]> {
    return db.select().from(projects).where(eq(projects.userId, userId)).all();
  }

  async getProject(id: number): Promise<Project | undefined> {
    return db.select().from(projects).where(eq(projects.id, id)).get();
  }

  async createProject(project: InsertProject): Promise<Project> {
    return db.insert(projects).values(project).returning().get();
  }

  async updateProject(id: number, updates: Partial<InsertProject>): Promise<Project | undefined> {
    return db.update(projects).set(updates).where(eq(projects.id, id)).returning().get();
  }

  async deleteProject(id: number): Promise<void> {
    db.delete(projects).where(eq(projects.id, id)).run();
  }
}

export const storage = new DatabaseStorage();
