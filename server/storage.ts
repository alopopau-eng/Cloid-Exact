import { users, insuranceApplications, type User, type InsertUser, type InsuranceApplication, type InsertInsuranceApplication } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createInsuranceApplication(application: InsertInsuranceApplication): Promise<InsuranceApplication>;
  getInsuranceApplications(): Promise<InsuranceApplication[]>;
  getInsuranceApplication(id: string): Promise<InsuranceApplication | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createInsuranceApplication(insertApplication: InsertInsuranceApplication): Promise<InsuranceApplication> {
    const [application] = await db
      .insert(insuranceApplications)
      .values(insertApplication)
      .returning();
    return application;
  }

  async getInsuranceApplications(): Promise<InsuranceApplication[]> {
    return await db.select().from(insuranceApplications);
  }

  async getInsuranceApplication(id: string): Promise<InsuranceApplication | undefined> {
    const [application] = await db.select().from(insuranceApplications).where(eq(insuranceApplications.id, id));
    return application || undefined;
  }
}

export const storage = new DatabaseStorage();
