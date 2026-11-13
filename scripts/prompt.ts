import { createInterface } from "node:readline/promises";

/** Removes bracketed-paste markers some terminals wrap around pasted text, and surrounding spaces/quotes. */
export function clean(v: string): string {
  return v
    .replace(/\x1b?\[20[01]~/g, "")
    .trim()
    .replace(/^["']|["']$/g, "")
    .trim();
}

/** Reads a line from the terminal without echoing it. */
export function askHidden(prompt: string): Promise<string> {
  const stdin = process.stdin;
  if (!stdin.isTTY) {
    const rl = createInterface({ input: stdin });
    return rl.question(prompt).then(clean).finally(() => rl.close());
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
          resolve(clean(value));
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
