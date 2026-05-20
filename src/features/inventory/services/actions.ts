"use server";

import { db } from "@/lib/db";
import { 
  stocks, 
  products, 
  categories, 
  stockMovements, 
  users 
} from "@/lib/db/schema";
import { eq, sql, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { 
  StockWithDetails, 
  StockMovementWithDetails, 
  AdjustStockInput 
} from "../types";

export async function getStocks(): Promise<StockWithDetails[]> {
  try {
    const results = await db.select({
      stock: stocks,
      product: products,
      category: categories,
    })
    .from(stocks)
    .innerJoin(products, eq(stocks.productId, products.id))
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .orderBy(products.name);

    return results.map(r => ({
      ...r.stock,
      product: {
        ...r.product,
        category: r.category
      }
    }));
  } catch (error) {
    console.error("Failed to fetch stocks:", error);
    return [];
  }
}

export async function getStockMovements(productId?: string): Promise<StockMovementWithDetails[]> {
  try {
    let query = db.select({
      movement: stockMovements,
      product: products,
      user: users,
    })
    .from(stockMovements)
    .innerJoin(products, eq(stockMovements.productId, products.id))
    .innerJoin(users, eq(stockMovements.userId, users.id));

    if (productId) {
      query = query.where(eq(stockMovements.productId, productId)) as any;
    }

    const results = await query.orderBy(desc(stockMovements.createdAt));

    return results.map(r => ({
      ...r.movement,
      product: r.product,
      user: r.user
    }));
  } catch (error) {
    console.error("Failed to fetch stock movements:", error);
    return [];
  }
}

export async function adjustStock(data: AdjustStockInput) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { error: "Unauthorized" };

  try {
    return await db.transaction(async (tx) => {
      // 1. Update/Insert stock
      await tx.insert(stocks)
        .values({
          productId: data.productId,
          quantity: data.changeQuantity,
          lastUpdated: new Date(),
        })
        .onConflictDoUpdate({
          target: stocks.productId,
          set: {
            quantity: sql`${stocks.quantity} + ${data.changeQuantity}`,
            lastUpdated: new Date(),
          }
        });

      // 2. Record movement
      await tx.insert(stockMovements).values({
        productId: data.productId,
        changeQuantity: data.changeQuantity,
        type: data.type,
        userId: userId,
        // Using userId as a proxy for the reason if referenceId is null, 
        // but schema.ts doesn't have a reason column. 
        // We'll stick to the schema for now.
      });

      revalidatePath("/inventory");
      revalidatePath("/pos");
      revalidatePath("/");
      
      return { success: true };
    });
  } catch (error: any) {
    console.error("Stock adjustment failed:", error);
    return { error: error.message || "Adjustment failed" };
  }
}
