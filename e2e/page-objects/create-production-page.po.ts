import { Page, Locator, expect } from "@playwright/test";
import { type MockApi } from "../helpers/api-mock-handler";

export class CreateProductionPagePO {
  readonly page: Page;
  readonly mockApi: MockApi;

  readonly productionNameInput: Locator;
  readonly defaultLineInput: Locator;
  readonly addLineButton: Locator;
  readonly createButton: Locator;
  readonly backButton: Locator;

  constructor(page: Page, mockApi: MockApi) {
    this.page = page;
    this.mockApi = mockApi;

    this.productionNameInput = page.getByPlaceholder("Production Name");
    this.defaultLineInput = page.getByPlaceholder("Line Name").first();
    this.addLineButton = page.getByText("Add Line");
    this.createButton = page.getByRole("button", {
      name: "Create Production",
    });
    // NavigateToRootButton is a styled div (not a button) with a BackArrow SVG
    this.backButton = page.locator("div:has(> svg) >> nth=0");
  }

  async goto() {
    await this.page.goto("/create-production");
  }

  async fillAndSubmit(
    productionName: string,
    defaultLineName: string,
    additionalLines: string[] = []
  ) {
    await this.productionNameInput.fill(productionName);
    await this.defaultLineInput.fill(defaultLineName);

    for (const lineName of additionalLines) {
      await this.addLineButton.click();
      const lineInputs = this.page.getByPlaceholder("Line Name");
      await lineInputs.last().fill(lineName);
    }

    await this.createButton.click();
  }

  async expectConfirmation() {
    await expect(this.page.getByText(/has been created/i)).toBeVisible();
  }

  async expectDuplicateLineError() {
    await expect(
      this.page.getByText(/line name must be unique/i)
    ).toBeVisible();
  }
}
