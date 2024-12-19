import Bowser from "bowser";

export const deviceInfo = Bowser.parse(window.navigator.userAgent);
export const browser = Bowser.getParser(window.navigator.userAgent);
export const browserName = browser.getBrowserName();

// platform type, can be either "desktop", "tablet" or "mobile"
export const isMobile = deviceInfo.platform.type === "mobile";

export const isTablet = deviceInfo.platform.type === "tablet";

export const isValidBrowser = browser.satisfies({
  chrome: ">=115",
  edge: ">=115",
  firefox: ">=113",
  safari: ">=16.4",
  samsung: ">=21",
});

export const isBrowserFirefox = browserName.toLowerCase() === "firefox";

// Helper function to detect iPad specifically
export const isIpad = (): boolean => {
  const ua = window.navigator.userAgent.toLowerCase();
  const platform = window.navigator.platform.toLowerCase();
  const maxTouchPoints = navigator.maxTouchPoints || 0;

  // iPad detection logic
  return (
    platform.includes("ipad") ||
    ua.includes("ipad") || // Older iPads
    (maxTouchPoints > 1 && platform.includes("mac") && ua.includes("safari")) // iPadOS reporting as Mac
  );
};
