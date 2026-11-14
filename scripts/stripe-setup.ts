/**
 * LIVE mode:  npm run stripe:setup:live
 *   asks for the live secret key, checks the account may take payments, creates the
 *   webhook for https://www.exepra.com and saves both secrets to Vercel Production only.
 *
 * TEST mode (default) connects Stripe to the Vercel preview of the feature branch:
 *  1. asks for your Stripe test secret key (hidden),
 *  2. creates a webhook endpoint in Stripe pointing at the preview
 *     (using Vercel's automation-bypass token so Stripe gets past Deployment Protection),
 *  3. saves STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET to Vercel (Preview only).
 * No secret is printed or written to disk.
 *
 *   npx tsx scripts/stripe-setup.ts
 */
import { execFileSync, spawnSync } from "node:child_process";
import { askHidden } from "./prompt";

const LIVE = process.argv.includes("--live");
const LIVE_URL = "https://www.exepra.com";
const PROJECT = "exepra-v2";
const PREVIEW_URL = "https://exepra-v2-git-feature-full-ecommerce-platform-exepra.vercel.app";
const EVENTS = [
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "checkout.session.async_payment_failed",
  "checkout.session.expired",
  "charge.refunded",
];

function vercel(args: string[], input?: string) {
  const r = spawnSync("npx", ["-y", "vercel@latest", ...args], { input, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] });
  if (r.status !== 0) throw new Error(`vercel ${args.slice(0, 2).join(" ")} failed: ${(r.stderr || "").split("\n").filter((l) => l && !l.startsWith("Vercel CLI")).slice(-2).join(" ")}`);
  return r.stdout;
}

function bypassToken(): string {
  const json = JSON.parse(vercel(["project", "protection", PROJECT, "--json"]));
  const entry = Object.entries(json.protectionBypass ?? {}).find(([, v]) => (v as { scope?: string }).scope === "automation-bypass");
  if (!entry) throw new Error("No automation bypass token found. Enable it with: npx vercel project protection enable exepra-v2 --protection-bypass");
  return entry[0];
}

async function stripe(key: string, path: string, body?: URLSearchParams) {
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: body ? "POST" : "GET",
    headers: { Authorization: `Bearer ${key}`, ...(body ? { "Content-Type": "application/x-www-form-urlencoded" } : {}) },
    body,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Stripe: ${data.error?.message ?? res.statusText}`);
  return data;
}

async function main() {
  const mode = LIVE ? "live" : "test";
  console.log(LIVE ? `Stripe → ${LIVE_URL} setup (LIVE mode — real payments)\n` : "Stripe → Vercel preview setup (test mode)\n");
  const key = await askHidden(`Paste your Stripe ${mode.toUpperCase()} secret key (starts with sk_${mode}_), then Enter (hidden): `);
  if (!key.startsWith(`sk_${mode}_`) && !key.startsWith(`rk_${mode}_`)) {
    console.error(
      LIVE
        ? "✘ That isn't a live secret key. In Stripe, leave the sandbox / switch off 'Test mode', then copy the Secret key (sk_live_…). Nothing was saved."
        : "✘ That isn't a test-mode secret key. In Stripe, switch on 'Test mode' and copy the Secret key (sk_test_…).",
    );
    process.exit(1);
  }

  const account = await stripe(key, "account");
  console.log(`✔ Key works — Stripe account: ${account.settings?.dashboard?.display_name || account.business_profile?.name || account.id}`);

  if (LIVE && !account.charges_enabled) {
    console.error("✘ This Stripe account can't accept live payments yet. Finish the business verification in the Stripe dashboard");
    console.error("  (it shows what is still missing), then run this command again. Nothing was saved.");
    process.exit(1);
  }
  if (LIVE) console.log("✔ Account is enabled for live payments");

  const base = `${LIVE ? LIVE_URL : PREVIEW_URL}/api/webhooks/stripe`;
  // The live site is public; only the protected preview needs Vercel's bypass token.
  const url = LIVE ? base : `${base}?x-vercel-protection-bypass=${bypassToken()}`;

  // Remove earlier endpoints for this preview so events aren't delivered twice.
  const existing = await stripe(key, "webhook_endpoints?limit=100");
  for (const ep of existing.data as { id: string; url: string }[]) {
    if (ep.url.startsWith(base)) {
      await fetch(`https://api.stripe.com/v1/webhook_endpoints/${ep.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${key}` } });
      console.log("✔ Replaced an earlier webhook for this site");
    }
  }

  const form = new URLSearchParams({ url, description: LIVE ? "EXEPRA live store (www.exepra.com)" : "EXEPRA preview (feature/full-ecommerce-platform)" });
  EVENTS.forEach((e) => form.append("enabled_events[]", e));
  const endpoint = await stripe(key, "webhook_endpoints", form);
  console.log(`✔ Webhook created in Stripe (${endpoint.id}) for ${EVENTS.length} events`);

  const target = LIVE ? "production" : "preview";
  const label = LIVE ? "Production" : "Preview";
  vercel(["env", "add", "STRIPE_SECRET_KEY", "--environment", target, "--yes", "--force"], key);
  vercel(["env", "add", "STRIPE_WEBHOOK_SECRET", "--environment", target, "--yes", "--force"], endpoint.secret);

  const list = execFileSync("npx", ["-y", "vercel@latest", "env", "ls"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  for (const name of ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"]) {
    const ok = list.split("\n").some((l) => l.trim().startsWith(name + " ") && l.includes(label));
    console.log(`${ok ? "✔" : "✘"} ${name} ${ok ? `is set for ${label}` : "is NOT set — please tell Claude"}`);
  }
  console.log(`\nDone. Redeploy ${LIVE ? "the live site" : "the preview"} for the keys to take effect.`);
}

main().catch((e) => {
  console.error(`✘ ${e instanceof Error ? e.message : e}`);
  process.exit(1);
});
