import { test, expect } from "../fixtures/base-fixture";

test.describe("Create Production", () => {
  test("shows create production form", async ({ createProductionPage }) => {
    await createProductionPage.goto();
    await expect(createProductionPage.productionNameInput).toBeVisible();
    await expect(createProductionPage.defaultLineInput).toBeVisible();
    await expect(createProductionPage.createButton).toBeVisible();
  });

  test("creates a production with one line", async ({
    createProductionPage,
  }) => {
    await createProductionPage.goto();
    await createProductionPage.fillAndSubmit("My Show", "Main Line");
    await createProductionPage.expectConfirmation();
  });

  test("creates a production with multiple lines", async ({
    createProductionPage,
  }) => {
    await createProductionPage.goto();
    await createProductionPage.fillAndSubmit("Multi Show", "Line 1", [
      "Line 2",
      "Line 3",
    ]);
    await createProductionPage.expectConfirmation();
  });

  test("shows duplicate line name error", async ({
    createProductionPage,
  }) => {
    await createProductionPage.goto();
    await createProductionPage.productionNameInput.fill("My Show");
    await createProductionPage.defaultLineInput.fill("Same Name");
    await createProductionPage.addLineButton.click();
    const lineInputs = createProductionPage.page.getByPlaceholder("Line Name");
    await lineInputs.last().fill("Same Name");
    // Validation is reactive — error shows without clicking submit
    await createProductionPage.expectDuplicateLineError();
  });

  test("can add additional lines", async ({ createProductionPage }) => {
    await createProductionPage.goto();
    // Default has 1 line input
    await expect(
      createProductionPage.page.getByPlaceholder("Line Name"),
    ).toHaveCount(1);

    await createProductionPage.addLineButton.click();

    // After clicking Add Line, should have 2 line inputs
    await expect(
      createProductionPage.page.getByPlaceholder("Line Name"),
    ).toHaveCount(2);
  });

  test("navigates back from create production", async ({
    createProductionPage,
  }) => {
    await createProductionPage.goto();
    await createProductionPage.backButton.click();
    await expect(createProductionPage.page).toHaveURL("/");
  });
});
