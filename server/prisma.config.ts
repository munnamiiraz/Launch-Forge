import "dotenv/config";
import { defineConfig } from "prisma/config";
import { envVars } from "./src/config/env";

export default defineConfig({
  schema: "prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx src/utils/seed.ts",
  },
  datasource: {
    url: envVars.DATABASE_URL,
  },
});