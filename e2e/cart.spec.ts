import { test, expect } from "@playwright/test";

test.describe("Cart", () => {
  test("increase quantity, decrease quantity, then remove the item empties the cart", async ({ page }) => {
    await page.goto("/products?stock=1");
    const firstCard = page.locator("a.product-card").first();
    await expect(firstCard).toBeVisible({ timeout: 15_000 });
    const addButton = firstCard.getByRole("button", { name: /Add .* to cart/ });
    await addButton.click();

    await page.goto("/cart");
    await expect(page.getByRole("link", { name: "Cart" })).toContainText("1");

    const increase = page.getByRole("button", { name: "Increase quantity" });
    const decrease = page.getByRole("button", { name: "Decrease quantity" });
    const qtyLabel = page.locator("span.tabular-nums").first();

    await expect(qtyLabel).toHaveText("1");
    await increase.click();
    await expect(qtyLabel).toHaveText("2");
    await expect(page.getByRole("link", { name: "Cart" })).toContainText("2");

    await decrease.click();
    await expect(qtyLabel).toHaveText("1");
    await expect(page.getByRole("link", { name: "Cart" })).toContainText("1");

    const removeButton = page.getByRole("button", { name: /^Remove /i });
    await removeButton.click();

    await expect(page.getByText("Your cart is empty")).toBeVisible();
    await expect(page.getByRole("link", { name: "Cart" })).not.toContainText(/[0-9]/);
  });

  test("cart persists across a page refresh", async ({ page }) => {
    await page.goto("/products?stock=1");
    const firstCard = page.locator("a.product-card").first();
    await expect(firstCard).toBeVisible({ timeout: 15_000 });
    await firstCard.getByRole("button", { name: /Add .* to cart/ }).click();
    await expect(page.getByRole("link", { name: "Cart" })).toContainText("1");

    await page.reload();
    await expect(page.getByRole("link", { name: "Cart" })).toContainText("1");

    await page.goto("/cart");
    await expect(page.getByText("Your cart is empty")).toHaveCount(0);
  });
});
