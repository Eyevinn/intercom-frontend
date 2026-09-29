import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sanitizeSdp } from "./logger";

const SDP = [
  "v=0",
  "o=- 4611731400430051336 2 IN IP4 127.0.0.1",
  "s=-",
  "t=0 0",
  "c=IN IP4 192.168.1.42",
  "a=candidate:1 1 udp 2130706431 10.0.0.5 54321 typ host",
  "a=ssrc:112233 cname:internal-cname",
  "m=audio 9 UDP/TLS/RTP/SAVPF 111",
  "a=rtpmap:111 opus/48000/2",
  "a=mid:0",
].join("\r\n");

describe("sanitizeSdp", () => {
  it("removes c=, a=candidate and a=ssrc lines", () => {
    const out = sanitizeSdp(SDP);

    expect(out).not.toContain("c=");
    expect(out).not.toContain("a=candidate");
    expect(out).not.toContain("a=ssrc");
  });

  it("strips the IP addresses and stream identifiers those lines carry", () => {
    const out = sanitizeSdp(SDP);

    expect(out).not.toContain("192.168.1.42");
    expect(out).not.toContain("10.0.0.5");
    expect(out).not.toContain("112233");
  });

  it("preserves non-sensitive media and codec lines", () => {
    const out = sanitizeSdp(SDP);

    expect(out).toContain("v=0");
    expect(out).toContain("m=audio 9 UDP/TLS/RTP/SAVPF 111");
    expect(out).toContain("a=rtpmap:111 opus/48000/2");
    expect(out).toContain("a=mid:0");
  });
});

describe("logger redaction (data path)", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("VITE_DEBUG_MODE", "true");
    vi.stubEnv("VITE_DEV_LOGGER_LEVEL", "3");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  const logged = (spy: ReturnType<typeof vi.spyOn>) =>
    spy.mock.calls.map((call: unknown[]) => call.join(" ")).join("\n");

  it("redacts SDP nested in an object payload", async () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    const { default: logger } = await import("./logger");

    logger.data("session", "/whep", { sdp: SDP });

    const output = logged(spy);
    expect(output).not.toContain("192.168.1.42");
    expect(output).not.toContain("a=candidate");
    expect(output).not.toContain("a=ssrc");
    expect(output).toContain("m=audio");
  });

  it("redacts a raw SDP string payload", async () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    const { default: logger } = await import("./logger");

    logger.data("session", "/whip", SDP);

    const output = logged(spy);
    expect(output).not.toContain("192.168.1.42");
    expect(output).not.toContain("112233");
    expect(output).toContain("a=rtpmap:111 opus/48000/2");
  });

  it("leaves non-SDP payloads untouched", async () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    const { default: logger } = await import("./logger");

    logger.data("session", "/status", { state: "connected", count: 3 });

    const output = logged(spy);
    expect(output).toContain("connected");
    expect(output).toContain("3");
  });
});
