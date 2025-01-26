import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000,
  database: "mydb",
  host: "db",
  port: 5432,
  user: "postgres",
});

export const db = drizzle(pool);
