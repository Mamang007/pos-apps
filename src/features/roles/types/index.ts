import { z } from "zod";
import { roles } from "@/lib/db/schema";

export const roleSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Name is required"),
  permissions: z.array(z.string()).default([]),
});

export type RoleInput = z.infer<typeof roleSchema>;
export type Role = typeof roles.$inferSelect;

export const AVAILABLE_PERMISSIONS = [
  { id: "dashboard.view", label: "View Dashboard" },
  { id: "pos.view", label: "View POS" },
  { id: "pos.transact", label: "Make Transactions" },
  { id: "products.view", label: "View Products" },
  { id: "products.manage", label: "Manage Products" },
  { id: "categories.view", label: "View Categories" },
  { id: "categories.manage", label: "Manage Categories" },
  { id: "suppliers.view", label: "View Suppliers" },
  { id: "suppliers.manage", label: "Manage Suppliers" },
  { id: "customers.view", label: "View Customers" },
  { id: "customers.manage", label: "Manage Customers" },
  { id: "users.view", label: "View Users" },
  { id: "users.manage", label: "Manage Users" },
  { id: "roles.view", label: "View Roles" },
  { id: "roles.manage", label: "Manage Roles" },
  { id: "reports.view", label: "View Reports" },
  { id: "settings.manage", label: "Manage Settings" },
];
