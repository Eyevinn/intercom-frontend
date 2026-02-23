import { test, expect } from "../fixtures/base-fixture";

test.describe("Responsive Layout", () => {
  test("user settings form renders on all viewports", async ({
    landingPage,
  }) => {
    await landingPage.goto();
    await expect(landingPage.usernameInput).toBeVisible();
    await expect(landingPage.nextButton).toBeVisible();
  });

  test("create production form renders on all viewports", async ({
    createProductionPage,
  }) => {
    await createProductionPage.goto();
    await expect(createProductionPage.productionNameInput).toBeVisible();
    await expect(createProductionPage.createButton).toBeVisible();
  });

  test("production list renders on all viewports", async ({
    landingPage,
  }) => {
    await landingPage.gotoWithSettings("TestUser");
    await landingPage.expectProductionVisible("Morning Show");
  });
});
