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
    await createProductionPage.expectDuplicateLineError();
  });

  test("can add additional lines", async ({ createProductionPage }) => {
    await createProductionPage.goto();
    await expect(
      createProductionPage.page.getByPlaceholder("Line Name"),
    ).toHaveCount(1);

    await createProductionPage.addLineButton.click();

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

  test("shows Audio Feed checkbox on default line", async ({
    createProductionPage,
  }) => {
    await createProductionPage.goto();
    await expect(
      createProductionPage.page.getByText("Audio Feed").first(),
    ).toBeVisible();
  });

  test("shows Audio Feed checkbox on additional lines", async ({
    createProductionPage,
  }) => {
    await createProductionPage.goto();
    await createProductionPage.addLineButton.click();
    // Both lines should have Audio Feed checkboxes
    const checkboxes = createProductionPage.page.getByRole("checkbox");
    await expect(checkboxes).toHaveCount(2);
  });

  test("shows line numbers on cards", async ({ createProductionPage }) => {
    await createProductionPage.goto();
    await expect(createProductionPage.page.getByText("Line 1")).toBeVisible();

    await createProductionPage.addLineButton.click();
    await expect(createProductionPage.page.getByText("Line 2")).toBeVisible();

    await createProductionPage.addLineButton.click();
    await expect(createProductionPage.page.getByText("Line 3")).toBeVisible();
  });

  test("disables create button when duplicate line names exist", async ({
    createProductionPage,
  }) => {
    await createProductionPage.goto();
    await createProductionPage.productionNameInput.fill("My Show");
    await createProductionPage.defaultLineInput.fill("Duplicate");
    await createProductionPage.addLineButton.click();
    const lineInputs = createProductionPage.page.getByPlaceholder("Line Name");
    await lineInputs.last().fill("Duplicate");

    await expect(createProductionPage.createButton).toBeDisabled();
  });

  test("disables add line button when duplicate line names exist", async ({
    createProductionPage,
  }) => {
    await createProductionPage.goto();
    await createProductionPage.productionNameInput.fill("My Show");
    await createProductionPage.defaultLineInput.fill("Duplicate");
    await createProductionPage.addLineButton.click();
    const lineInputs = createProductionPage.page.getByPlaceholder("Line Name");
    await lineInputs.last().fill("Duplicate");

    await expect(createProductionPage.addLineButton).toBeDisabled();
  });

  test("shows production name required error on empty submit", async ({
    createProductionPage,
  }) => {
    await createProductionPage.goto();
    await createProductionPage.defaultLineInput.fill("Line A");
    await createProductionPage.createButton.click();

    await expect(
      createProductionPage.page.getByText(/production name is required/i),
    ).toBeVisible();
  });

  test("shows line name required error on empty submit", async ({
    createProductionPage,
  }) => {
    await createProductionPage.goto();
    await createProductionPage.productionNameInput.fill("My Show");
    await createProductionPage.createButton.click();

    await expect(
      createProductionPage.page.getByText(/line name is required/i),
    ).toBeVisible();
  });

  test("confirmation auto-hides after creation", async ({
    createProductionPage,
  }) => {
    await createProductionPage.goto();
    await createProductionPage.fillAndSubmit("Temp Show", "Main");
    await createProductionPage.expectConfirmation();

    // Confirmation should disappear after ~4 seconds
    await expect(
      createProductionPage.page.getByText(/has been created/i),
    ).toBeHidden({ timeout: 6000 });
  });

  test("form resets after successful creation", async ({
    createProductionPage,
  }) => {
    await createProductionPage.goto();
    await createProductionPage.fillAndSubmit("Reset Test", "Line A");
    await createProductionPage.expectConfirmation();

    await expect(createProductionPage.productionNameInput).toHaveValue("");
    await expect(createProductionPage.defaultLineInput).toHaveValue("");
  });

  test("case-insensitive duplicate detection", async ({
    createProductionPage,
  }) => {
    await createProductionPage.goto();
    await createProductionPage.productionNameInput.fill("My Show");
    await createProductionPage.defaultLineInput.fill("Host Line");
    await createProductionPage.addLineButton.click();
    const lineInputs = createProductionPage.page.getByPlaceholder("Line Name");
    await lineInputs.last().fill("host line");

    await createProductionPage.expectDuplicateLineError();
  });
});
