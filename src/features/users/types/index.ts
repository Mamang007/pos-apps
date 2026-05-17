import { z } from "zod";
import { users } from "@/lib/db/schema";
import { type Role } from "../../roles/types";

export const userSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
  roleId: z.string().uuid("Please select a role"),
});

export type UserInput = z.infer<typeof userSchema>;
export type User = typeof users.$inferSelect;

export type UserWithRole = User & {
  role: Role | null;
};
