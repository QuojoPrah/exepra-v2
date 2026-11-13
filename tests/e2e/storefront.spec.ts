import { expect, test, type Page } from "@playwright/test";

async function dismissConsent(page: Page) {
  const btn = page.getByRole("button", { name: "Necessary only" });
  if (await btn.isVisible().catch(() => false)) await btn.click();
}

/** Navigate and wait until the page is hydrated (dev mode compiles on demand). */
async function open(page: Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState("networkidle");
  await dismissConsent(page);
}

test.describe("storefront", () => {
  test("homepage renders all sections in order", async ({ page }) => {
    await open(page, "/");
    await expect(page.getByRole("region", { name: "Store announcements" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: "Shop Women" }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Find what you're looking for" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Best Sellers" })).toBeVisible();
    await expect(page.getByRole("heading", { name: /made for real life/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Curated edits" })).toBeVisible();
    await expect(page.getByRole("contentinfo").getByLabel("Email address")).toBeVisible();
    // No fabricated press logos or fake reviews
    await expect(page.getByText(/featured in/i)).toHaveCount(0);
  });

  test("hero slideshow has manual controls", async ({ page }) => {
    await open(page, "/");
    const title = page.getByRole("heading", { level: 1 });
    const first = await title.textContent();
    await page.getByRole("button", { name: "Next slide" }).click();
    await expect(title).not.toHaveText(first!);
  });

  test("navigation reaches category pages", async ({ page }) => {
    await open(page, "/");
    await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Women", exact: true }).click();
    await expect(page).toHaveURL(/\/women$/);
    await expect(page.getByRole("heading", { level: 1, name: "Women" })).toBeVisible();
  });

  test("shop filtering and sorting update the URL and results", async ({ page }) => {
    await open(page, "/shop");
    const count = page.getByText(/\d+ products?$/).first();
    const before = Number((await count.textContent())!.match(/\d+/)![0]);
    await page.getByLabel("Sort by").selectOption("price-asc");
    await expect(page).toHaveURL(/sort=price-asc/);
    const prices = await page.locator("article").evaluateAll((cards) =>
      cards.map((c) => Number((c.textContent!.match(/(\d+),(\d{2}) €/) ?? ["", "0", "0"]).slice(1).join("."))),
    );
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
    await page.getByRole("button", { name: /Filters/ }).click();
    await page.getByRole("dialog").getByRole("button", { name: "M", exact: true }).click();
    await expect(page).toHaveURL(/size=M/);
    await page.getByRole("dialog").getByRole("button", { name: /Show \d+ products?/ }).click();
    const after = Number((await count.textContent())!.match(/\d+/)![0]);
    expect(after).toBeLessThan(before);
  });

  test("search overlay shows live suggestions and a results page", async ({ page }) => {
    await open(page, "/");
    await page.getByRole("button", { name: "Search products" }).click();
    await page.getByRole("combobox", { name: "Search products" }).fill("lamp");
    await expect(page.getByRole("option").first()).toContainText(/lamp/i);
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/search\?q=lamp/);
    await expect(page.getByRole("heading", { name: /Results for “lamp”/ })).toBeVisible();
    await page.goto("/search?q=zzzznotathing");
    await expect(page.getByText("Nothing here yet")).toBeVisible();
  });

  test("product page validates variants, adds to bag and the cart updates", async ({ page }) => {
    await open(page, "/product/linen-weekend-set");
    await page.getByRole("button", { name: "Add to bag" }).click();
    await expect(page.getByRole("main").getByRole("alert")).toHaveText("Please select a size.");
    await expect(page.getByRole("button", { name: "XL", exact: true })).toBeDisabled();
    await page.getByRole("button", { name: "S", exact: true }).click();
    await page.getByRole("button", { name: "Add to bag" }).click();
    const drawer = page.getByRole("dialog", { name: /Your bag/ });
    await expect(drawer).toContainText("Linen Weekend Set");
    await expect(drawer).toContainText("Natural / S");
    await drawer.getByRole("link", { name: "View bag" }).click();
    await expect(page).toHaveURL(/\/cart$/);
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "Increase quantity" }).first().click();
    await expect(page.getByText("2 items")).toBeVisible();
    await page.getByPlaceholder("Promo code").fill("NOTREAL");
    await page.getByRole("button", { name: "Apply" }).click();
    await expect(page.getByRole("main").getByRole("alert")).toContainText("does not exist");
    // persists across reloads
    await page.reload();
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("2 items")).toBeVisible();
  });

  test("wishlist persists for guests", async ({ page }) => {
    await open(page, "/product/ceramic-bud-vase");
    const saved = page.waitForResponse((r) => r.url().endsWith("/api/wishlist") && r.request().method() === "POST");
    await page.getByRole("button", { name: "Save to wishlist" }).click();
    await saved;
    await expect(page.getByRole("button", { name: "Remove from wishlist" })).toBeVisible();
    await open(page, "/wishlist");
    await expect(page.getByRole("link", { name: "Ceramic Bud Vase" }).first()).toBeVisible();
    const removed = page.waitForResponse((r) => r.url().endsWith("/api/wishlist") && r.request().method() === "POST");
    await page.getByRole("button", { name: "Remove Ceramic Bud Vase from wishlist" }).click();
    expect((await (await removed).json()).ids).not.toContain(expect.anything());
    await expect(page.getByText("Nothing saved yet")).toBeVisible({ timeout: 20_000 });
  });

  test("checkout validates each step before payment", async ({ page }) => {
    await open(page, "/product/glass-water-bottle");
    await page.getByRole("button", { name: "Add to bag" }).click();
    await expect(page.getByRole("dialog", { name: /Your bag/ })).toContainText("Glass Water Bottle");
    await open(page, "/checkout");
    await page.getByRole("button", { name: /Continue to shipping address/ }).click();
    await expect(page.getByText("Please enter a valid email address.")).toBeVisible();
    await page.getByRole("main").getByLabel("Email", { exact: true }).fill("e2e.customer@example.com");
    await page.getByLabel("First name").fill("Erika");
    await page.getByLabel("Last name").fill("Mustermann");
    await page.getByRole("button", { name: /Continue to shipping address/ }).click();
    await expect(page.getByLabel("First name")).toHaveValue("Erika"); // prefilled
    await page.getByLabel("Street").fill("Musterstraße");
    await page.getByLabel("No.").fill("12");
    await page.getByLabel("Postal code").fill("123");
    await page.getByLabel("City").fill("Berlin");
    await page.getByRole("button", { name: /Continue to delivery/ }).click();
    await expect(page.getByText("Please enter a valid postal code.")).toBeVisible();
    await page.getByLabel("Postal code").fill("10115");
    await page.getByRole("button", { name: /Continue to delivery/ }).click();
    await expect(page.getByRole("radio", { name: /Standard delivery/ })).toBeChecked();
    await page.getByRole("radio", { name: /Express delivery/ }).check();
    await page.getByRole("button", { name: /Continue to billing/ }).click();
    await page.getByRole("button", { name: /Continue to payment/ }).click();
    await expect(page.getByRole("heading", { name: "5. Payment" })).toBeVisible();
    await expect(page.getByRole("complementary", { name: "Order summary" })).toContainText("9,95 €");
  });

  test("track order rejects unknown orders and legal pages exist", async ({ page }) => {
    await page.goto("/track-order?order=EX000000-AAAAA&email=nobody%40example.com");
    await expect(page.getByRole("main").getByRole("alert")).toContainText("couldn't find an order");
    for (const path of ["/impressum", "/datenschutz", "/agb", "/widerrufsbelehrung", "/versand", "/rueckgabe", "/cookie-richtlinie", "/faq", "/about", "/contact"]) {
      const res = await page.goto(path);
      expect(res?.status(), path).toBe(200);
    }
    for (const path of ["/this-page-does-not-exist", "/product/does-not-exist", "/collections/nope"]) {
      const res = await page.goto(path);
      expect(res?.status(), path).toBe(404);
    }
  });

  test("SEO endpoints and structured data", async ({ page, request }) => {
    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.ok()).toBe(true);
    expect(await sitemap.text()).toContain("/product/linen-weekend-set");
    expect((await request.get("/robots.txt")).ok()).toBe(true);
    await page.goto("/product/linen-weekend-set");
    const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
    const product = ld.map((s) => JSON.parse(s)).find((j) => j["@type"] === "Product");
    expect(product.offers.priceCurrency).toBe("EUR");
    expect(product.aggregateRating).toBeUndefined(); // no genuine reviews yet
    await expect(page).toHaveTitle(/Linen Weekend Set \| EXEPRA/);
  });
});
