import { test, expect } from "@playwright/test";

test.describe("Filter, sort and pagination", () => {
  // The filter sidebar only renders at `lg` breakpoints and up (the mobile
  // drawer is a separate component) — keep these to desktop.
  test.skip(({ isMobile }) => isMobile, "Filter sidebar is desktop-only; mobile uses a separate drawer");

  test("applying a brand filter narrows results and updates the URL, and Clear All resets it", async ({
    page,
  }) => {
    await page.goto("/products");
    await expect(page.locator("a.product-card").first()).toBeVisible({ timeout: 15_000 });
    const totalBefore = await page.locator("a.product-card").count();

    await page.getByRole("button", { name: "Brand" }).click();
    const firstCheckbox = page.getByRole("checkbox").first();
    await expect(firstCheckbox).toBeVisible();
    await firstCheckbox.click();

    await expect(page).toHaveURL(/[?&]brand=/);
    await expect(page.getByRole("checkbox").first()).toHaveAttribute("data-state", "checked");

    await page.getByRole("button", { name: "Clear All" }).click();
    await expect(page).not.toHaveURL(/[?&]brand=/);
    await expect(page.locator("a.product-card")).toHaveCount(totalBefore, { timeout: 10_000 });
  });

  test("changing sort order updates the URL and resets to page 1", async ({ page }) => {
    await page.goto("/products?page=2");
    await page.getByRole("button", { name: /Sort By/i }).click();
    await page.getByRole("menuitemradio", { name: "Price: Low to High" }).click();

    await expect(page).toHaveURL(/sort=price-low-high/);
    await expect(page).not.toHaveURL(/[?&]page=/);
  });

  test("pagination navigates to page 2 when more than one page exists", async ({ page }) => {
    await page.goto("/products");
    const nextButton = page.getByRole("button", { name: "Next page" });
    if ((await nextButton.count()) === 0) {
      test.skip(true, "Catalog doesn't have enough products for a second page");
    }
    await expect(nextButton).toBeEnabled();
    await nextButton.click();

    await expect(page).toHaveURL(/[?&]page=2/);
    await expect(page.locator("a.product-card").first()).toBeVisible({ timeout: 15_000 });
  });
});
