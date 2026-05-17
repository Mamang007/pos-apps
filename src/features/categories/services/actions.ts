"use server";

import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { categorySchema, type CategoryInput } from "../types";

export async function getCategories() {
  try {
    return await db.select().from(categories).orderBy(categories.name);
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}

export async function createCategory(data: CategoryInput) {
  const validated = categorySchema.parse(data);
  
  try {
    await db.insert(categories).values({
      name: validated.name,
      description: validated.description,
    });
    revalidatePath("/categories");
    return { success: true };
  } catch (error) {
    console.error("Failed to create category:", error);
    return { error: "Failed to create category" };
  }
}

export async function updateCategory(id: string, data: CategoryInput) {
  const validated = categorySchema.parse(data);
  
  try {
    await db.update(categories)
      .set({
        name: validated.name,
        description: validated.description,
        updatedAt: new Date(),
      })
      .where(eq(categories.id, id));
    revalidatePath("/categories");
    return { success: true };
  } catch (error) {
    console.error("Failed to update category:", error);
    return { error: "Failed to update category" };
  }
}

export async function deleteCategory(id: string) {
  try {
    await db.delete(categories).where(eq(categories.id, id));
    revalidatePath("/categories");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete category:", error);
    return { error: "Failed to delete category" };
  }
}
