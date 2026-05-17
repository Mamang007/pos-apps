import { seedRoles } from "./src/features/roles/services/seed";
import { seedUsers } from "./src/features/users/services/seed";
import { seedCategories } from "./src/features/categories/services/seed";
import { seedProducts } from "./src/features/products/services/seed";

async function seed() {
  console.log("🌱 Starting database seeding...");

  try {
    // 1. Seed Roles
    await seedRoles();

    // 2. Seed Users
    await seedUsers();

    // 3. Seed Categories
    await seedCategories();

    // 4. Seed Products
    await seedProducts();

    console.log("✅ Seeding completed successfully!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  } finally {
    process.exit();
  }
}

seed();
