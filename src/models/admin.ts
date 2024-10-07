// models/admin.ts
import { z } from "zod";

// Define the zod schema for admin data
export const AdminSchema = z.object({
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  sessionCost: z.number().min(0, "Session cost must be a positive number"),
  lotLimit: z.number().int().min(0, "Lot limit must be a non-negative integer"),
  queueLimit: z.number().int().min(0, "Queue limit must be a non-negative integer"),
  createdAt: z.date().default(new Date()),
  updatedAt: z.date().default(new Date()),
});
