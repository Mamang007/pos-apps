import { z } from "zod";
import { categories } from "@/lib/db/schema";

export const categorySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

export type CategoryInput = z.infer<typeof categorySchema>;
export type Category = typeof categories.$inferSelect;
