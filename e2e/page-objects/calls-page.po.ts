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
    await this.page.goto(`/lines?lines=${productionId}:${lineId}`);
  }

  async gotoWithSettings(
    productionId: string,
    lineId: string,
    username = "TestUser"
  ) {
    await this.page.addInitScript(
      ({ username }: { username: string }) => {
        // storage-ts uses prefix "id" with dot separator and JSON.stringify values
        localStorage.setItem("id.username", JSON.stringify(username));
        localStorage.setItem("id.audioinput", JSON.stringify("mock-input-1"));
        localStorage.setItem("id.audiooutput", JSON.stringify("mock-output-1"));
      },
      { username }
    );
    await this.page.goto(`/lines?lines=${productionId}:${lineId}`);
  }
}
