import Bowser from "bowser";

const deviceInfo = Bowser.parse(window.navigator.userAgent);
const browser = Bowser.getParser(window.navigator.userAgent);
const browserName = browser.getBrowserName();

// platform type, can be either "desktop", "tablet" or "mobile"
export const isMobile = deviceInfo.platform.type === "mobile";

export const isValidBrowser = browser.satisfies({
  chrome: ">=115",
  edge: ">=115",
  firefox: ">=113",
  safari: ">=16.4",
  samsung: ">=21",
});

export const isBrowserFirefox = browserName.toLowerCase() === "firefox";
