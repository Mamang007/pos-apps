"use server";

import { db } from "@/lib/db";
import { salesOrders, products, stocks, customers } from "@/lib/db/schema";
import { eq, sql, gte, and, desc } from "drizzle-orm";

export async function getDashboardStats() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Total Revenue Today
    const [revenueRes] = await db
      .select({
        total: sql<string>`sum(${salesOrders.totalAmount})`,
        count: sql<number>`count(${salesOrders.id})`,
      })
      .from(salesOrders)
      .where(gte(salesOrders.saleDate, today));

    const totalRevenue = Number(revenueRes?.total || 0);
    const transactionCount = Number(revenueRes?.count || 0);
    const averageOrderValue = transactionCount > 0 ? totalRevenue / transactionCount : 0;

    // 2. Low Stock Count
    const [lowStockRes] = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .innerJoin(stocks, eq(products.id, stocks.productId))
      .where(sql`${stocks.quantity} <= ${products.minStockLevel}`);

    // 3. Recent Sales (Last 5)
    const recentSales = await db
      .select({
        id: salesOrders.id,
        total: salesOrders.totalAmount,
        date: salesOrders.saleDate,
        customerName: customers.name,
      })
      .from(salesOrders)
      .leftJoin(customers, eq(salesOrders.customerId, customers.id))
      .orderBy(desc(salesOrders.saleDate))
      .limit(5);

    // 4. Sales Trend (Last 7 Days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const trendRes = await db
      .select({
        date: sql<string>`DATE(${salesOrders.saleDate})`,
        total: sql<string>`sum(${salesOrders.totalAmount})`,
      })
      .from(salesOrders)
      .where(gte(salesOrders.saleDate, sevenDaysAgo))
      .groupBy(sql`DATE(${salesOrders.saleDate})`)
      .orderBy(sql`DATE(${salesOrders.saleDate})`);

    return {
      revenue: totalRevenue,
      transactions: transactionCount,
      avgOrder: averageOrderValue,
      lowStockCount: Number(lowStockRes?.count || 0),
      recentSales,
      trend: trendRes.map(t => ({
        date: t.date,
        total: Number(t.total || 0)
      }))
    };
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    return null;
  }
}
