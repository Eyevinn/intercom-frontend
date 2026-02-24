import { Page, Locator, expect } from "@playwright/test";
import { type MockApi } from "../helpers/api-mock-handler";

export class ManageProductionsPagePO {
  readonly page: Page;
  readonly mockApi: MockApi;
  readonly backButton: Locator;

  constructor(page: Page, mockApi: MockApi) {
    this.page = page;
    this.mockApi = mockApi;
    // NavigateToRootButton is a styled div (not a button) with a BackArrow SVG
    this.backButton = page.locator("div:has(> svg) >> nth=0");
  }

  async goto() {
    await this.page.goto("/manage-productions");
  }

  getProductionItem(name: string) {
    return this.page.getByText(name).first();
  }

  /**
   * Get the collapsible card container for a production by name.
   * Manage productions is desktop-only (skipped on mobile projects).
   */
  getProductionCard(name: string): Locator {
    return this.page
      .locator("div")
      .filter({ hasText: new RegExp(`^${name}`) })
      .first();
  }

  /**
   * Expand a production card by clicking it, then wait for buttons to appear.
   */
  async expandProduction(name: string) {
    await this.page.getByText(name, { exact: true }).click();
    await expect(
      this.getProductionCard(name).getByRole("button", {
        name: "Delete Production",
      })
    ).toBeVisible();
  }

  async expectProductionVisible(name: string) {
    await expect(this.getProductionItem(name)).toBeVisible();
  }
}
