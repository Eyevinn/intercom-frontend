import { test, expect } from "../fixtures/base-fixture";

const isMobile = () => test.info().project.name.startsWith("mobile-");

test.describe("Manage Productions", () => {
  test.beforeEach(() => {
    test.skip(
      isMobile(),
      "Manage productions page is not accessible on mobile"
    );
  });
  test("displays existing productions", async ({ manageProductionsPage }) => {
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

  test("navigates back to landing page", async ({ manageProductionsPage }) => {
    await manageProductionsPage.goto();
    await manageProductionsPage.backButton.click();
    await expect(manageProductionsPage.page).toHaveURL("/");
  });

  test("shows Manage Productions heading", async ({
    manageProductionsPage,
  }) => {
    await manageProductionsPage.goto();
    await expect(
      manageProductionsPage.page.getByText("Manage Productions")
    ).toBeVisible();
  });

  test("shows Delete Production button for each production", async ({
    manageProductionsPage,
  }) => {
    await manageProductionsPage.goto();
    await manageProductionsPage.page.getByText("Evening News").click();

    const deleteProductionBtns = manageProductionsPage.page.getByRole(
      "button",
      { name: "Delete Production" }
    );
    await expect(deleteProductionBtns.first()).toBeVisible();
  });

  test("shows Add Line button for expanded production", async ({
    manageProductionsPage,
  }) => {
    await manageProductionsPage.goto();
    await manageProductionsPage.page.getByText("Evening News").click();

    await expect(
      manageProductionsPage.page
        .getByRole("button", { name: "Add Line" })
        .first()
    ).toBeVisible();
  });

  test("shows delete confirmation modal for production", async ({
    manageProductionsPage,
  }) => {
    await manageProductionsPage.goto();
    await manageProductionsPage.expandProduction("Evening News");

    const card = manageProductionsPage.getProductionCard("Evening News");
    await card.getByRole("button", { name: "Delete Production" }).click();

    await expect(
      manageProductionsPage.page.getByText(
        /you are about to delete the production/i
      )
    ).toBeVisible();
    await expect(
      manageProductionsPage.page.getByRole("button", { name: "Yes" })
    ).toBeVisible();
    await expect(
      manageProductionsPage.page.getByRole("button", { name: "Cancel" })
    ).toBeVisible();
  });

  test("can cancel delete production", async ({ manageProductionsPage }) => {
    await manageProductionsPage.goto();
    await manageProductionsPage.expandProduction("Evening News");

    const card = manageProductionsPage.getProductionCard("Evening News");
    await card.getByRole("button", { name: "Delete Production" }).click();

    await manageProductionsPage.page
      .getByRole("button", { name: "Cancel" })
      .click();

    await expect(
      manageProductionsPage.page.getByText(
        /you are about to delete the production/i
      )
    ).toBeHidden();
    await manageProductionsPage.expectProductionVisible("Evening News");
  });

  test("can delete a production", async ({ manageProductionsPage }) => {
    await manageProductionsPage.goto();
    await manageProductionsPage.expandProduction("Evening News");

    const card = manageProductionsPage.getProductionCard("Evening News");
    await card.getByRole("button", { name: "Delete Production" }).click();

    await manageProductionsPage.page
      .getByRole("button", { name: "Yes" })
      .click();

    await expect(
      manageProductionsPage.page.getByText("Evening News", { exact: true })
    ).not.toBeVisible({ timeout: 5000 });
  });

  test("shows Delete button for lines", async ({ manageProductionsPage }) => {
    await manageProductionsPage.goto();
    await manageProductionsPage.page.getByText("Morning Show").click();

    const deleteButtons = manageProductionsPage.page.getByRole("button", {
      name: "Delete",
      exact: true,
    });
    await expect(deleteButtons.first()).toBeVisible();
  });

  test("disables line Delete button when line has participants", async ({
    manageProductionsPage,
  }) => {
    await manageProductionsPage.goto();
    await manageProductionsPage.page.getByText("Morning Show").click();

    // Host Line has Alice — its Delete button should be disabled
    const deleteButtons = manageProductionsPage.page.getByRole("button", {
      name: "Delete",
      exact: true,
    });
    await expect(deleteButtons.first()).toBeDisabled();
  });

  test("shows line delete confirmation modal", async ({
    manageProductionsPage,
  }) => {
    await manageProductionsPage.goto();
    await manageProductionsPage.page.getByText("Morning Show").click();

    // Click Delete on Guest Line (second delete button — enabled, no participants)
    const deleteButtons = manageProductionsPage.page.getByRole("button", {
      name: "Delete",
      exact: true,
    });
    await deleteButtons.nth(1).click();

    await expect(
      manageProductionsPage.page.getByText(/you are about to delete the line/i)
    ).toBeVisible();
  });

  test("can add a line in manage mode", async ({ manageProductionsPage }) => {
    await manageProductionsPage.goto();
    await manageProductionsPage.expandProduction("Evening News");

    const card = manageProductionsPage.getProductionCard("Evening News");
    await card.getByRole("button", { name: "Add Line" }).click();

    await expect(
      manageProductionsPage.page.getByPlaceholder("Line Name")
    ).toBeVisible();

    await manageProductionsPage.page
      .getByPlaceholder("Line Name")
      .fill("New Reporter Line");
    await manageProductionsPage.page
      .getByRole("button", { name: "Create", exact: true })
      .click();

    await expect(
      manageProductionsPage.page.getByText(/has been created/i)
    ).toBeVisible();
  });

  test("Delete Production disabled when production has participants", async ({
    manageProductionsPage,
  }) => {
    await manageProductionsPage.goto();
    await manageProductionsPage.page.getByText("Morning Show").click();

    // Morning Show has 1 participant (Alice) — Delete Production should be disabled
    const deleteProdBtns = manageProductionsPage.page.getByRole("button", {
      name: "Delete Production",
    });
    await expect(deleteProdBtns.first()).toBeDisabled();
  });
});
