export const GUEST_URL_PARAM = "guest";

export const DEFAULT_RESTRICT_SHARE = true;

const GUEST_FLAG_KEY = "intercom_guest_session";
const GUEST_PATH_KEY = "intercom_guest_path";

const read = (key: string): string | null => {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
};

const write = (key: string, value: string): boolean => {
  try {
    sessionStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
};

export const guestSession = {
  isGuest: (): boolean => read(GUEST_FLAG_KEY) === "true",

  getPath: (): string | null => read(GUEST_PATH_KEY),

  start: (path: string): void => {
    write(GUEST_FLAG_KEY, "true");
    write(GUEST_PATH_KEY, path);
  },
};

export const appendGuestParam = (path: string): string =>
  `${path}${path.includes("?") ? "&" : "?"}${GUEST_URL_PARAM}=1`;

const isCallsPath = (pathname: string): boolean =>
  pathname === "/calls" ||
  pathname.startsWith("/calls/") ||
  pathname.startsWith("/production-lines/");

export const bootstrapGuestSession = (): void => {
  const { pathname, search } = window.location;

  if (new URLSearchParams(search).get(GUEST_URL_PARAM) !== "1") return;
  if (!isCallsPath(pathname)) return;

  guestSession.start(`${pathname}${search}`);
};
