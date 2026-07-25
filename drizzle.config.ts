import { defineConfig } from "drizzle-kit";
import { getDatabaseConfig } from "./server/database-config";

const database = getDatabaseConfig();

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: database.connectionString,
    ssl: database.ssl,
  },
});
