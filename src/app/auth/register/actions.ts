import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!name || !email || !password) {
    return { error: "Missing required fields" };
  }

  try {
    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      return { error: "User already exists" };
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    await db.insert(users).values({
      name,
      email,
      passwordHash,
    });

    return { success: true };
  } catch (err) {
    console.error("Registration error:", err);
    return { error: "Failed to register user" };
  }
}
