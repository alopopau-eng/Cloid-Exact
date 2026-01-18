import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const insuranceFormSchema = z.object({
  nationalId: z.string().min(10, "الرجاء إدخال رقم الهوية الصحيح").max(10),
  birthDay: z.string().min(1, "الرجاء إدخال اليوم"),
  birthMonth: z.string().min(1, "الرجاء إدخال الشهر"),
  birthYear: z.string().min(4, "الرجاء إدخال السنة"),
  isHijri: z.boolean().default(false),
  phoneNumber: z.string().min(9, "الرجاء إدخال رقم جوال صحيح").max(9),
  acceptMarketing: z.boolean().default(true),
  carInsurance: z.boolean().default(true),
  healthInsurance: z.boolean().default(false),
  generalInsurance: z.boolean().default(false),
  protectionAndSavings: z.boolean().default(false),
  vehicleSerial: z.string().optional(),
  vehicleYear: z.string().optional(),
  coverageType: z.enum(["third-party", "comprehensive"]).default("comprehensive"),
  roadsideAssistance: z.boolean().default(false),
  replacementCar: z.boolean().default(false),
  personalAccident: z.boolean().default(false),
  selectedOfferId: z.string().optional(),
  selectedOfferName: z.string().optional(),
  selectedFeatures: z.string().optional(),
  offerTotalPrice: z.string().optional(),
});

export type InsuranceFormData = z.infer<typeof insuranceFormSchema>;

export const insuranceApplications = pgTable("insurance_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nationalId: text("national_id").notNull(),
  birthDay: text("birth_day").notNull(),
  birthMonth: text("birth_month").notNull(),
  birthYear: text("birth_year").notNull(),
  isHijri: boolean("is_hijri").default(false),
  phoneNumber: text("phone_number").notNull(),
  acceptMarketing: boolean("accept_marketing").default(true),
  carInsurance: boolean("car_insurance").default(true),
  healthInsurance: boolean("health_insurance").default(false),
  generalInsurance: boolean("general_insurance").default(false),
  protectionAndSavings: boolean("protection_and_savings").default(false),
  vehicleSerial: text("vehicle_serial"),
  vehicleYear: text("vehicle_year"),
  coverageType: text("coverage_type").default("comprehensive"),
  roadsideAssistance: boolean("roadside_assistance").default(false),
  replacementCar: boolean("replacement_car").default(false),
  personalAccident: boolean("personal_accident").default(false),
  selectedOfferId: text("selected_offer_id"),
  selectedOfferName: text("selected_offer_name"),
  selectedFeatures: text("selected_features"),
  offerTotalPrice: text("offer_total_price"),
});

export const insertInsuranceApplicationSchema = createInsertSchema(insuranceApplications).omit({
  id: true,
});

export type InsertInsuranceApplication = z.infer<typeof insertInsuranceApplicationSchema>;
export type InsuranceApplication = typeof insuranceApplications.$inferSelect;
