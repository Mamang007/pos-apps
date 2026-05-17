"use server";

import { db } from "@/lib/db";
import { products, categories } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { productSchema, type ProductInput, type ProductWithCategory } from "../types";

export async function getProducts(): Promise<ProductWithCategory[]> {
  try {
    const data = await db
      .select({
        product: products,
        category: categories,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .orderBy(products.name);

    return data.map((row) => ({
      ...row.product,
      category: row.category,
    }));
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
}

export async function createProduct(data: ProductInput) {
  const validated = productSchema.parse(data);
  
  try {
    await db.insert(products).values({
      categoryId: validated.categoryId,
      sku: validated.sku,
      barcode: validated.barcode,
      uom: validated.uom,
      name: validated.name,
      description: validated.description,
      costPrice: validated.costPrice,
      sellPrice: validated.sellPrice,
      minStockLevel: validated.minStockLevel,
    });
    revalidatePath("/products");
    return { success: true };
  } catch (error: any) {
    if (error.message?.includes("products_sku_unique")) {
      return { error: "SKU already exists" };
    }
    console.error("Failed to create product:", error);
    return { error: "Failed to create product" };
  }
}

export async function updateProduct(id: string, data: ProductInput) {
  const validated = productSchema.parse(data);
  
  try {
    await db.update(products)
      .set({
        categoryId: validated.categoryId,
        sku: validated.sku,
        barcode: validated.barcode,
        uom: validated.uom,
        name: validated.name,
        description: validated.description,
        costPrice: validated.costPrice,
        sellPrice: validated.sellPrice,
        minStockLevel: validated.minStockLevel,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id));
    revalidatePath("/products");
    return { success: true };
  } catch (error) {
    console.error("Failed to update product:", error);
    return { error: "Failed to update product" };
  }
}

export async function deleteProduct(id: string) {
  try {
    await db.delete(products).where(eq(products.id, id));
    revalidatePath("/products");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete product:", error);
    return { error: "Failed to delete product" };
  }
}
