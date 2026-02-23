import { test, expect } from "../fixtures/base-fixture";

test.describe("Error States", () => {
  test("shows 404 page with back button for unknown routes", async ({
    page,
    mockApi,
  }) => {
    await page.goto("/some/unknown/path");
    await expect(page.getByText("Page not found")).toBeVisible();

    // Should have a back navigation element
    const backButton = page.locator("div:has(> svg) >> nth=0");
    await expect(backButton).toBeVisible();
  });

  test("404 back button navigates to home", async ({ page, mockApi }) => {
    await page.goto("/nonexistent");
    await expect(page.getByText("Page not found")).toBeVisible();

    // Click back button
    await page.locator("div:has(> svg) >> nth=0").click();
    await expect(page).toHaveURL("/");
  });

  test("handles API error on production list gracefully", async ({
    page,
    mockApi,
  }) => {
    // Override the production list route to return an error
    await page.route("**/api/v1/productionlist*", (route) => {
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Internal Server Error" }),
      });
    });

    await page.goto("/");
    // The app should still render — not crash
    await expect(
      page.getByRole("button", { name: /open intercom/i }),
    ).toBeVisible();
  });

  test("shows header on all pages including error states", async ({
    page,
    mockApi,
  }) => {
    // Visit a 404 page
    await page.goto("/does-not-exist");
    await expect(
      page.getByRole("button", { name: /open intercom/i }),
    ).toBeVisible();
  });
});
