import Bowser from "bowser";

const deviceInfo = Bowser.parse(window.navigator.userAgent);
const browser = Bowser.getParser(window.navigator.userAgent);

// platform type, can be either "desktop", "tablet" or "mobile"
export const isMobile = deviceInfo.platform.type === "mobile";

export const isValidBrowser = browser.satisfies({
  chrome: ">=80",
  edge: ">=80",
  firefox: ">=113",
  safari: ">=16.4",
  samsung: ">=21",
});
