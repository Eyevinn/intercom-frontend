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
   * Uses data-testid="production-{name}" on CollapsibleItemWrapper.
   */
  getProductionCard(name: string): Locator {
    return this.page.getByTestId(`production-${name}`);
  }

  /**
   * Expand a production card by clicking its chevron icon, then wait
   * for the "Delete Production" button to appear.
   */
  async expandProduction(name: string) {
    const card = this.getProductionCard(name);
    await expect(card).toBeVisible();

    // Click the chevron (data-testid="chevron") — avoids the edit icon SVG
    // that appears first in management mode.
    await card.getByTestId("chevron").click();

    await expect(
      card.getByRole("button", { name: "Delete Production" })
    ).toBeVisible();
  }

  async expectProductionVisible(name: string) {
    await expect(this.getProductionItem(name)).toBeVisible();
  }
}
