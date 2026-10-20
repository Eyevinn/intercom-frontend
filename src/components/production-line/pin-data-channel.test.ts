import { describe, it, expect, vi } from "vitest";
import { sendPinnedEndpoint } from "./pin-data-channel.ts";

const makeChannel = (readyState: RTCDataChannelState = "open") =>
  ({ readyState, send: vi.fn() }) as unknown as RTCDataChannel & {
    send: ReturnType<typeof vi.fn>;
  };

describe("sendPinnedEndpoint", () => {
  it("sends PinnedEndpointsChanged with the endpoint id", () => {
    const channel = makeChannel();

    expect(sendPinnedEndpoint(channel, "endpoint-1")).toBe(true);
    expect(JSON.parse(channel.send.mock.calls[0][0])).toEqual({
      type: "PinnedEndpointsChanged",
      pinnedEndpoints: ["endpoint-1"],
    });
  });

  it("omits pinnedEndpoints to clear the pin", () => {
    const channel = makeChannel();

    expect(sendPinnedEndpoint(channel, null)).toBe(true);
    expect(JSON.parse(channel.send.mock.calls[0][0])).toEqual({
      type: "PinnedEndpointsChanged",
    });
  });

  it("returns false without a channel", () => {
    expect(sendPinnedEndpoint(null, "endpoint-1")).toBe(false);
  });

  it.each(["connecting", "closing", "closed"] as const)(
    "returns false and does not send when the channel is %s",
    (state) => {
      const channel = makeChannel(state);

      expect(sendPinnedEndpoint(channel, "endpoint-1")).toBe(false);
      expect(channel.send).not.toHaveBeenCalled();
    }
  );

  it("returns false when send throws", () => {
    const channel = makeChannel();
    channel.send.mockImplementation(() => {
      throw new Error("InvalidStateError");
    });

    expect(sendPinnedEndpoint(channel, "endpoint-1")).toBe(false);
  });
});
