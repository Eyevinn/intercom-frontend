import { Page, Locator, expect } from "@playwright/test";
import { type MockApi } from "../helpers/api-mock-handler";

export class LandingPagePO {
  readonly page: Page;
  readonly mockApi: MockApi;

  // User settings form (shown before production list)
  readonly usernameInput: Locator;
  readonly nextButton: Locator;

  // Production list
  readonly createButton: Locator;
  readonly manageButton: Locator;
  readonly emptyStateText: Locator;

  constructor(page: Page, mockApi: MockApi) {
    this.page = page;
    this.mockApi = mockApi;

    this.usernameInput = page.getByPlaceholder("Username");
    this.nextButton = page.getByRole("button", { name: "Next" });

    this.createButton = page.getByRole("button", { name: /create/i });
    this.manageButton = page.getByRole("button", { name: /manage/i });
    this.emptyStateText = page.getByText("No productions yet");
  }

  async goto() {
    await this.page.goto("/");
  }

  async completeUserSettings(username = "TestUser") {
    await this.usernameInput.fill(username);
    await this.nextButton.click();
  }

  async gotoWithSettings(username = "TestUser") {
    await this.goto();
    await this.completeUserSettings(username);
  }

  async expectProductionVisible(name: string) {
    await expect(this.page.getByText(name).first()).toBeVisible();
  }

  async expectEmptyState() {
    await expect(this.emptyStateText).toBeVisible();
  }
}
