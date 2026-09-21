import { test, expect } from "@playwright/test";

/**
 * Core smoke test: the storefront loads, primary navigation works, a product
 * can be opened and added to the (guest/localStorage) cart, and the cart page
 * reflects it. Read-only against the catalog; never touches checkout.
 */
test.describe("Smoke", () => {
  test("home page loads with header, nav and footer", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/.+/);
    await expect(page.getByRole("link", { name: "Cart" })).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();
  });

  test("product listing page loads with products", async ({ page }) => {
    await page.goto("/products");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const cards = page.locator("a.product-card");
    await expect(cards.first()).toBeVisible({ timeout: 15_000 });
  });

  test("opening a product from the listing shows the product detail page", async ({ page }) => {
    await page.goto("/products");
    const firstCard = page.locator("a.product-card").first();
    await expect(firstCard).toBeVisible({ timeout: 15_000 });
    const productName = await firstCard.locator("h3").innerText();
    await firstCard.click();

    await expect(page).toHaveURL(/\/product\//);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(productName.trim(), {
      timeout: 10_000,
    });
  });

  test("add to cart from the product page updates the cart badge and page", async ({ page }) => {
    // `stock=1` (the "In Stock Only" filter) guarantees the first card's
    // "Add to Cart" button is enabled, regardless of live catalog contents.
    await page.goto("/products?stock=1");
    const firstCard = page.locator("a.product-card").first();
    await expect(firstCard).toBeVisible({ timeout: 15_000 });
    await firstCard.click();
    await expect(page).toHaveURL(/\/product\//);

    const addToCart = page.getByRole("button", { name: "Add to Cart" });
    await expect(addToCart).toBeEnabled();
    await addToCart.click();

    const cartLink = page.getByRole("link", { name: "Cart" });
    await expect(cartLink).toContainText("1");

    await cartLink.click();
    await expect(page).toHaveURL(/\/cart/);
    await expect(page.getByText("Shopping Cart")).toBeVisible();
    // The order summary (with its own "Continue Shopping" link) only renders
    // once the cart has items — the empty-cart state renders a different,
    // centered "Your cart is empty" message instead. Asserting on the
    // "Proceed to Checkout" button is what actually distinguishes the two,
    // rather than "Continue Shopping" being absent (it appears in both states).
    await expect(page.getByRole("button", { name: "Proceed to Checkout" })).toBeVisible();
  });
});
