"use server";

import { db } from "@/lib/db";
import { purchaseOrders, poItems, stocks, stockMovements, suppliers, products } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { POWithDetails, CreatePOInput, POStatus } from "../types";

export async function getPurchaseOrders(): Promise<POWithDetails[]> {
  try {
    const pos = await db.select().from(purchaseOrders)
      .leftJoin(suppliers, eq(purchaseOrders.supplierId, suppliers.id))
      .orderBy(sql`${purchaseOrders.orderDate} DESC`);

    const result: POWithDetails[] = [];

    for (const row of pos) {
      const items = await db.select()
        .from(poItems)
        .leftJoin(products, eq(poItems.productId, products.id))
        .where(eq(poItems.poId, row.purchase_orders.id));

      result.push({
        ...row.purchase_orders,
        supplier: row.suppliers ?? null,
        items: items.map(i => ({
          ...i.po_items,
          product: i.products!
        }))
      });
    }

    return result;
  } catch (error) {
    console.error("Failed to fetch purchase orders:", error);
    return [];
  }
}

export async function getPurchaseOrderById(id: string): Promise<POWithDetails | null> {
  try {
    const [po] = await db.select()
      .from(purchaseOrders)
      .leftJoin(suppliers, eq(purchaseOrders.supplierId, suppliers.id))
      .where(eq(purchaseOrders.id, id))
      .limit(1);

    if (!po) return null;

    const items = await db.select()
      .from(poItems)
      .leftJoin(products, eq(poItems.productId, products.id))
      .where(eq(poItems.poId, id));

    return {
      ...po.purchase_orders,
      supplier: po.suppliers ?? null,
      items: items.map(i => ({
        ...i.po_items,
        product: i.products!
      }))
    };
  } catch (error) {
    console.error("Failed to fetch purchase order:", error);
    return null;
  }
}

export async function createPO(data: CreatePOInput) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { error: "Unauthorized" };

  return _createPO(data, userId);
}

export async function _createPO(data: CreatePOInput, userId: string) {
  try {
    const totalAmount = data.items.reduce((acc, item) => acc + item.quantity * item.unitCost, 0);

    return await db.transaction(async (tx) => {
      const [newPO] = await tx.insert(purchaseOrders).values({
        supplierId: data.supplierId,
        userId: userId,
        totalAmount: totalAmount.toString(),
        status: "REQUEST",
      }).returning();

      await tx.insert(poItems).values(
        data.items.map((item) => ({
          poId: newPO.id,
          productId: item.productId,
          quantity: item.quantity,
          unitCost: item.unitCost.toString(),
          subtotal: (item.quantity * item.unitCost).toString(),
        }))
      );

      try {
        revalidatePath("/procurement");
      } catch (e) {
        // Ignore revalidatePath errors in non-Next environments
      }
      return { success: true, id: newPO.id };
    });
  } catch (error) {
    console.error("Failed to create purchase order:", error);
    return { error: "Failed to create purchase order" };
  }
}

export async function updatePOStatus(id: string, newStatus: POStatus) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { error: "Unauthorized" };

  return _updatePOStatus(id, newStatus, userId);
}

export async function _updatePOStatus(id: string, newStatus: POStatus, userId: string) {
  try {
    const po = await getPurchaseOrderById(id);
    if (!po) return { error: "Purchase order not found" };

    if (po.status === "RECEIVED") {
      return { error: "Cannot change status of a received order" };
    }

    if (newStatus === "RECEIVED") {
      return await db.transaction(async (tx) => {
        // 1. Update PO status
        await tx.update(purchaseOrders)
          .set({ status: "RECEIVED" })
          .where(eq(purchaseOrders.id, id));

        // 2. Process each item
        for (const item of po.items) {
          // Update Stocks
          await tx.insert(stocks)
            .values({
              productId: item.productId,
              quantity: item.quantity,
              lastUpdated: new Date(),
            })
            .onConflictDoUpdate({
              target: stocks.productId,
              set: {
                quantity: sql`${stocks.quantity} + ${item.quantity}`,
                lastUpdated: new Date(),
              },
            });

          // Insert Stock Movement
          await tx.insert(stockMovements).values({
            productId: item.productId,
            changeQuantity: item.quantity,
            type: "PURCHASE",
            referenceId: po.id,
            userId: userId,
          });
        }

        try {
          revalidatePath("/procurement");
          revalidatePath("/products");
        } catch (e) {
          // Ignore
        }
        return { success: true };
      });
    } else {
      await db.update(purchaseOrders)
        .set({ status: newStatus })
        .where(eq(purchaseOrders.id, id));
      
      try {
        revalidatePath("/procurement");
      } catch (e) {
        // Ignore
      }
      return { success: true };
    }
  } catch (error) {
    console.error("Failed to update purchase order status:", error);
    return { error: "Failed to update purchase order status" };
  }
}
