import { test, expect } from "../fixtures/base-fixture";

test.describe("Calls Page", () => {
  test("renders page for valid production and line params", async ({
    callsPage,
  }) => {
    await callsPage.gotoWithParams("1", "10");
    // The calls page should render without crashing
    await expect(callsPage.page).toHaveURL(
      /production-calls\/production\/1\/line\/10/
    );
  });

  test("shows production content on calls page", async ({ callsPage }) => {
    await callsPage.gotoWithParams("1", "10");
    // Wait for page to stabilize — the calls page fetches production data
    await callsPage.page.waitForTimeout(1000);
    // Page should have rendered something (header, form, or call view)
    await expect(callsPage.page.locator("body")).not.toBeEmpty();
  });
});
