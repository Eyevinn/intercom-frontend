import { Page, Locator } from "@playwright/test";
import { type MockApi } from "../helpers/api-mock-handler";

const USER_SETTINGS_KEY = "userSettings";

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
      ({ key, value }: { key: string; value: string }) => {
        localStorage.setItem(key, value);
      },
      {
        key: USER_SETTINGS_KEY,
        value: JSON.stringify({ username }),
      }
    );
    await this.page.goto(`/lines?lines=${productionId}:${lineId}`);
  }
}
