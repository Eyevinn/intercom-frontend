import { test, expect } from "../fixtures/base-fixture";

const isMobileProject = () =>
  test.info().project.name.startsWith("mobile-");

test.describe("Landing Page", () => {
  test("shows user settings form on first visit", async ({ landingPage }) => {
    await landingPage.goto();
    await expect(landingPage.usernameInput).toBeVisible();
    await expect(landingPage.nextButton).toBeVisible();
  });

  test("shows username field with placeholder", async ({ landingPage }) => {
    await landingPage.goto();
    await expect(landingPage.usernameInput).toHaveAttribute(
      "placeholder",
      "Username",
    );
  });

  test("shows production list after completing settings", async ({
    landingPage,
  }) => {
    await landingPage.gotoWithSettings("TestUser");
    await landingPage.expectProductionVisible("Morning Show");
    await landingPage.expectProductionVisible("Evening News");
  });

  test("shows empty state when no productions exist", async ({
    landingPage,
    mockApi,
  }) => {
    mockApi.clearProductions();
    await landingPage.gotoWithSettings("TestUser");
    await landingPage.expectEmptyState();
  });

  test("navigates to create production page", async ({ landingPage }) => {
    test.skip(isMobileProject(), "Create button hidden on mobile");
    await landingPage.gotoWithSettings("TestUser");
    await landingPage.createButton.click();
    await expect(landingPage.page).toHaveURL(/create-production/);
  });

  test("navigates to manage productions page", async ({ landingPage }) => {
    test.skip(isMobileProject(), "Manage button hidden on mobile");
    await landingPage.gotoWithSettings("TestUser");
    await landingPage.manageButton.click();
    await expect(landingPage.page).toHaveURL(/manage-productions/);
  });

  test("shows User Settings heading on initial visit", async ({
    landingPage,
  }) => {
    await landingPage.goto();
    await expect(
      landingPage.page.getByText("User Settings").first(),
    ).toBeVisible();
  });
});
