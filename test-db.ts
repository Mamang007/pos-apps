import { db } from "./src/lib/db";
import { users } from "./src/lib/db/schema";

async function testConnection() {
  const dbUrl = process.env.DATABASE_URL;
  console.log("Testing database connection...");
  console.log("DATABASE_URL:", dbUrl ? dbUrl.replace(/:[^@/]+@/, ":****@") : "MISSING");

  try {
    // Attempt a simple query
    await db.select().from(users).limit(1);
    console.log("✅ Connection successful!");
  } catch (error: any) {
    console.error("❌ Connection failed!");
    
    const originalError = error.cause || error;
    
    if (originalError.code === "ENOTFOUND") {
      console.error("Error: Could not resolve database host. Check your DATABASE_URL.");
    } else if (originalError.code === "ECONNREFUSED") {
      console.error("Error: Connection refused. Is your database running?");
    } else if (originalError.message?.includes("password authentication failed")) {
      console.error("Error: Password authentication failed. Check your credentials in .env.local.");
    } else if (originalError.message?.includes('relation "users" does not exist')) {
      console.error("✅ Connection successful, but tables are missing.");
      console.error("Action: Run 'npx drizzle-kit push' to create tables.");
    } else {
      console.error("Unexpected Error:", originalError.message || originalError);
    }
  } finally {
    process.exit();
  }
}

testConnection();
