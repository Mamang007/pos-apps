import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function seedCategories() {
  console.log("Creating categories...");
  const categoryData = [
    { name: "Snacks", description: "Chips, biscuits, and other snacks" },
    { name: "Beverages", description: "Soft drinks, water, and juices" },
    { name: "Toiletries", description: "Soap, shampoo, and personal care" },
    { name: "Housewares", description: "Cleaning supplies and kitchenware" },
    { name: "Groceries", description: "Rice, oil, sugar, and basic food items" },
    { name: "Instant Food", description: "Noodles and ready-to-eat meals" },
  ];

  for (const cat of categoryData) {
    const existing = await db.select().from(categories).where(eq(categories.name, cat.name)).limit(1);
    if (existing.length === 0) {
      await db.insert(categories).values({
        name: cat.name,
        description: cat.description,
      });
      console.log(`Category ${cat.name} created.`);
    }
  }
}
