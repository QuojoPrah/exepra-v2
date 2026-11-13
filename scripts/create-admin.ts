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
import { createInterface } from "node:readline/promises";
import { hashPassword } from "better-auth/crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL!, max: 1 }) });

/** Reads a line without echoing it to the terminal. */
function askHidden(prompt: string): Promise<string> {
  const stdin = process.stdin;
  if (!stdin.isTTY) {
    const rl = createInterface({ input: stdin });
    return rl.question(prompt).finally(() => rl.close());
  }
  process.stdout.write(prompt);
  return new Promise((resolve) => {
    let value = "";
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    const onData = (chunk: string) => {
      for (const ch of chunk) {
        if (ch === "\r" || ch === "\n") {
          stdin.setRawMode(false);
          stdin.pause();
          stdin.off("data", onData);
          process.stdout.write("\n");
          resolve(value);
          return;
        }
        if (ch === "\u0003") {
          process.stdout.write("\n");
          process.exit(130); // Ctrl-C
        }
        if (ch === "\u007f" || ch === "\b") value = value.slice(0, -1);
        else if (ch >= " ") value += ch;
      }
    };
    stdin.on("data", onData);
  });
}

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
