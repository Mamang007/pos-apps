"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!name || !email || !username || !password) {
    return { error: "Missing required fields" };
  }

  try {
    // Check if user or email already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      return { error: "Email already exists" };
    }

    const existingUsername = await db.select().from(users).where(eq(users.username, username)).limit(1);
    if (existingUsername.length > 0) {
      return { error: "Username already taken" };
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    await db.insert(users).values({
      name,
      email,
      username,
      passwordHash,
    });

    return { success: true };
  } catch (err) {
    console.error("Registration error:", err);
    return { error: "Failed to register user" };
  }
}
