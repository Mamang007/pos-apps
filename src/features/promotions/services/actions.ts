"use server";

import { db } from "@/lib/db";
import { discounts, vouchers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { 
  discountSchema, 
  type DiscountInput, 
  voucherSchema, 
  type VoucherInput,
  type VoucherWithDiscount
} from "../types";

// --- DISCOUNTS ---

export async function getDiscounts() {
  try {
    return await db.select().from(discounts).orderBy(discounts.name);
  } catch (error) {
    console.error("Failed to fetch discounts:", error);
    return [];
  }
}

export async function createDiscount(data: DiscountInput) {
  try {
    const validated = discountSchema.parse(data);
    
    await db.insert(discounts).values({
      name: validated.name,
      type: validated.type,
      value: validated.value,
      minPurchase: validated.minPurchase,
      maxDiscount: validated.maxDiscount,
      startDate: validated.startDate,
      endDate: validated.endDate,
      isActive: validated.isActive,
    });
    revalidatePath("/promotions");
    return { success: true };
  } catch (error: any) {
    if (error.name === "ZodError") {
      return { error: error.errors[0]?.message || "Validation failed" };
    }
    console.error("Failed to create discount:", error);
    return { error: "Failed to create discount" };
  }
}

export async function updateDiscount(id: string, data: DiscountInput) {
  try {
    const validated = discountSchema.parse(data);
    
    await db.update(discounts)
      .set({
        name: validated.name,
        type: validated.type,
        value: validated.value,
        minPurchase: validated.minPurchase,
        maxDiscount: validated.maxDiscount,
        startDate: validated.startDate,
        endDate: validated.endDate,
        isActive: validated.isActive,
        updatedAt: new Date(),
      })
      .where(eq(discounts.id, id));
    revalidatePath("/promotions");
    return { success: true };
  } catch (error: any) {
    if (error.name === "ZodError") {
      return { error: error.errors[0]?.message || "Validation failed" };
    }
    console.error("Failed to update discount:", error);
    return { error: "Failed to update discount" };
  }
}

export async function deleteDiscount(id: string) {
  try {
    await db.delete(discounts).where(eq(discounts.id, id));
    revalidatePath("/promotions");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete discount:", error);
    return { error: "Failed to delete discount" };
  }
}

// --- VOUCHERS ---

export async function getVouchers(): Promise<VoucherWithDiscount[]> {
  try {
    const data = await db
      .select({
        voucher: vouchers,
        discount: discounts,
      })
      .from(vouchers)
      .leftJoin(discounts, eq(vouchers.discountId, discounts.id))
      .orderBy(vouchers.createdAt);

    return data.map((row) => ({
      ...row.voucher,
      discount: row.discount,
    }));
  } catch (error) {
    console.error("Failed to fetch vouchers:", error);
    return [];
  }
}

export async function createVoucher(data: VoucherInput) {
  try {
    const validated = voucherSchema.parse(data);
    
    await db.insert(vouchers).values({
      code: validated.code,
      discountId: validated.discountId,
    });
    revalidatePath("/promotions");
    return { success: true };
  } catch (error: any) {
    if (error.message?.includes("vouchers_code_unique")) {
      return { error: "Voucher code already exists" };
    }
    if (error.name === "ZodError") {
      return { error: error.errors[0]?.message || "Validation failed" };
    }
    console.error("Failed to create voucher:", error);
    return { error: "Failed to create voucher" };
  }
}

export async function deleteVoucher(id: string) {
  try {
    await db.delete(vouchers).where(eq(vouchers.id, id));
    revalidatePath("/promotions");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete voucher:", error);
    return { error: "Failed to delete voucher" };
  }
}
