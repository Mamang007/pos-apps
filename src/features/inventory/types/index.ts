import { stocks, products, categories, stockMovements, users } from "@/lib/db/schema";
import { type InferSelectModel } from "drizzle-orm";

export type Stock = InferSelectModel<typeof stocks>;
export type Product = InferSelectModel<typeof products>;
export type Category = InferSelectModel<typeof categories>;
export type StockMovement = InferSelectModel<typeof stockMovements>;
export type User = InferSelectModel<typeof users>;

export interface StockWithDetails extends Stock {
  product: Product & {
    category: Category | null;
  };
}

export interface StockMovementWithDetails extends StockMovement {
  product: Product;
  user: User;
}

export interface AdjustStockInput {
  productId: string;
  changeQuantity: number;
  type: "ADJUSTMENT" | "RETURN";
  reason?: string;
}
