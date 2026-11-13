/**
 * Prints which database DATABASE_URL points to (host only, never credentials)
 * and a few row counts. Useful to confirm a command ran against the right database.
 *
 *   npx vercel env run --environment production -- npx tsx scripts/check-db.ts
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  console.log("DB host:", new URL(url).hostname);
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: url, max: 1 }) });
  const [shipping, categories, slides, products, admins] = await Promise.all([
    db.shippingRate.count(),
    db.category.count(),
    db.heroSlide.count(),
    db.product.count(),
    db.user.count({ where: { role: "admin" } }),
  ]);
  console.log({ shipping, categories, slides, products, admins });
  await db.$disconnect();
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
