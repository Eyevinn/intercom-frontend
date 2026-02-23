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

  async expectProductionVisible(name: string) {
    await expect(this.getProductionItem(name)).toBeVisible();
  }
}
