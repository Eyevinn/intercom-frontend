import { test as base } from "@playwright/test";
import { LandingPagePO } from "../page-objects/landing-page.po";
import { CreateProductionPagePO } from "../page-objects/create-production-page.po";
import { ManageProductionsPagePO } from "../page-objects/manage-productions-page.po";
import { CallsPagePO } from "../page-objects/calls-page.po";
import { setupApiMocks, type MockApi } from "../helpers/api-mock-handler";
import { setupWebRTCMocks } from "../helpers/webrtc-mock";

type Fixtures = {
  mockApi: MockApi;
  landingPage: LandingPagePO;
  createProductionPage: CreateProductionPagePO;
  manageProductionsPage: ManageProductionsPagePO;
  callsPage: CallsPagePO;
};

export const test = base.extend<Fixtures>({
  mockApi: async ({ page }, use) => {
    await setupWebRTCMocks(page);
    const api = await setupApiMocks(page);
    await use(api);
  },

  landingPage: async ({ page, mockApi }, use) => {
    await use(new LandingPagePO(page, mockApi));
  },

  createProductionPage: async ({ page, mockApi }, use) => {
    await use(new CreateProductionPagePO(page, mockApi));
  },

  manageProductionsPage: async ({ page, mockApi }, use) => {
    await use(new ManageProductionsPagePO(page, mockApi));
  },

  callsPage: async ({ page, mockApi }, use) => {
    await use(new CallsPagePO(page, mockApi));
  },
});

export { expect } from "@playwright/test";
