import { z } from "zod";
import { customers } from "@/lib/db/schema";

export const customerSchema = z.object({
  id: z.string().uuid().optional(),
  code: z.string().optional().nullable().or(z.literal("")),
  name: z.string().min(1, "Name is required"),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email("Invalid email address").optional().nullable().or(z.literal("")),
  loyaltyPoints: z.number().int().min(0).default(0),
});

export type CustomerInput = z.infer<typeof customerSchema>;
export type Customer = typeof customers.$inferSelect;
