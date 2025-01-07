import Bowser from "bowser";

const deviceInfo = Bowser.parse(window.navigator.userAgent);
const browser = Bowser.getParser(window.navigator.userAgent);
const browserName = browser.getBrowserName();

const isIOS = (): boolean => {
  const ua = window.navigator.userAgent.toLowerCase();
  return /iphone|ipod|ipad/.test(ua);
};

// platform type, can be either "desktop", "tablet" or "mobile"
export const isMobile = deviceInfo.platform.type === "mobile";
export const isIOSMobile = isIOS() && isMobile;

export const isValidBrowser = browser.satisfies({
  chrome: ">=115",
  edge: ">=115",
  firefox: ">=113",
  safari: ">=16.4",
  samsung: ">=21",
});

export const isBrowserFirefox = browserName.toLowerCase() === "firefox";

// Used because iPads have platform as desktop and browser as Safari
const detectIpad = (): boolean => {
  const ua = window.navigator.userAgent.toLowerCase();
  const platform = window.navigator.platform.toLowerCase();
  const maxTouchPoints = navigator.maxTouchPoints || 0;

  const result =
    platform.includes("ipad") ||
    ua.includes("ipad") ||
    (maxTouchPoints > 1 && platform.includes("mac") && ua.includes("safari"));

  return result;
};

export const isIpad = detectIpad();

export const isTablet = deviceInfo.platform.type === "tablet" || isIpad;
