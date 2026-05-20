import { purchaseOrders, poItems, suppliers, products } from "@/lib/db/schema";
import { InferSelectModel } from "drizzle-orm";

export type PurchaseOrder = InferSelectModel<typeof purchaseOrders>;
export type POItem = InferSelectModel<typeof poItems>;

export type POWithDetails = PurchaseOrder & {
  supplier: InferSelectModel<typeof suppliers>;
  items: (POItem & {
    product: InferSelectModel<typeof products>;
  })[];
};

export type POStatus = "REQUEST" | "ON PROCESS" | "RECEIVED" | "CANCELLED";

export interface CreatePOInput {
  supplierId: string;
  items: {
    productId: string;
    quantity: number;
    unitCost: number;
  }[];
}
