import { defineConfig, devices } from "@playwright/test";

const BASE_URL = "http://localhost:5173";

export default defineConfig({
  testDir: "./e2e/tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI
    ? [["html", { open: "never" }], ["github"]]
    : [["html", { open: "on-failure" }]],
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "on-first-retry",
    locale: "en-US",
    timezoneId: "UTC",
  },
  webServer: {
    command: "yarn dev",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
    env: {
      VITE_BACKEND_URL: "http://localhost:8000/",
      VITE_BACKEND_API_VERSION: "api/v1/",
    },
  },
  projects: [
    // Desktop — Chromium at three laptop sizes (local only, CI runs chromium-15inch)
    ...(process.env.CI
      ? []
      : [
          {
            name: "chromium-13inch",
            use: {
              ...devices["Desktop Chrome"],
              viewport: { width: 1280, height: 800 },
            },
          },
        ]),
    {
      name: "chromium-15inch",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
    ...(process.env.CI
      ? []
      : [
          {
            name: "chromium-17inch",
            use: {
              ...devices["Desktop Chrome"],
              viewport: { width: 1920, height: 1080 },
            },
          },
        ]),
    // Desktop — Firefox
    {
      name: "firefox-15inch",
      use: {
        ...devices["Desktop Firefox"],
        viewport: { width: 1440, height: 900 },
        launchOptions: {
          firefoxUserPrefs: {
            "media.navigator.permission.disabled": true,
            "media.navigator.streams.fake": true,
          },
        },
      },
    },
    // Desktop — WebKit (Safari)
    {
      name: "webkit-15inch",
      use: {
        ...devices["Desktop Safari"],
        viewport: { width: 1440, height: 900 },
      },
    },
    // Mobile
    {
      name: "mobile-iphone-se",
      use: {
        ...devices["iPhone SE"],
      },
    },
    ...(process.env.CI
      ? []
      : [
          {
            name: "mobile-iphone-14",
            use: {
              ...devices["iPhone 14"],
            },
          },
        ]),
  ],
});
