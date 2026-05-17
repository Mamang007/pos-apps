import { db } from "@/lib/db";
import { roles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function seedRoles() {
  console.log("Creating roles...");
  const roleData = [
    { name: "ADMIN", permissions: ["*"] },
    { name: "CASHIER", permissions: ["pos.view", "pos.transact"] },
  ];

  for (const role of roleData) {
    const existing = await db.select().from(roles).where(eq(roles.name, role.name)).limit(1);
    if (existing.length === 0) {
      await db.insert(roles).values({
        name: role.name,
        permissions: role.permissions,
      });
      console.log(`Role ${role.name} created.`);
    }
  }
}
