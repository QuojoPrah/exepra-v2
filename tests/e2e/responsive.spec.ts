import { expect, test } from "@playwright/test";

const pages = ["/", "/shop", "/women", "/product/linen-weekend-set", "/cart", "/checkout", "/account/login", "/faq"];
const widths = [375, 390, 430, 768, 1024, 1440, 1920];

test.describe("responsive layout", () => {
  for (const width of widths) {
    test(`no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      for (const path of pages) {
        await page.goto(path);
        await page.waitForLoadState("networkidle");
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow, `${path} overflows by ${overflow}px at ${width}px`).toBeLessThanOrEqual(0);
      }
    });
  }

  test("mobile navigation opens and links work", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await page.getByRole("button", { name: "Necessary only" }).click();
    await page.getByRole("button", { name: "Open menu" }).click();
    const menu = page.getByRole("dialog", { name: "Menu" });
    await expect(menu).toBeVisible();
    await menu.getByRole("link", { name: "Kids" }).first().click();
    await expect(page).toHaveURL(/\/kids$/);
  });
});
