"use server";

import { db } from "@/lib/db";
import { roles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { roleSchema, type RoleInput } from "../types";

export async function getRoles() {
  try {
    return await db.select().from(roles).orderBy(roles.name);
  } catch (error) {
    console.error("Failed to fetch roles:", error);
    return [];
  }
}

export async function createRole(data: RoleInput) {
  const validated = roleSchema.parse(data);
  
  try {
    await db.insert(roles).values({
      name: validated.name,
      permissions: validated.permissions,
    });
    revalidatePath("/roles");
    return { success: true };
  } catch (error) {
    console.error("Failed to create role:", error);
    return { error: "Failed to create role" };
  }
}

export async function updateRole(id: string, data: RoleInput) {
  const validated = roleSchema.parse(data);
  
  try {
    await db.update(roles)
      .set({
        name: validated.name,
        permissions: validated.permissions,
        updatedAt: new Date(),
      })
      .where(eq(roles.id, id));
    revalidatePath("/roles");
    return { success: true };
  } catch (error) {
    console.error("Failed to update role:", error);
    return { error: "Failed to update role" };
  }
}

export async function deleteRole(id: string) {
  try {
    await db.delete(roles).where(eq(roles.id, id));
    revalidatePath("/roles");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete role:", error);
    return { error: "Failed to delete role" };
  }
}
