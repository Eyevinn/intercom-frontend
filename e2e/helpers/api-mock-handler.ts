import { Page, Route } from "@playwright/test";
import {
  mockProductions,
  mockPresets,
  mockSessionResponse,
  type MockProduction,
  type MockPreset,
} from "../fixtures/mock-data";

export type MockApiState = {
  productions: MockProduction[];
  nextProductionId: number;
  presets: MockPreset[];
  nextPresetId: number;
};

export type MockApi = {
  state: MockApiState;
  addProduction: (production: MockProduction) => void;
  clearProductions: () => void;
  addPreset: (preset: MockPreset) => void;
  clearPresets: () => void;
};

export const setupApiMocks = async (page: Page): Promise<MockApi> => {
  const state: MockApiState = {
    productions: structuredClone(mockProductions),
    nextProductionId: 100,
    presets: structuredClone(mockPresets),
    nextPresetId: 1,
  };

  // WebKit blocks requests to 0.0.0.0 as a restricted network host.
  // Rewrite any 0.0.0.0 URLs to localhost before fetch fires, so the
  // Playwright route mocks can intercept them normally.
  await page.addInitScript(() => {
    const originalFetch = window.fetch;
    window.fetch = (input, init) => {
      if (typeof input === "string" && input.includes("0.0.0.0")) {
        input = input.replace("0.0.0.0", "localhost");
      } else if (input instanceof Request && input.url.includes("0.0.0.0")) {
        input = new Request(input.url.replace("0.0.0.0", "localhost"), input);
      }
      return originalFetch(input, init);
    };
  });

  // Reauth — always succeeds
  await page.route("**/api/v1/reauth", (route: Route) => {
    route.fulfill({ status: 200, body: "" });
  });

  // List productions
  await page.route("**/api/v1/productionlist*", (route: Route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        productions: state.productions,
        offset: 0,
        limit: 0,
        totalItems: state.productions.length,
      }),
    });
  });

  // Share URL
  await page.route("**/api/v1/share", (route: Route) => {
    if (route.request().method() === "POST") {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ url: "https://example.com/shared" }),
      });
    } else {
      route.continue();
    }
  });

  // Session — offer (POST)
  await page.route("**/api/v1/session/", (route: Route) => {
    if (route.request().method() === "POST") {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockSessionResponse),
      });
    } else {
      route.continue();
    }
  });

  // Session — patch/delete
  await page.route("**/api/v1/session/*", (route: Route) => {
    const method = route.request().method();
    if (method === "PATCH" || method === "DELETE") {
      route.fulfill({ status: 200, body: "" });
    } else {
      route.continue();
    }
  });

  // Heartbeat
  await page.route("**/api/v1/heartbeat/*", (route: Route) => {
    route.fulfill({
      status: 200,
      contentType: "text/plain",
      body: "OK",
    });
  });

  // Production line operations (must be registered before generic production routes)
  await page.route("**/api/v1/production/*/line/**", (route: Route) => {
    const method = route.request().method();
    const url = route.request().url();
    const lineMatch = url.match(/production\/(\d+)\/line\/(\d+)/);

    if (method === "GET" && lineMatch) {
      const prodId = lineMatch[1];
      const lineId = lineMatch[2];
      const production = state.productions.find(
        (p) => p.productionId === prodId
      );
      const line = production?.lines.find((l) => l.id === lineId);
      if (line) {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(line),
        });
      } else {
        route.fulfill({ status: 404, body: "Not found" });
      }
    } else if (method === "DELETE" && lineMatch) {
      const prodId = lineMatch[1];
      const lineId = lineMatch[2];
      const production = state.productions.find(
        (p) => p.productionId === prodId
      );
      if (production) {
        production.lines = production.lines.filter((l) => l.id !== lineId);
      }
      route.fulfill({ status: 200, body: "Deleted" });
    } else if (method === "PATCH" && lineMatch) {
      const prodId = lineMatch[1];
      const lineId = lineMatch[2];
      const body = route.request().postDataJSON();
      const production = state.productions.find(
        (p) => p.productionId === prodId
      );
      const line = production?.lines.find((l) => l.id === lineId);
      if (line && body.name) {
        line.name = body.name;
      }
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(production),
      });
    } else {
      route.continue();
    }
  });

  // Production line add (POST to /production/:id/line)
  await page.route("**/api/v1/production/*/line", (route: Route) => {
    const method = route.request().method();
    const url = route.request().url();
    const prodMatch = url.match(/production\/(\d+)\/line$/);

    if (method === "POST" && prodMatch) {
      const prodId = prodMatch[1];
      const body = route.request().postDataJSON();
      const production = state.productions.find(
        (p) => p.productionId === prodId
      );
      if (production) {
        const newLine = {
          name: body.name,
          id: String(production.lines.length + 1),
          smbConferenceId: `conf-new-${production.lines.length}`,
          participants: [],
          programOutputLine: body.programOutputLine || false,
        };
        production.lines.push(newLine);
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(newLine),
        });
      } else {
        route.fulfill({ status: 404, body: "Production not found" });
      }
    } else if (method === "GET" && prodMatch) {
      const prodId = prodMatch[1];
      const production = state.productions.find(
        (p) => p.productionId === prodId
      );
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(production?.lines || []),
      });
    } else {
      route.continue();
    }
  });

  // Create production (POST to /production/)
  await page.route("**/api/v1/production/", (route: Route) => {
    if (route.request().method() === "POST") {
      const body = route.request().postDataJSON();
      const newProduction: MockProduction = {
        name: body.name,
        productionId: String(state.nextProductionId),
        lines: body.lines.map(
          (l: { name: string; programOutputLine?: boolean }, i: number) => ({
            name: l.name,
            id: String(i + 1),
            smbConferenceId: `conf-${state.nextProductionId}-${i}`,
            participants: [],
            programOutputLine: l.programOutputLine || false,
          })
        ),
      };
      state.nextProductionId += 1;
      state.productions.push(newProduction);
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(newProduction),
      });
    } else {
      route.continue();
    }
  });

  // Single production — GET/DELETE/PATCH
  await page.route(/\/api\/v1\/production\/\d+$/, (route: Route) => {
    const method = route.request().method();
    const url = route.request().url();
    const idMatch = url.match(/production\/(\d+)$/);
    const id = idMatch?.[1];

    if (method === "GET" && id) {
      const production = state.productions.find((p) => p.productionId === id);
      if (production) {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(production),
        });
      } else {
        route.fulfill({ status: 404, body: "Not found" });
      }
    } else if (method === "DELETE" && id) {
      state.productions = state.productions.filter(
        (p) => p.productionId !== id
      );
      route.fulfill({ status: 200, body: "Deleted" });
    } else if (method === "PATCH" && id) {
      const body = route.request().postDataJSON();
      const production = state.productions.find((p) => p.productionId === id);
      if (production && body.name) {
        production.name = body.name;
      }
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(production),
      });
    } else {
      route.continue();
    }
  });

  // List presets (GET /preset) and create preset (POST /preset)
  await page.route("**/api/v1/preset", (route: Route) => {
    const method = route.request().method();
    if (method === "GET") {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ presets: state.presets }),
      });
    } else if (method === "POST") {
      const body = route.request().postDataJSON();
      const newPreset: MockPreset = {
        _id: String(state.nextPresetId++),
        name: body.name,
        calls: body.calls ?? [],
        createdAt: new Date().toISOString(),
        isLocal: false,
        companionUrl: body.companionUrl,
      };
      state.presets.push(newPreset);
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(newPreset),
      });
    } else {
      route.continue();
    }
  });

  // Single preset — DELETE/PATCH
  await page.route(/\/api\/v1\/preset\/[^/]+$/, (route: Route) => {
    const method = route.request().method();
    const url = route.request().url();
    const idMatch = url.match(/preset\/([^/]+)$/);
    const id = idMatch?.[1];

    if (method === "DELETE" && id) {
      state.presets = state.presets.filter((p) => p._id !== id);
      route.fulfill({ status: 204, body: "" });
    } else if (method === "PATCH" && id) {
      const body = route.request().postDataJSON();
      const preset = state.presets.find((p) => p._id === id);
      if (preset) {
        if (body.name !== undefined) preset.name = body.name;
        if (body.calls !== undefined) preset.calls = body.calls;
        if (body.companionUrl !== undefined)
          preset.companionUrl = body.companionUrl;
      }
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(preset ?? {}),
      });
    } else {
      route.continue();
    }
  });

  return {
    state,
    addProduction: (production: MockProduction) => {
      state.productions.push(production);
    },
    clearProductions: () => {
      state.productions = [];
    },
    addPreset: (preset: MockPreset) => {
      state.presets.push(preset);
    },
    clearPresets: () => {
      state.presets = [];
    },
  };
};
