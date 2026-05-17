import { db } from "./src/lib/db";
import { users, roles } from "./src/lib/db/schema";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { seedRoles } from "./src/features/roles/services/seed";

async function seed() {
  console.log("🌱 Starting database seeding...");

  try {
    // 1. Seed Roles
    await seedRoles();

    const allRoles = await db.select().from(roles);
    const adminRole = allRoles.find((r) => r.name === "ADMIN");
    const cashierRole = allRoles.find((r) => r.name === "CASHIER");

    if (!adminRole || !cashierRole) throw new Error("Roles not found after seeding");

    // 2. Seed Users
    console.log("Creating users...");
    const userData = [
      { username: "yudhy", name: "Yudhy", password: "elex1234", email: "yudhy@example.com", roleId: adminRole.id },
      { username: "arum", name: "Arum", password: "arum1234", email: "arum@example.com", roleId: cashierRole.id },
      { username: "risti", name: "Risti", password: "risti1234", email: "risti@example.com", roleId: cashierRole.id },
      { username: "tunik", name: "Tunik", password: "tunik1234", email: "tunik@example.com", roleId: cashierRole.id },
      { username: "wulan", name: "Wulan", password: "wulan1234", email: "wulan@example.com", roleId: cashierRole.id },
      { username: "dani", name: "Dani", password: "dani1234", email: "dani@example.com", roleId: cashierRole.id },
    ];

    for (const user of userData) {
      const existing = await db.select().from(users).where(eq(users.username, user.username)).limit(1);
      if (existing.length === 0) {
        const passwordHash = await bcrypt.hash(user.password, 10);
        await db.insert(users).values({
          username: user.username,
          name: user.name,
          email: user.email,
          passwordHash,
          roleId: user.roleId,
        });
        console.log(`User ${user.username} created.`);
      } else {
        console.log(`User ${user.username} already exists, skipping.`);
      }
    }

    console.log("✅ Seeding completed successfully!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  } finally {
    process.exit();
  }
}

seed();
