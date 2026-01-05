import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config();

if (!process.env.DATABASE_URL)
  throw new Error("DATABASE_URL is not defined in .env file");

export default defineConfig({
  schema: "./src/schema/*",
  out: "./migrations",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
  dialect: "postgresql",
});
