import { test, expect } from "../fixtures/base-fixture";

const isWebkitProject = () =>
  ["webkit-15inch", "mobile-iphone-se", "mobile-iphone-14"].includes(
    test.info().project.name,
  );

test.describe("User Settings", () => {
  test("shows username field as required", async ({ landingPage }) => {
    await landingPage.goto();

    // Click Next without entering a username
    await landingPage.nextButton.click();

    // Should stay on settings page (not navigate away)
    await expect(landingPage.usernameInput).toBeVisible();
  });

  test("shows device input section", async ({ landingPage }) => {
    await landingPage.goto();
    await expect(landingPage.page.getByText("Input")).toBeVisible();
  });

  test("shows device output section", async ({ landingPage }) => {
    test.skip(isWebkitProject(), "Safari hides output device selector");
    await landingPage.goto();
    await expect(landingPage.page.getByText("Output")).toBeVisible();
  });

  test("shows Devices heading", async ({ landingPage }) => {
    await landingPage.goto();
    await expect(landingPage.page.getByText("Devices")).toBeVisible();
  });

  test("input device dropdown has mock device option", async ({
    landingPage,
  }) => {
    await landingPage.goto();
    // The select element has an option with Mock Microphone
    const inputSelect = landingPage.page.locator(
      'select, [role="combobox"]',
    ).first();
    await expect(inputSelect).toBeVisible();
    await expect(inputSelect.locator("option")).toHaveCount(1);
  });

  test("output device dropdown has mock device option", async ({
    landingPage,
  }) => {
    test.skip(isWebkitProject(), "Safari hides output device selector");
    await landingPage.goto();
    // Second select is the output device
    const selects = landingPage.page.locator('select, [role="combobox"]');
    await expect(selects).toHaveCount(2);
  });

  test("can complete settings and see production list", async ({
    landingPage,
  }) => {
    await landingPage.goto();
    await landingPage.usernameInput.fill("MyUser");
    await landingPage.nextButton.click();

    await landingPage.expectProductionVisible("Morning Show");
  });

  test("shows user settings button after completing settings", async ({
    landingPage,
  }) => {
    await landingPage.gotoWithSettings("TestUser");
    await expect(landingPage.page.getByText("TestUser")).toBeVisible();
  });

  test("can reopen settings from production list", async ({
    landingPage,
  }) => {
    await landingPage.gotoWithSettings("TestUser");
    await landingPage.page.getByText("TestUser").click();

    await expect(
      landingPage.page.getByRole("button", { name: "Save" }),
    ).toBeVisible();
  });

  test("username persists when reopening settings", async ({
    landingPage,
  }) => {
    await landingPage.gotoWithSettings("PersistUser");
    await landingPage.page.getByText("PersistUser").click();

    await expect(landingPage.usernameInput).toHaveValue("PersistUser");
  });

  test("shows Refresh devices button", async ({ landingPage }) => {
    await landingPage.goto();
    await expect(
      landingPage.page.getByRole("button", { name: "Refresh devices" }),
    ).toBeVisible();
  });
});
