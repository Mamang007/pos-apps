"use server";

import { db } from "@/lib/db";
import { users, roles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { userSchema, type UserInput, type UserWithRole } from "../types";
import bcrypt from "bcrypt";

export async function getUsers(): Promise<UserWithRole[]> {
  try {
    const data = await db
      .select({
        user: users,
        role: roles,
      })
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id))
      .orderBy(users.name);

    return data.map((row) => ({
      ...row.user,
      role: row.role,
    }));
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return [];
  }
}

export async function createUser(data: UserInput) {
  const validated = userSchema.parse(data);
  
  if (!validated.password) {
    return { error: "Password is required for new users" };
  }

  try {
    const passwordHash = await bcrypt.hash(validated.password, 10);
    
    await db.insert(users).values({
      name: validated.name,
      email: validated.email,
      username: validated.username,
      passwordHash,
      roleId: validated.roleId,
    });
    
    revalidatePath("/users");
    return { success: true };
  } catch (error: any) {
    if (error.message?.includes("users_email_unique")) {
      return { error: "Email already exists" };
    }
    if (error.message?.includes("users_username_unique")) {
      return { error: "Username already exists" };
    }
    console.error("Failed to create user:", error);
    return { error: "Failed to create user" };
  }
}

export async function updateUser(id: string, data: UserInput) {
  const validated = userSchema.parse(data);
  
  try {
    const updateData: any = {
      name: validated.name,
      email: validated.email,
      username: validated.username,
      roleId: validated.roleId,
      updatedAt: new Date(),
    };

    if (validated.password) {
      updateData.passwordHash = await bcrypt.hash(validated.password, 10);
    }

    await db.update(users)
      .set(updateData)
      .where(eq(users.id, id));
      
    revalidatePath("/users");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update user:", error);
    return { error: "Failed to update user" };
  }
}

export async function deleteUser(id: string) {
  try {
    await db.delete(users).where(eq(users.id, id));
    revalidatePath("/users");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete user:", error);
    return { error: "Failed to delete user" };
  }
}
