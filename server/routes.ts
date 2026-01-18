import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insuranceFormSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.post("/api/insurance/apply", async (req, res) => {
    try {
      const validatedData = insuranceFormSchema.parse(req.body);
      
      const application = await storage.createInsuranceApplication({
        nationalId: validatedData.nationalId,
        birthDay: validatedData.birthDay,
        birthMonth: validatedData.birthMonth,
        birthYear: validatedData.birthYear,
        isHijri: validatedData.isHijri,
        phoneNumber: validatedData.phoneNumber,
        acceptMarketing: validatedData.acceptMarketing,
        carInsurance: validatedData.carInsurance,
        healthInsurance: validatedData.healthInsurance,
        generalInsurance: validatedData.generalInsurance,
        protectionAndSavings: validatedData.protectionAndSavings,
      });

      res.json({ success: true, application });
    } catch (error) {
      res.status(400).json({ success: false, error: "Invalid data" });
    }
  });

  app.get("/api/insurance/applications", async (req, res) => {
    const applications = await storage.getInsuranceApplications();
    res.json(applications);
  });

  app.get("/api/insurance/applications/:id", async (req, res) => {
    const application = await storage.getInsuranceApplication(req.params.id);
    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }
    res.json(application);
  });

  return httpServer;
}
