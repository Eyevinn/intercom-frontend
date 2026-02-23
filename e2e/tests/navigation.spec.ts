import { test, expect } from "../fixtures/base-fixture";

const isMobileProject = () =>
  test.info().project.name.startsWith("mobile-");

test.describe("Navigation", () => {
  test("shows 404 for unknown routes", async ({ page, mockApi }) => {
    await page.goto("/nonexistent-route");
    await expect(page.getByText("Page not found")).toBeVisible();
  });

  test("header is visible on landing page", async ({ page, mockApi }) => {
    await page.goto("/");
    await expect(
      page.getByRole("button", { name: /open intercom/i }),
    ).toBeVisible();
  });

  test("browser back/forward navigation works", async ({ landingPage }) => {
    test.skip(isMobileProject(), "Create button hidden on mobile");
    await landingPage.gotoWithSettings("TestUser");
    await landingPage.createButton.click();
    await expect(landingPage.page).toHaveURL(/create-production/);

    await landingPage.page.goBack();
    await expect(landingPage.page).toHaveURL("/");

    await landingPage.page.goForward();
    await expect(landingPage.page).toHaveURL(/create-production/);
  });
});
