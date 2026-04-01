import { test, expect } from "../fixtures/base-fixture";

const isMobileProject = () => test.info().project.name.startsWith("mobile-");

test.describe("Calls Page", () => {
  test("renders at correct URL for valid production and line", async ({
    callsPage,
  }) => {
    await callsPage.gotoWithParams("1", "10");
    await expect(callsPage.page).toHaveURL(/\/calls\?lines=1:10/);
  });

  test("shows join form when no username is set", async ({ callsPage }) => {
    await callsPage.gotoWithParams("1", "10");
    await expect(
      callsPage.page.getByRole("textbox", { name: /username/i })
    ).toBeVisible();
  });

  test("shows Lines header after joining with username", async ({
    callsPage,
  }) => {
    await callsPage.gotoWithSettings("1", "10");
    await expect(callsPage.page.getByText("Calls").first()).toBeVisible();
  });

  test("shows Save as Configuration button when not on mobile", async ({
    callsPage,
  }) => {
    test.skip(isMobileProject(), "Button hidden on mobile");
    await callsPage.gotoWithSettings("1", "10");
    await expect(
      callsPage.page.getByRole("button", { name: /save as configuration/i })
    ).toBeVisible();
  });

  test("shows Save button on mobile", async ({ callsPage }) => {
    test.skip(!isMobileProject(), "Only on mobile");
    await callsPage.gotoWithSettings("1", "10");
    await expect(
      callsPage.page.getByRole("button", { name: /^save$/i })
    ).toBeVisible();
  });

  test("opens save preset modal when Save as Configuration is clicked", async ({
    callsPage,
  }) => {
    test.skip(isMobileProject(), "Button hidden on mobile");
    await callsPage.gotoWithSettings("1", "10");
    await callsPage.page
      .getByRole("button", { name: /save as configuration/i })
      .click();
    await expect(
      callsPage.page.getByRole("heading", { name: /save as configuration/i })
    ).toBeVisible();
  });

  test("invalid line in URL is removed silently", async ({ callsPage }) => {
    // Line 99 does not exist; only line 10 should remain
    await callsPage.page.goto("/calls?lines=1:10,1:99");
    await expect(callsPage.page).toHaveURL(/lines=1:10/);
    await expect(callsPage.page).not.toHaveURL(/1:99/);
  });
});
