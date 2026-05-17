import { seedRoles } from "./src/features/roles/services/seed";
import { seedUsers } from "./src/features/users/services/seed";

async function seed() {
  console.log("🌱 Starting database seeding...");

  try {
    // 1. Seed Roles
    await seedRoles();

    // 2. Seed Users
    await seedUsers();

    console.log("✅ Seeding completed successfully!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  } finally {
    process.exit();
  }
}

seed();
