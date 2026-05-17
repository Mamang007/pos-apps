"use server";

import { db } from "@/lib/db";
import { customers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { customerSchema, type CustomerInput } from "../types";

export async function getCustomers() {
  try {
    return await db.select().from(customers).orderBy(customers.name);
  } catch (error) {
    console.error("Failed to fetch customers:", error);
    return [];
  }
}

export async function createCustomer(data: CustomerInput) {
  try {
    const validated = customerSchema.parse(data);
    
    await db.insert(customers).values({
      code: validated.code || null,
      name: validated.name,
      address: validated.address,
      phone: validated.phone,
      email: validated.email,
      loyaltyPoints: validated.loyaltyPoints,
    });
    revalidatePath("/customers");
    return { success: true };
  } catch (error: any) {
    const errorMessage = error.message || "";
    const detail = error.detail || error.cause?.message || "";
    
    if (errorMessage.includes("customers_code_unique") || detail.includes("customers_code_unique")) {
      return { error: "Customer code already exists" };
    }
    
    if (error.name === "ZodError") {
      return { error: error.errors[0]?.message || "Validation failed" };
    }

    console.error("Failed to create customer:", error);
    return { error: "Failed to create customer" };
  }
}

export async function updateCustomer(id: string, data: CustomerInput) {
  try {
    const validated = customerSchema.parse(data);
    
    await db.update(customers)
      .set({
        code: validated.code || null,
        name: validated.name,
        address: validated.address,
        phone: validated.phone,
        email: validated.email,
        loyaltyPoints: validated.loyaltyPoints,
        updatedAt: new Date(),
      })
      .where(eq(customers.id, id));
    revalidatePath("/customers");
    return { success: true };
  } catch (error: any) {
    const errorMessage = error.message || "";
    const detail = error.detail || error.cause?.message || "";
    
    if (errorMessage.includes("customers_code_unique") || detail.includes("customers_code_unique")) {
      return { error: "Customer code already exists" };
    }

    if (error.name === "ZodError") {
      return { error: error.errors[0]?.message || "Validation failed" };
    }

    console.error("Failed to update customer:", error);
    return { error: "Failed to update customer" };
  }
}

export async function deleteCustomer(id: string) {
  try {
    await db.delete(customers).where(eq(customers.id, id));
    revalidatePath("/customers");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete customer:", error);
    return { error: "Failed to delete customer" };
  }
}
