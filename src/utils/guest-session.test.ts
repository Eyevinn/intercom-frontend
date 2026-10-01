import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  appendGuestParam,
  bootstrapGuestSession,
  guestSession,
} from "./guest-session";

const setUrl = (url: string) => {
  const parsed = new URL(url, "http://localhost");
  vi.stubGlobal("location", {
    pathname: parsed.pathname,
    search: parsed.search,
  });
};

beforeEach(() => {
  sessionStorage.clear();
  vi.unstubAllGlobals();
});

describe("appendGuestParam", () => {
  it("adds the marker to a path without a query string", () => {
    expect(appendGuestParam("/calls")).toBe("/calls?guest=1");
  });

  it("appends to an existing query string", () => {
    expect(appendGuestParam("/calls?lines=p:l")).toBe(
      "/calls?lines=p:l&guest=1"
    );
  });
});

describe("bootstrapGuestSession", () => {
  it("starts a guest session when the marker is present", () => {
    setUrl("/calls?lines=p:l&guest=1");

    bootstrapGuestSession();

    expect(guestSession.isGuest()).toBe(true);
    expect(guestSession.getPath()).toBe("/calls?lines=p:l&guest=1");
  });

  it("does nothing without the marker", () => {
    setUrl("/calls?lines=p:l");

    bootstrapGuestSession();

    expect(guestSession.isGuest()).toBe(false);
    expect(guestSession.getPath()).toBeNull();
  });

  it("ignores a marker with an unexpected value", () => {
    setUrl("/calls?guest=0");

    bootstrapGuestSession();

    expect(guestSession.isGuest()).toBe(false);
  });

  it("ignores the marker outside a calls view", () => {
    setUrl("/?guest=1");

    bootstrapGuestSession();

    expect(guestSession.isGuest()).toBe(false);
  });

  it("accepts the marker on a deep-linked production line", () => {
    setUrl("/production-lines/production/p1/line/l1?guest=1");

    bootstrapGuestSession();

    expect(guestSession.isGuest()).toBe(true);
  });

  it("keeps the marker in the stored path so it survives a new tab", () => {
    setUrl("/calls?lines=p:l&guest=1");

    bootstrapGuestSession();

    expect(guestSession.getPath()).toContain("guest=1");
  });
});

describe("guestSession", () => {
  it("reports a non-guest by default", () => {
    expect(guestSession.isGuest()).toBe(false);
    expect(guestSession.getPath()).toBeNull();
  });

  it("survives a read after start", () => {
    guestSession.start("/calls?lines=p:l&guest=1");

    expect(guestSession.isGuest()).toBe(true);
    expect(guestSession.getPath()).toBe("/calls?lines=p:l&guest=1");
  });
});
