/**
 * Connects Resend (transactional email) for exepra.com:
 *  1. asks for a Resend API key (hidden, needs "Full access" to manage domains),
 *  2. adds exepra.com to Resend (EU region) or reuses it,
 *  3. prints the DNS records to add at your DNS provider (Porkbun),
 *  4. saves RESEND_API_KEY and EMAIL_FROM to Vercel (Production + Preview),
 *  5. waits while you add the records, verifies them, and sends a test email.
 * The API key is never printed or written to disk.
 *
 *   npm run resend:setup
 */
import { spawnSync } from "node:child_process";
import { createInterface } from "node:readline/promises";
import { askHidden } from "./prompt";

const DOMAIN = "exepra.com";
const FROM = `EXEPRA <orders@${DOMAIN}>`;

type DnsRecord = { record: string; name: string; type: string; value: string; priority?: number; ttl?: string; status?: string };
type Domain = { id: string; name: string; status: string; region?: string; records?: DnsRecord[] };

function vercelEnvAdd(name: string, value: string, sensitive: boolean) {
  const args = ["-y", "vercel@latest", "env", "add", name, "--environment", "production,preview", "--yes", "--force"];
  if (!sensitive) args.push("--no-sensitive");
  const r = spawnSync("npx", args, { input: value, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] });
  if (r.status !== 0) throw new Error(`Could not save ${name} to Vercel`);
}

async function ask(prompt: string) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question(prompt);
  rl.close();
  return answer.trim();
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  console.log("Resend → Vercel setup for", DOMAIN, "\n");
  const key = await askHidden("Paste your Resend API key (starts with re_, Full access), then Enter (hidden): ");
  if (!key.startsWith("re_")) {
    console.error("✘ That doesn't look like a Resend API key (it should start with re_). Nothing was saved.");
    process.exit(1);
  }

  const api = async (path: string, init: RequestInit = {}) => {
    const res = await fetch(`https://api.resend.com/${path}`, {
      ...init,
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", ...(init.headers ?? {}) },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = (data as { message?: string; name?: string }).message ?? res.statusText;
      if (res.status === 401 || /restricted/i.test(msg)) {
        throw new Error(`Resend refused the key (${msg}). Create a key with "Full access" permission in Resend → API Keys and run again.`);
      }
      throw new Error(`Resend: ${msg}`);
    }
    return data;
  };

  const list = (await api("domains")) as { data: Domain[] };
  let domain = list.data.find((d) => d.name === DOMAIN);
  if (!domain) {
    domain = (await api("domains", { method: "POST", body: JSON.stringify({ name: DOMAIN, region: "eu-west-1" }) })) as Domain;
    console.log(`✔ Added ${DOMAIN} to Resend (EU region)`);
  } else {
    console.log(`✔ ${DOMAIN} is already in Resend (status: ${domain.status})`);
  }
  const details = (await api(`domains/${domain.id}`)) as Domain;

  vercelEnvAdd("RESEND_API_KEY", key, true);
  vercelEnvAdd("EMAIL_FROM", FROM, false);
  console.log(`✔ Saved RESEND_API_KEY and EMAIL_FROM ("${FROM}") to Vercel for Production and Preview`);

  if (details.status !== "verified") {
    console.log(`\nAdd these DNS records at Porkbun (Domain Management → ${DOMAIN} → DNS).`);
    console.log("In Porkbun's 'Host' field enter only the part shown under HOST (Porkbun adds .exepra.com itself).\n");
    for (const r of details.records ?? []) {
      const host = r.name.replace(new RegExp(`\\.?${DOMAIN.replace(".", "\\.")}$`), "") || "(leave empty)";
      console.log(`  TYPE: ${r.type}${r.priority !== undefined ? `   PRIORITY: ${r.priority}` : ""}`);
      console.log(`  HOST: ${host}`);
      console.log(`  ANSWER/VALUE: ${r.value}`);
      console.log("");
    }
    await ask("When all records are added at Porkbun, press Enter here to check… ");

    for (let attempt = 1; attempt <= 30; attempt++) {
      await api(`domains/${domain.id}/verify`, { method: "POST" }).catch(() => undefined);
      await sleep(10_000);
      const d = (await api(`domains/${domain.id}`)) as Domain;
      const pending = (d.records ?? []).filter((r) => r.status !== "verified").map((r) => `${r.record} (${r.type} ${r.name})`);
      if (d.status === "verified") {
        console.log("✔ Domain verified by Resend");
        break;
      }
      if (d.status === "failed") {
        console.error(`✘ Resend could not verify: ${pending.join(", ")}. Double-check those records, then run this script again.`);
        process.exit(1);
      }
      console.log(`  …still checking (${attempt}/30). Waiting on: ${pending.join(", ") || "Resend"}`);
      if (attempt === 30) {
        console.log("DNS can take a while. Run `npm run resend:setup` again later — it will pick up where it left off.");
        process.exit(0);
      }
    }
  } else {
    console.log("✔ Domain is already verified");
  }

  const to = await ask("\nSend a test email to which address? (press Enter to skip): ");
  if (to) {
    await api("emails", {
      method: "POST",
      body: JSON.stringify({
        from: FROM,
        to,
        subject: "EXEPRA email is working",
        html: "<p>This is a test email from your EXEPRA store. Order confirmations, shipping updates and password resets will be sent from this address.</p>",
      }),
    });
    console.log(`✔ Test email accepted by Resend — check the inbox (and spam folder) of ${to}`);
  }
  console.log("\nDone. Redeploy for the new values to take effect.");
}

main().catch((e) => {
  console.error(`✘ ${e instanceof Error ? e.message : e}`);
  process.exit(1);
});
