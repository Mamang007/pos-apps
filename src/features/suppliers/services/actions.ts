"use server";

import { db } from "@/lib/db";
import { suppliers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { supplierSchema, type SupplierInput } from "../types";

export async function getSuppliers() {
  try {
    return await db.select().from(suppliers).orderBy(suppliers.name);
  } catch (error) {
    console.error("Failed to fetch suppliers:", error);
    return [];
  }
}

export async function createSupplier(data: SupplierInput) {
  const validated = supplierSchema.parse(data);
  
  try {
    await db.insert(suppliers).values({
      code: validated.code,
      name: validated.name,
      contactName: validated.contactName,
      phone: validated.phone,
      email: validated.email,
      address: validated.address,
    });
    revalidatePath("/suppliers");
    return { success: true };
  } catch (error: any) {
    if (error.message?.includes("suppliers_code_unique")) {
      return { error: "Supplier code already exists" };
    }
    console.error("Failed to create supplier:", error);
    return { error: "Failed to create supplier" };
  }
}

export async function updateSupplier(id: string, data: SupplierInput) {
  const validated = supplierSchema.parse(data);
  
  try {
    await db.update(suppliers)
      .set({
        code: validated.code,
        name: validated.name,
        contactName: validated.contactName,
        phone: validated.phone,
        email: validated.email,
        address: validated.address,
        updatedAt: new Date(),
      })
      .where(eq(suppliers.id, id));
    revalidatePath("/suppliers");
    return { success: true };
  } catch (error) {
    console.error("Failed to update supplier:", error);
    return { error: "Failed to update supplier" };
  }
}

export async function deleteSupplier(id: string) {
  try {
    await db.delete(suppliers).where(eq(suppliers.id, id));
    revalidatePath("/suppliers");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete supplier:", error);
    return { error: "Failed to delete supplier" };
  }
}
