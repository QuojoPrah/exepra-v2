/**
 * Creates (or promotes) an administrator account.
 * Administrators can never be created through public registration.
 *
 *   npm run admin:create -- owner@example.com "Owner Name"
 *
 * You'll be prompted for a password (min. 12 characters). It is hashed with
 * Better Auth's scrypt implementation and never printed or stored in plain text.
 * If the user already exists, they are promoted to admin and the password is unchanged.
 */
import "dotenv/config";
import { randomUUID } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import { askHidden } from "./prompt";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL!, max: 1 }) });

async function readPassword(): Promise<string> {
  if (process.env.ADMIN_PASSWORD) return process.env.ADMIN_PASSWORD;
  const first = await askHidden("Password for the new admin (min. 12 chars, hidden): ");
  const second = await askHidden("Repeat the password: ");
  if (first !== second) {
    console.error("Passwords do not match.");
    process.exit(1);
  }
  return first;
}

async function main() {
  const [email, ...nameParts] = process.argv.slice(2);
  const name = nameParts.join(" ") || "Administrator";
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    console.error('Usage: npm run admin:create -- <email> "<name>"');
    process.exit(1);
  }
  const normalized = email.toLowerCase();
  const existing = await db.user.findUnique({ where: { email: normalized } });
  if (existing) {
    await db.user.update({ where: { id: existing.id }, data: { role: "admin" } });
    console.log(`✔ ${normalized} promoted to admin.`);
    return;
  }
  const password = await readPassword();
  if (password.length < 12) {
    console.error("Password must be at least 12 characters.");
    process.exit(1);
  }
  const id = randomUUID();
  await db.user.create({
    data: {
      id,
      email: normalized,
      name,
      role: "admin",
      emailVerified: true,
      accounts: { create: { id: randomUUID(), accountId: id, providerId: "credential", password: await hashPassword(password) } },
    },
  });
  console.log(`✔ Admin ${normalized} created. Sign in at /account/login.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
