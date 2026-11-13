import { defineConfig, devices } from "@playwright/test";
import { config } from "dotenv";

config({ path: ".env" });
const PORT = Number(process.env.E2E_PORT ?? 3000);

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  use: { baseURL: `http://localhost:${PORT}`, trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { ...devices["Pixel 7"], viewport: { width: 375, height: 812 } }, testMatch: /responsive\.spec\.ts/ },
  ],
  webServer: { command: "npm run dev", url: `http://localhost:${PORT}`, reuseExistingServer: true, timeout: 120_000 },
});
