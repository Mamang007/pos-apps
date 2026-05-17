import { seedRoles } from "./src/features/roles/services/seed";
import { seedUsers } from "./src/features/users/services/seed";
import { seedCategories } from "./src/features/categories/services/seed";
import { seedProducts } from "./src/features/products/services/seed";
import { seedSuppliers } from "./src/features/suppliers/services/seed";
import { seedCustomers } from "./src/features/customers/services/seed";

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

    // 5. Seed Suppliers
    await seedSuppliers();

    // 6. Seed Customers
    await seedCustomers();

    console.log("✅ Seeding completed successfully!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  } finally {
    process.exit();
  }
}

seed();
