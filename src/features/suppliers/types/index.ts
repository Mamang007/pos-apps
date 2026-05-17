import { z } from "zod";
import { suppliers } from "@/lib/db/schema";

export const supplierSchema = z.object({
  id: z.string().uuid().optional(),
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Name is required"),
  contactName: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email("Invalid email address").optional().nullable().or(z.literal("")),
  address: z.string().optional().nullable(),
});

export type SupplierInput = z.infer<typeof supplierSchema>;
export type Supplier = typeof suppliers.$inferSelect;
