import { z } from "zod";
import { products } from "@/lib/db/schema";
import { type Category } from "../../categories/types";

export const productSchema = z.object({
  id: z.string().uuid().optional(),
  categoryId: z.string().uuid("Please select a category").nullable(),
  sku: z.string().min(1, "SKU is required"),
  barcode: z.string().optional().nullable(),
  uom: z.string().min(1, "UOM is required").default("Pcs"),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().nullable(),
  costPrice: z.string().min(1, "Cost price is required"),
  sellPrice: z.string().min(1, "Sell price is required"),
  minStockLevel: z.number().int().min(0).default(0),
});

export type ProductInput = z.infer<typeof productSchema>;
export type Product = typeof products.$inferSelect;

export type ProductWithCategory = Product & {
  category: Category | null;
};
