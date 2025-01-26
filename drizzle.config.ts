import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
    ssl: true, // Aktifkan SSL
  },
  migrations: {
    table: "user_tasks",
    schema: "./src/lib/db/migrations",
  },
  // ! local
  // dialect: "postgresql",
  // schema: "./src/lib/db/schema.ts",
  // out: "./drizzle",
  // dbCredentials: {
  //   host: process.env.DATABASE_HOST!,
  //   port: +process.env.DATABASE_PORT!,
  //   user: process.env.DATABASE_USER!,
  //   password: process.env.DATABASE_PASSWORD!,
  //   database: process.env.DATABASE_NAME!,
  //   ssl: true,
  //   url: process.env.DATABASE_URL,
  // },
  // migrations: {
  //   table: "user_tasks",
  //   schema: "./src/lib/db/migrations",
  // },
});
