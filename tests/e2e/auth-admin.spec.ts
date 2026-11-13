import { expect, test } from "@playwright/test";

test.describe("accounts & admin", () => {
  test("anonymous visitors cannot reach the admin", async ({ page, request }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/account\/login\?next=%2Fadmin/);
    const upload = await request.post("/api/admin/upload", { multipart: { file: { name: "x.png", mimeType: "image/png", buffer: Buffer.from("x") } } });
    expect(upload.status()).toBe(403);
  });

  test("customers can register, see their account, and are not admins", async ({ page }) => {
    const email = `e2e-${Date.now()}@example.com`;
    await page.goto("/account/register");
    await page.waitForLoadState("networkidle");
    await page.getByLabel("First name").fill("Erika");
    await page.getByLabel("Last name").fill("Testerin");
    await page.getByRole("main").getByLabel("Email", { exact: true }).fill(email);
    await page.getByLabel("Password", { exact: true }).fill("weak");
    await page.getByRole("main").getByRole("checkbox").check();
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.getByText("Use at least 10 characters.")).toBeVisible();
    await page.getByLabel("Password", { exact: true }).fill("a-strong-passphrase-42");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.getByRole("heading", { name: "Hello, Erika" })).toBeVisible();
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/$/); // redirected away: not an admin
    await page.goto("/account/profile");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test("administrators can sign in and use the dashboard", async ({ page }) => {
    test.skip(!process.env.E2E_ADMIN_EMAIL || !process.env.E2E_ADMIN_PASSWORD, "E2E admin credentials not configured");
    await page.goto("/account/login?next=/admin");
    await page.waitForLoadState("networkidle");
    await page.getByRole("main").getByLabel("Email", { exact: true }).fill(process.env.E2E_ADMIN_EMAIL!);
    await page.getByRole("main").getByLabel("Password", { exact: true }).fill(process.env.E2E_ADMIN_PASSWORD!);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    for (const [path, heading] of [["/admin/orders", "Orders"], ["/admin/products", "Products"], ["/admin/categories", "Categories"], ["/admin/collections", "Collections"], ["/admin/customers", "Customers"], ["/admin/promotions", "Promotions"], ["/admin/reviews", "Reviews"], ["/admin/messages", "Messages"], ["/admin/homepage", "Homepage"], ["/admin/settings", "Settings"]]) {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
    }
    // create and remove a draft product
    await page.goto("/admin/products/new");
    await page.waitForLoadState("networkidle");
    const name = `E2E Draft ${Date.now()}`;
    await page.getByLabel("Name", { exact: true }).fill(name);
    await page.getByLabel("Description", { exact: true }).fill("A product created by the end-to-end test suite.");
    await page.getByLabel("Price (€)", { exact: true }).fill("19,90");
    await page.getByLabel("SKU", { exact: true }).fill(`E2E-${Date.now()}`);
    await page.getByLabel("Stock", { exact: true }).fill("4");
    await page.getByRole("button", { name: "Create product" }).click();
    await expect(page).toHaveURL(/\/admin\/products\/c/);
    await expect(page.getByRole("heading", { level: 1, name })).toBeVisible();
    page.once("dialog", (d) => d.accept());
    await page.getByRole("button", { name: "Delete product" }).click();
    await expect(page).toHaveURL(/\/admin\/products$/);
  });
});
