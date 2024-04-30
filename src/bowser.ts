import Bowser from "bowser";

const deviceInfo = Bowser.parse(window.navigator.userAgent);

// platform type, can be either "desktop", "tablet" or "mobile"
export const isMobile = deviceInfo.platform.type === "mobile";

export const browserName = deviceInfo.browser.name;

export const browserVersion = deviceInfo.browser.version
  ? deviceInfo.browser.version
  : "";

// TODO remove when not needed anymore
console.log("List of all BOWSER-supported browsers", Bowser.BROWSER_MAP);
