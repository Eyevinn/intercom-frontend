import { test, expect } from "../fixtures/base-fixture";

test.describe("Production List", () => {
  test("expands production to show lines", async ({ landingPage }) => {
    await landingPage.gotoWithSettings("TestUser");

    // Click on Morning Show to expand
    await landingPage.page.getByText("Morning Show").click();

    // Should show the lines within the production
    await expect(landingPage.page.getByText("Host Line")).toBeVisible();
    await expect(landingPage.page.getByText("Guest Line")).toBeVisible();
  });

  test("shows participant count for productions", async ({ landingPage }) => {
    await landingPage.gotoWithSettings("TestUser");

    // Morning Show has 1 participant (Alice) — count should show "1"
    const morningShowItem = landingPage.page
      .locator("div")
      .filter({ hasText: "Morning Show" })
      .first();
    // Use exact match to avoid strict mode violation from multiple "1" elements
    await expect(
      morningShowItem.getByText("1", { exact: true }).first()
    ).toBeVisible();
  });

  test("shows Join button on lines when expanded", async ({ landingPage }) => {
    await landingPage.gotoWithSettings("TestUser");

    await landingPage.page.getByText("Morning Show").click();

    // Each line should have a Join button
    const joinButtons = landingPage.page.getByRole("button", {
      name: "Join",
    });
    await expect(joinButtons.first()).toBeVisible();
  });

  test("shows participant name on expanded line", async ({ landingPage }) => {
    await landingPage.gotoWithSettings("TestUser");
    await landingPage.page.getByText("Morning Show").click();

    // Alice is a participant on Host Line
    await expect(landingPage.page.getByText("Alice")).toBeVisible();
  });

  test("shows empty state with create button when no productions", async ({
    landingPage,
    mockApi,
  }) => {
    mockApi.clearProductions();
    await landingPage.gotoWithSettings("TestUser");

    await expect(
      landingPage.page.getByText("No productions yet")
    ).toBeVisible();
    await expect(
      landingPage.page.getByText("Create your first production")
    ).toBeVisible();
  });

  test("empty state create button navigates to create page", async ({
    landingPage,
    mockApi,
  }) => {
    mockApi.clearProductions();
    await landingPage.gotoWithSettings("TestUser");

    await landingPage.page.getByText("Create your first production").click();
    await expect(landingPage.page).toHaveURL(/create-production/);
  });

  test("shows Productions heading", async ({ landingPage }) => {
    await landingPage.gotoWithSettings("TestUser");
    await expect(
      landingPage.page.getByRole("heading", { name: "Productions" })
    ).toBeVisible();
  });

  test("shows multiple productions in list", async ({ landingPage }) => {
    await landingPage.gotoWithSettings("TestUser");
    await landingPage.expectProductionVisible("Morning Show");
    await landingPage.expectProductionVisible("Evening News");
  });

  test("expand Evening News shows Anchor line", async ({ landingPage }) => {
    await landingPage.gotoWithSettings("TestUser");

    await landingPage.page.getByText("Evening News").click();
    await expect(landingPage.page.getByText("Anchor")).toBeVisible();
  });
});
