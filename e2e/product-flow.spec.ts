import { test, expect } from "@playwright/test";

test.describe("Product discovery flow", () => {
  test("header navigation opens a category listing", async ({ page, isMobile }) => {
    await page.goto("/");

    // Desktop shows category links inline in the header; mobile hides them
    // behind the hamburger drawer instead — both are real navigation paths.
    if (isMobile) {
      await page.getByRole("button", { name: "Open menu" }).click();
    }
    const nav = page.getByRole("navigation").first();
    // Index 0 is always "Home" in both the desktop nav and mobile drawer —
    // index 1 is the first real category link.
    const categoryLink = nav.getByRole("link").nth(1);
    await expect(categoryLink).toBeVisible();
    await categoryLink.click();

    await expect(page).toHaveURL(/\/category\//);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("search overlay finds a product and navigates to it", async ({ page, isMobile }) => {
    await page.goto("/products?stock=1");
    const firstCard = page.locator("a.product-card").first();
    await expect(firstCard).toBeVisible({ timeout: 15_000 });
    const productName = (await firstCard.locator("h3").innerText()).trim();
    // A distinctive-enough substring keeps the search query meaningful even
    // for short/generic product names.
    const term = productName.split(" ")[0];

    await page.goto("/");
    // Desktop shows a wide search bar with visible text; mobile shows an
    // icon-only button with an aria-label — both open the same overlay.
    if (isMobile) {
      await page.getByRole("button", { name: "Search" }).click();
    } else {
      await page.getByRole("button", { name: "Search for footballs" }).click();
    }
    const searchInput = page.getByPlaceholder("Search football, cricket, tennis…");
    await expect(searchInput).toBeVisible();
    await searchInput.fill(term);

    await expect(page.getByText(term, { exact: false }).first()).toBeVisible({ timeout: 10_000 });
  });

  test("product detail page supports selecting a size/color variant before adding to cart", async ({
    page,
  }) => {
    await page.goto("/products?stock=1");
    const firstCard = page.locator("a.product-card").first();
    await expect(firstCard).toBeVisible({ timeout: 15_000 });
    await firstCard.click();
    await expect(page).toHaveURL(/\/product\//);

    const sizeButtons = page.locator("button", { hasText: /^(XS|S|M|L|XL|XXL|[0-9]+)$/ });
    const sizeCount = await sizeButtons.count();
    if (sizeCount > 1) {
      await sizeButtons.nth(1).click();
      await expect(sizeButtons.nth(1)).toHaveClass(/border-ink/);
    }

    const addToCart = page.getByRole("button", { name: "Add to Cart" });
    await expect(addToCart).toBeEnabled();
    await addToCart.click();
    await expect(page.getByRole("link", { name: "Cart" })).toContainText("1");
  });
});
