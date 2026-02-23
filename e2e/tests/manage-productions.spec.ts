import { test, expect } from "../fixtures/base-fixture";

test.describe("Manage Productions", () => {
  test("displays existing productions", async ({
    manageProductionsPage,
  }) => {
    await manageProductionsPage.goto();
    await manageProductionsPage.expectProductionVisible("Morning Show");
    await manageProductionsPage.expectProductionVisible("Evening News");
  });

  test("redirects to home when no productions exist", async ({
    manageProductionsPage,
    mockApi,
  }) => {
    mockApi.clearProductions();
    await manageProductionsPage.goto();
    await expect(manageProductionsPage.page).toHaveURL("/");
  });

  test("navigates back to landing page", async ({
    manageProductionsPage,
  }) => {
    await manageProductionsPage.goto();
    await manageProductionsPage.backButton.click();
    await expect(manageProductionsPage.page).toHaveURL("/");
  });
});
