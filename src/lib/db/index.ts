import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL!;
const isLocal = databaseUrl.includes("localhost") || databaseUrl.includes("127.0.0.1");

// Disable prefetch/prepare as it is not supported for Supabase "Transaction" pool mode
const queryClient = postgres(databaseUrl, { 
  prepare: false,
  ssl: isLocal ? false : { rejectUnauthorized: false },
});

export const db = drizzle(queryClient, { schema });
