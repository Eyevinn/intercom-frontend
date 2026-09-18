import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { maybeRedirectToAuth } from "./redirect-on-auth-failure.ts";

const AUTH_URL =
  "https://app.osaas.io/?redirect=/dashboard/service/eyevinn-intercom-manager";

describe("maybeRedirectToAuth", () => {
  let assignSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // happy-dom would perform a real navigation on assign; stub it out so we can
    // assert the call without side effects.
    assignSpy = vi
      .spyOn(window.location, "assign")
      .mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("redirects to AUTH on a 401 when AUTH is set", () => {
    vi.stubEnv("AUTH", AUTH_URL);

    const result = maybeRedirectToAuth(401);

    expect(result).toBe(true);
    expect(assignSpy).toHaveBeenCalledTimes(1);
    expect(assignSpy).toHaveBeenCalledWith(AUTH_URL);
  });

  it("does nothing on a 401 when AUTH is unset", () => {
    vi.stubEnv("AUTH", "");

    const result = maybeRedirectToAuth(401);

    expect(result).toBe(false);
    expect(assignSpy).not.toHaveBeenCalled();
  });

  it("does nothing on a non-401 status even when AUTH is set", () => {
    vi.stubEnv("AUTH", AUTH_URL);

    expect(maybeRedirectToAuth(500)).toBe(false);
    expect(maybeRedirectToAuth(200)).toBe(false);
    expect(maybeRedirectToAuth(403)).toBe(false);
    expect(assignSpy).not.toHaveBeenCalled();
  });

  it("does not redirect if already at the AUTH url (loop guard)", () => {
    vi.stubEnv("AUTH", window.location.href);

    const result = maybeRedirectToAuth(401);

    expect(result).toBe(false);
    expect(assignSpy).not.toHaveBeenCalled();
  });
});
