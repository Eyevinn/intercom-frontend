import Bowser from "bowser";

const deviceInfo = Bowser.parse(window.navigator.userAgent);

export const isMobile = deviceInfo.platform.type === "mobile";

export const isDesktop = deviceInfo.platform.type === "desktop";
