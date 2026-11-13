/**
 * Asks for the Cloudinary cloud name, API key and API secret (hidden), checks them
 * against Cloudinary, and only then saves them to Vercel (Production + Preview).
 * Nothing secret is printed or written to disk.
 *
 *   npm run cloudinary:setup
 */
import { spawnSync } from "node:child_process";
import { askHidden } from "./prompt";

function vercelEnvAdd(name: string, value: string) {
  const r = spawnSync("npx", ["-y", "vercel@latest", "env", "add", name, "--environment", "production,preview", "--yes", "--force"], {
    input: value,
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
  });
  if (r.status !== 0) throw new Error(`Could not save ${name} to Vercel`);
}

async function main() {
  console.log("Cloudinary → Vercel setup\n");
  console.log("In the Cloudinary console open Settings → API Keys. You need the Cloud name (top of the page),");
  console.log("and from the key row: the 'API Key' column (only digits) and the 'API Secret' column.\n");

  let cloud = await askHidden("1/3 Paste the Cloud name, then Enter (hidden): ");
  let key = await askHidden("2/3 Paste the API Key (digits), then Enter (hidden): ");
  let secret = await askHidden("3/3 Paste the API Secret, then Enter (hidden): ");

  // Accept the full CLOUDINARY_URL too: cloudinary://<key>:<secret>@<cloud>
  for (const v of [cloud, key, secret]) {
    const m = v.match(/^(?:CLOUDINARY_URL=)?cloudinary:\/\/(\d+):([^@]+)@(.+)$/);
    if (m) [key, secret, cloud] = [m[1], m[2], m[3]];
  }

  // Describe a value without revealing it: length and kinds of characters.
  const describe = (v: string) => {
    if (!v) return "nothing was received";
    const kinds = [/[a-z]/.test(v) && "lowercase letters", /[A-Z]/.test(v) && "capital letters", /\d/.test(v) && "digits", /[^A-Za-z0-9]/.test(v) && "symbols/spaces"].filter(Boolean);
    return `received ${v.length} characters (${kinds.join(", ")})`;
  };

  const problems: string[] = [];
  if (!/^[a-z0-9-_]+$/i.test(cloud)) problems.push(`Cloud name: ${describe(cloud)}. It should be a short word like 'dxyz12345'.`);
  if (!/^\d{6,}$/.test(key)) problems.push(`API key: ${describe(key)}. It should be only digits (usually 15) — the 'API Key' column, not 'Key Name' (e.g. 'Root') or the secret.`);
  if (!/^[\w-]{10,}$/.test(secret)) problems.push(`API secret: ${describe(secret)}. It should be about 27 letters/digits (may include - or _) — click the eye icon first, then copy.`);
  if (problems.length) {
    problems.forEach((p) => console.error(`✘ ${p}`));
    console.error("\nNothing was saved. Run `npm run cloudinary:setup` again.");
    process.exit(1);
  }

  const res = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloud)}/usage`, {
    headers: { Authorization: `Basic ${Buffer.from(`${key}:${secret}`).toString("base64")}` },
  });
  if (!res.ok) {
    const msg = ((await res.json().catch(() => ({}))) as { error?: { message?: string } }).error?.message ?? res.statusText;
    console.error(`✘ Cloudinary rejected these details: ${msg}`);
    console.error("  Check that all three come from the same Cloudinary account and the same key row.");
    console.error("\nNothing was saved. Run `npm run cloudinary:setup` again.");
    process.exit(1);
  }
  console.log("✔ Cloudinary accepted the cloud name, API key and secret");

  vercelEnvAdd("CLOUDINARY_CLOUD_NAME", cloud);
  vercelEnvAdd("CLOUDINARY_API_KEY", key);
  vercelEnvAdd("CLOUDINARY_API_SECRET", secret);
  console.log("✔ Saved to Vercel for Production and Preview");
  console.log("\nDone. Redeploy the preview for the new values to take effect.");
}

main().catch((e) => {
  console.error(`✘ ${e instanceof Error ? e.message : e}`);
  process.exit(1);
});
