import { db } from "@/lib/db";
import { customers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function seedCustomers() {
  console.log("Creating customers...");
  const customerData = [
    { 
      code: "UMA", 
      name: "UD. Makmur (Alex)", 
      address: "Purbalingga", 
      phone: "081123456789" 
    },
    { 
      code: "CSA", 
      name: "CV. Sentosa (Surti)", 
      address: "Purbalingga", 
      phone: "089235215422" 
    },
    { 
      code: "UMM", 
      name: "UD. Maju Makmur (Tejo)", 
      address: "Purwokerto", 
      phone: "084523212121" 
    },
    { 
      code: null, 
      name: "Badri", 
      address: "Cirebon", 
      phone: "084123987453" 
    },
  ];

  for (const c of customerData) {
    // For customers without code, we check by name + phone to avoid duplicates during seeding
    let existing;
    if (c.code) {
      existing = await db.select().from(customers).where(eq(customers.code, c.code)).limit(1);
    } else {
      existing = await db.select().from(customers).where(eq(customers.name, c.name)).limit(1);
    }

    if (existing.length === 0) {
      await db.insert(customers).values({
        code: c.code,
        name: c.name,
        address: c.address,
        phone: c.phone,
        loyaltyPoints: 0,
      });
      console.log(`Customer ${c.name} created.`);
    } else {
      console.log(`Customer ${c.name} already exists, skipping.`);
    }
  }
}
