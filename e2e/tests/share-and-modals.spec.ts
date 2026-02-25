import { test, expect } from "../fixtures/base-fixture";

test.describe("Share Link Modal", () => {
  test("opens share modal from production list", async ({ landingPage }) => {
    await landingPage.gotoWithSettings("TestUser");

    // Click the share icon (title="Get share link") on Morning Show
    await landingPage.page.getByTitle("Get share link").first().click();

    // Share modal should appear
    await expect(
      landingPage.page.getByText("Share Production URLs")
    ).toBeVisible();
  });

  test("share modal shows note about single use links", async ({
    landingPage,
  }) => {
    await landingPage.gotoWithSettings("TestUser");
    await landingPage.page.getByTitle("Get share link").first().click();

    await expect(
      landingPage.page.getByText("Each link can only be used once")
    ).toBeVisible();
  });

  test("share modal shows refresh button", async ({ landingPage }) => {
    await landingPage.gotoWithSettings("TestUser");
    await landingPage.page.getByTitle("Get share link").first().click();

    await expect(landingPage.page.getByText(/refresh url/i)).toBeVisible();
  });
});

const isMobile = () => test.info().project.name.startsWith("mobile-");

test.describe("Confirmation Modal", () => {
  test.beforeEach(() => {
    test.skip(
      isMobile(),
      "Manage productions page is not accessible on mobile"
    );
  });

  test("delete production modal has Yes and Cancel buttons", async ({
    manageProductionsPage,
  }) => {
    await manageProductionsPage.goto();
    await manageProductionsPage.expandProduction("Evening News");

    const card = manageProductionsPage.getProductionCard("Evening News");
    await card.getByRole("button", { name: "Delete Production" }).click();

    await expect(
      manageProductionsPage.page.getByRole("button", { name: "Yes" })
    ).toBeVisible();
    await expect(
      manageProductionsPage.page.getByRole("button", { name: "Cancel" })
    ).toBeVisible();
  });

  test("delete production modal shows production name", async ({
    manageProductionsPage,
  }) => {
    await manageProductionsPage.goto();
    await manageProductionsPage.expandProduction("Evening News");

    const card = manageProductionsPage.getProductionCard("Evening News");
    await card.getByRole("button", { name: "Delete Production" }).click();

    await expect(
      manageProductionsPage.page.getByText(/Evening News.*Are you sure/i)
    ).toBeVisible();
  });
});
