import "dotenv/config";
import { defineConfig } from "prisma/config";

// The CLI (migrate, studio, seed) prefers the direct, non-pooled connection
// (Neon: DIRECT_URL). The app runtime uses DATABASE_URL via lib/db.ts.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // DATABASE_URL_UNPOOLED is set automatically by the Vercel Neon integration.
    url: process.env.DIRECT_URL || process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL || "",
  },
});
