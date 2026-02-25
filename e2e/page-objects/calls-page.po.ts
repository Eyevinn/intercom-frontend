import { Page, Locator } from "@playwright/test";
import { type MockApi } from "../helpers/api-mock-handler";

export class CallsPagePO {
  readonly page: Page;
  readonly mockApi: MockApi;
  readonly exitButton: Locator;

  constructor(page: Page, mockApi: MockApi) {
    this.page = page;
    this.mockApi = mockApi;
    this.exitButton = page.getByRole("button", { name: /exit/i });
  }

  async gotoWithParams(productionId: string, lineId: string) {
    await this.page.goto(
      `/production-calls/production/${productionId}/line/${lineId}`
    );
  }
}
