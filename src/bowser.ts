import Bowser from "bowser";

const deviceInfo = Bowser.parse(window.navigator.userAgent);

// platform type, can be either "desktop", "tablet" or "mobile"
export const isMobile = deviceInfo.platform.type === "mobile";
