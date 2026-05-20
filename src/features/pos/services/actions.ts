"use server";

import { db } from "@/lib/db";
import { 
  salesOrders, 
  soItems, 
  salesOrderPayments, 
  stocks, 
  stockMovements, 
  customers, 
  products,
  vouchers,
  categories,
  users
} from "@/lib/db/schema";
import { eq, sql, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { CheckoutInput, Product, Customer, SalesOrderWithDetails } from "../types";

export async function getPOSProducts(): Promise<Product[]> {
  try {
    const results = await db.select({
      product: products,
      stock: stocks.quantity,
    })
    .from(products)
    .leftJoin(stocks, eq(products.id, stocks.productId));

    return results.map(r => ({
      ...r.product,
      stock: r.stock ?? 0
    }));
  } catch (error) {
    console.error("Failed to fetch POS products:", error);
    return [];
  }
}

export async function getPOSCustomers(): Promise<Customer[]> {
  try {
    return await db.select().from(customers);
  } catch (error) {
    console.error("Failed to fetch POS customers:", error);
    return [];
  }
}

export async function getSalesOrders(): Promise<SalesOrderWithDetails[]> {
  try {
    const orders = await db.select()
      .from(salesOrders)
      .leftJoin(customers, eq(salesOrders.customerId, customers.id))
      .innerJoin(users, eq(salesOrders.userId, users.id))
      .orderBy(desc(salesOrders.saleDate));

    const result: SalesOrderWithDetails[] = [];

    for (const row of orders) {
      const items = await db.select()
        .from(soItems)
        .leftJoin(products, eq(soItems.productId, products.id))
        .where(eq(soItems.soId, row.sales_orders.id));

      const payments = await db.select()
        .from(salesOrderPayments)
        .where(eq(salesOrderPayments.soId, row.sales_orders.id));

      result.push({
        ...row.sales_orders,
        customer: row.customers,
        user: row.users,
        items: items.map(i => ({
          ...i.so_items,
          product: i.products!
        })),
        payments: payments
      });
    }

    return result;
  } catch (error) {
    console.error("Failed to fetch sales orders:", error);
    return [];
  }
}

export async function getSalesOrderById(id: string): Promise<SalesOrderWithDetails | null> {
  try {
    const [row] = await db.select()
      .from(salesOrders)
      .leftJoin(customers, eq(salesOrders.customerId, customers.id))
      .innerJoin(users, eq(salesOrders.userId, users.id))
      .where(eq(salesOrders.id, id))
      .limit(1);

    if (!row) return null;

    const items = await db.select()
      .from(soItems)
      .leftJoin(products, eq(soItems.productId, products.id))
      .where(eq(soItems.soId, id));

    const payments = await db.select()
      .from(salesOrderPayments)
      .where(eq(salesOrderPayments.soId, id));

    return {
      ...row.sales_orders,
      customer: row.customers,
      user: row.users,
      items: items.map(i => ({
        ...i.so_items,
        product: i.products!
      })),
      payments: payments
    };
  } catch (error) {
    console.error("Failed to fetch sales order:", error);
    return null;
  }
}

export async function checkoutAction(data: CheckoutInput) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { error: "Unauthorized" };

  try {
    return await db.transaction(async (tx) => {
      // 1. Validate stock levels
      for (const item of data.items) {
        const [stock] = await tx
          .select()
          .from(stocks)
          .where(eq(stocks.productId, item.productId))
          .limit(1);

        if (!stock || stock.quantity < item.quantity) {
          const [product] = await tx
            .select()
            .from(products)
            .where(eq(products.id, item.productId))
            .limit(1);
          throw new Error(`Insufficient stock for ${product?.name || "product"}`);
        }
      }

      // 2. Insert into sales_orders
      const [newSO] = await tx.insert(salesOrders).values({
        customerId: data.customerId || null,
        userId: userId,
        subtotal: data.subtotal.toString(),
        taxAmount: data.taxAmount.toString(),
        discountAmount: data.discountAmount.toString(),
        totalAmount: data.totalAmount.toString(),
        status: "COMPLETED",
      }).returning();

      // 3. Insert into so_items and update stocks
      for (const item of data.items) {
        await tx.insert(soItems).values({
          soId: newSO.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice.toString(),
          discountAmount: "0", // Simplified for now
          taxAmount: "0", // Simplified for now
          subtotal: item.subtotal.toString(),
        });

        // Update physical stock
        await tx.update(stocks)
          .set({
            quantity: sql`${stocks.quantity} - ${item.quantity}`,
            lastUpdated: new Date(),
          })
          .where(eq(stocks.productId, item.productId));

        // Record stock movement
        await tx.insert(stockMovements).values({
          productId: item.productId,
          changeQuantity: -item.quantity,
          type: "SALE",
          referenceId: newSO.id,
          userId: userId,
        });
      }

      // 4. Insert payment
      await tx.insert(salesOrderPayments).values({
        soId: newSO.id,
        paymentMethod: data.paymentMethod,
        amount: data.amountPaid.toString(),
        createdAt: new Date(),
      });

      // 5. Update customer loyalty points if applicable
      if (data.customerId) {
        const pointsEarned = Math.floor(data.totalAmount / 10000); // 1 point per 10k
        await tx.update(customers)
          .set({
            loyaltyPoints: sql`${customers.loyaltyPoints} + ${pointsEarned}`,
          })
          .where(eq(customers.id, data.customerId));
      }

      // 6. Mark voucher as used if applicable
      if (data.voucherCode) {
        await tx.update(vouchers)
          .set({
            isUsed: true,
            usedAt: new Date(),
          })
          .where(eq(vouchers.code, data.voucherCode));
      }

      revalidatePath("/procurement"); // For stock levels
      revalidatePath("/products");
      revalidatePath("/sales"); // For sales history
      
      return { success: true, id: newSO.id };
    });
  } catch (error: any) {
    console.error("Checkout failed:", error);
    return { error: error.message || "Checkout failed" };
  }
}
