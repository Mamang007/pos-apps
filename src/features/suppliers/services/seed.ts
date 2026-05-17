import { db } from "@/lib/db";
import { suppliers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function seedSuppliers() {
  console.log("Creating suppliers...");
  const supplierData = [
    { 
      code: "CSN", 
      name: "CV. Satria Niaga", 
      contactName: "Idris", 
      address: "Purwokerto", 
      phone: "081234567890", 
      email: "idris@example.com" 
    },
    { 
      code: "CBB", 
      name: "CV. Bangun Bersama", 
      contactName: "Luhut", 
      address: "Purbalingga", 
      phone: "086524666444", 
      email: "luhut@example.com" 
    },
    { 
      code: "PMS", 
      name: "PT. Maju Selalu", 
      contactName: "Bambang", 
      address: "Purwokerto", 
      phone: "084526888555", 
      email: "bambang@example.com" 
    },
  ];

  for (const s of supplierData) {
    const existing = await db.select().from(suppliers).where(eq(suppliers.code, s.code)).limit(1);
    if (existing.length === 0) {
      await db.insert(suppliers).values({
        code: s.code,
        name: s.name,
        contactName: s.contactName,
        address: s.address,
        phone: s.phone,
        email: s.email,
      });
      console.log(`Supplier ${s.name} created.`);
    } else {
      console.log(`Supplier ${s.name} already exists, skipping.`);
    }
  }
}
