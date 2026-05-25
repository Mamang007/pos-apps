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
  users,
  discounts
} from "@/lib/db/schema";
import { eq, sql, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { CheckoutInput, Product, Customer, SalesOrderWithDetails, CartItem } from "../types";

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

export async function validateVoucherCode(code: string, items: CartItem[]) {
  try {
    const [row] = await db
      .select({
        voucher: vouchers,
        discount: discounts,
      })
      .from(vouchers)
      .innerJoin(discounts, eq(vouchers.discountId, discounts.id))
      .where(eq(vouchers.code, code))
      .limit(1);

    if (!row) return { error: "Voucher code not found" };
    if (row.voucher.isUsed) return { error: "Voucher has already been used" };
    if (!row.discount.isActive) return { error: "This voucher is currently inactive" };

    const subtotal = items.reduce((acc, item) => acc + item.subtotal, 0);
    
    // Check min purchase
    if (subtotal < Number(row.discount.minPurchase)) {
      return { error: `Minimum purchase of IDR ${Number(row.discount.minPurchase).toLocaleString()} required` };
    }

    // Calculate discount amount based on scope
    let discountAmount = 0;
    const { scope, type, value, productId, categoryId, maxDiscount } = row.discount;
    const discountVal = Number(value);

    if (scope === "TRANSACTION") {
      if (type === "PERCENTAGE") {
        discountAmount = (subtotal * discountVal) / 100;
      } else {
        discountAmount = discountVal;
      }
    } else if (scope === "PRODUCT") {
      const eligibleItems = items.filter(item => item.productId === productId);
      if (eligibleItems.length === 0) return { error: "Voucher not applicable to items in cart" };
      
      const eligibleSubtotal = eligibleItems.reduce((acc, item) => acc + item.subtotal, 0);
      if (type === "PERCENTAGE") {
        discountAmount = (eligibleSubtotal * discountVal) / 100;
      } else {
        // Fixed discount on product level usually applies to the whole line or once?
        // Let's assume it applies once to the eligible subtotal.
        discountAmount = Math.min(discountVal, eligibleSubtotal);
      }
    } else if (scope === "CATEGORY") {
      const eligibleItems = items.filter(item => item.categoryId === categoryId);
      if (eligibleItems.length === 0) return { error: "Voucher not applicable to items in cart" };
      
      const eligibleSubtotal = eligibleItems.reduce((acc, item) => acc + item.subtotal, 0);
      if (type === "PERCENTAGE") {
        discountAmount = (eligibleSubtotal * discountVal) / 100;
      } else {
        discountAmount = Math.min(discountVal, eligibleSubtotal);
      }
    }

    // Apply max discount cap
    if (maxDiscount && discountAmount > Number(maxDiscount)) {
      discountAmount = Number(maxDiscount);
    }

    return { success: true, discountAmount, discount: row.discount };
  } catch (error: any) {
    console.error("Voucher validation failed error:", error);
    return { error: `Validation error: ${error.message || "Unknown error"}` };
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

      // 2. Fetch voucher/discount if applicable for internal re-validation
      let discountScope = "TRANSACTION";
      let discountProductId: string | null = null;
      let discountCategoryId: string | null = null;

      if (data.voucherCode) {
        const [row] = await tx
          .select({
            voucher: vouchers,
            discount: discounts,
          })
          .from(vouchers)
          .innerJoin(discounts, eq(vouchers.discountId, discounts.id))
          .where(eq(vouchers.code, data.voucherCode))
          .limit(1);

        if (!row || row.voucher.isUsed) {
          throw new Error("Invalid or used voucher");
        }
        discountScope = row.discount.scope;
        discountProductId = row.discount.productId;
        discountCategoryId = row.discount.categoryId;
      }

      // 3. Insert into sales_orders
      const [newSO] = await tx.insert(salesOrders).values({
        customerId: data.customerId || null,
        userId: userId,
        subtotal: data.subtotal.toString(),
        taxAmount: data.taxAmount.toString(),
        discountAmount: data.discountAmount.toString(),
        totalAmount: data.totalAmount.toString(),
        status: "COMPLETED",
      }).returning();

      // 4. Calculate item-level discount distribution
      // 5. Insert into so_items and update stocks
      for (const item of data.items) {
        let itemDiscount = 0;

        if (data.voucherCode && discountScope !== "TRANSACTION") {
          // If it's a product or category discount, we need to know if this item qualifies
          // We'll need the product's categoryId for CATEGORY scope re-validation
          const [product] = await tx
            .select()
            .from(products)
            .where(eq(products.id, item.productId))
            .limit(1);

          if (discountScope === "PRODUCT" && item.productId === discountProductId) {
             // Calculate proportion of total discount for this product
             // This is complex because of maxDiscount. 
             // Simplification: We already have the total discountAmount from client.
             // If multiple items are eligible, we'd need to distribute.
             // For now, let's assume one product or we distribute by subtotal.
             
             const eligibleItems = data.items.filter(i => i.productId === discountProductId);
             const eligibleSubtotal = eligibleItems.reduce((acc, i) => acc + i.subtotal, 0);
             itemDiscount = (item.subtotal / eligibleSubtotal) * data.discountAmount;
          } else if (discountScope === "CATEGORY" && product?.categoryId === discountCategoryId) {
             // Fetch all eligible items' categories to distribute correctly
             // This is also complex. We'll fetch all product categories in the cart.
             const productIds = data.items.map(i => i.productId);
             const cartProducts = await tx.select().from(products).where(sql`${products.id} IN ${productIds}`);
             const eligibleProductIds = cartProducts.filter(p => p.categoryId === discountCategoryId).map(p => p.id);
             
             const eligibleItems = data.items.filter(i => eligibleProductIds.includes(i.productId));
             const eligibleSubtotal = eligibleItems.reduce((acc, i) => acc + i.subtotal, 0);
             itemDiscount = (item.subtotal / eligibleSubtotal) * data.discountAmount;
          }
        }
        
        await tx.insert(soItems).values({
          soId: newSO.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice.toString(),
          discountAmount: itemDiscount.toFixed(2),
          taxAmount: "0", // Simplified
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

      // 6. Insert payment
      await tx.insert(salesOrderPayments).values({
        soId: newSO.id,
        paymentMethod: data.paymentMethod,
        amount: data.amountPaid.toString(),
        createdAt: new Date(),
      });

      // 7. Update customer loyalty points if applicable
      if (data.customerId) {
        const pointsEarned = Math.floor(data.totalAmount / 10000); // 1 point per 10k
        await tx.update(customers)
          .set({
            loyaltyPoints: sql`${customers.loyaltyPoints} + ${pointsEarned}`,
          })
          .where(eq(customers.id, data.customerId));
      }

      // 8. Mark voucher as used if applicable
      if (data.voucherCode) {
        await tx.update(vouchers)
          .set({
            isUsed: true,
            usedAt: new Date(),
          })
          .where(eq(vouchers.code, data.voucherCode));
      }

      revalidatePath("/procurement");
      revalidatePath("/products");
      revalidatePath("/sales");
      
      return { success: true, id: newSO.id };
    });
  } catch (error: any) {
    console.error("Checkout failed:", error);
    return { error: error.message || "Checkout failed" };
  }
}
