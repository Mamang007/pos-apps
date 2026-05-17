import { db } from "@/lib/db";
import { discounts, vouchers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function seedPromotions() {
  console.log("Creating promotional rules...");
  const discountData = [
    { 
      name: "New Customer 10%", 
      type: "PERCENTAGE" as const, 
      value: "10", 
      minPurchase: "0", 
      isActive: true 
    },
    { 
      name: "Ramadan Fixed 50k", 
      type: "FIXED" as const, 
      value: "50000", 
      minPurchase: "250000", 
      isActive: true 
    },
    { 
      name: "Flash Sale 50%", 
      type: "PERCENTAGE" as const, 
      value: "50", 
      minPurchase: "100000", 
      maxDiscount: "75000", 
      isActive: false 
    },
  ];

  for (const d of discountData) {
    const existing = await db.select().from(discounts).where(eq(discounts.name, d.name)).limit(1);
    if (existing.length === 0) {
      await db.insert(discounts).values({
        name: d.name,
        type: d.type,
        value: d.value,
        minPurchase: d.minPurchase,
        maxDiscount: d.maxDiscount || null,
        isActive: d.isActive,
      });
      console.log(`Discount rule ${d.name} created.`);
    }
  }

  // Seed some vouchers
  console.log("Creating sample vouchers...");
  const allDiscounts = await db.select().from(discounts);
  const newCustomerRule = allDiscounts.find(d => d.name === "New Customer 10%");
  
  if (newCustomerRule) {
    const sampleVouchers = ["WELCOME10", "PROMO2026"];
    for (const code of sampleVouchers) {
      const existing = await db.select().from(vouchers).where(eq(vouchers.code, code)).limit(1);
      if (existing.length === 0) {
        await db.insert(vouchers).values({
          code,
          discountId: newCustomerRule.id,
        });
        console.log(`Voucher ${code} created.`);
      }
    }
  }
}
