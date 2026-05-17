import { db } from "@/lib/db";
import { products, categories } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function seedProducts() {
  console.log("Creating products...");
  
  const allCategories = await db.select().from(categories);
  const findCat = (name: string) => allCategories.find(c => c.name === name)?.id || null;

  const productData = [
    { sku: "0089686010015", name: "Indomie Ayam Bawang", uom: "Pcs", costPrice: "2000", sellPrice: "2250", categoryName: "Instant Food" },
    { sku: "0089686010343", name: "Indomie Soto Mie", uom: "Pcs", costPrice: "2000", sellPrice: "2250", categoryName: "Instant Food" },
    { sku: "8999909076006", name: "Sampoerna Mild 16", uom: "Bungkus", costPrice: "20500", sellPrice: "23000", categoryName: "Groceries" }, // Assuming groceries for now
    { sku: "8999909028234", name: "Dji Sam Soe Kretek 12", uom: "Bungkus", costPrice: "15000", sellPrice: "17000", categoryName: "Groceries" },
    { sku: "8999999008376", name: "Rinso Anti Noda 700 Gr", uom: "Pcs", costPrice: "21500", sellPrice: "24000", categoryName: "Housewares" },
    { sku: "8998866600491", name: "Soklin Higienis 320 Gr", uom: "Pcs", costPrice: "17000", sellPrice: "19000", categoryName: "Housewares" },
    { sku: "8999999007072", name: "Pepsodent White 100 Gr", uom: "Pcs", costPrice: "11000", sellPrice: "12500", categoryName: "Toiletries" },
    { sku: "8998866100151", name: "Ciptadent Cool 120 Gr", uom: "Pcs", costPrice: "12500", sellPrice: "15000", categoryName: "Toiletries" },
  ];

  for (const p of productData) {
    const existing = await db.select().from(products).where(eq(products.sku, p.sku)).limit(1);
    if (existing.length === 0) {
      await db.insert(products).values({
        sku: p.sku,
        name: p.name,
        uom: p.uom,
        costPrice: p.costPrice,
        sellPrice: p.sellPrice,
        categoryId: findCat(p.categoryName),
        minStockLevel: 0,
      });
      console.log(`Product ${p.name} created.`);
    } else {
      console.log(`Product ${p.name} already exists, skipping.`);
    }
  }
}
