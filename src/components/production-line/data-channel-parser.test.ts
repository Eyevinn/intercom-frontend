import { describe, it, expect } from "vitest";
import {
  parseDataChannelMessage,
  isRemoteMute,
  type EndpointMessage,
} from "./data-channel-parser.ts";

describe("parseDataChannelMessage", () => {
  it("parses a valid DominantSpeaker message", () => {
    const data = JSON.stringify({
      type: "DominantSpeaker",
      endpoint: "ep-123",
    });

    const result = parseDataChannelMessage(data);

    expect(result.type).toBe("DominantSpeaker");
    if (result.type === "DominantSpeaker") {
      expect(result.endpoint).toBe("ep-123");
    }
  });

  it("parses a valid EndpointMessage with mute payload", () => {
    const data = JSON.stringify({
      type: "EndpointMessage",
      payload: { muteParticipant: "mute" },
      to: "ep-1",
      from: "ep-2",
    });

    const result = parseDataChannelMessage(data);

    expect(result.type).toBe("EndpointMessage");
    if (result.type === "EndpointMessage") {
      expect(result.payload.muteParticipant).toBe("mute");
      expect(result.to).toBe("ep-1");
      expect(result.from).toBe("ep-2");
    }
  });

  it("parses an EndpointMessage with unmute payload", () => {
    const data = JSON.stringify({
      type: "EndpointMessage",
      payload: { muteParticipant: "unmute" },
      to: "ep-1",
      from: "ep-2",
    });

    const result = parseDataChannelMessage(data);

    expect(result.type).toBe("EndpointMessage");
    if (result.type === "EndpointMessage") {
      expect(result.payload.muteParticipant).toBe("unmute");
    }
  });

  it("returns unknown for invalid JSON", () => {
    const result = parseDataChannelMessage("not json at all");

    expect(result.type).toBe("unknown");
  });

  it("returns unknown for an unrecognised message type", () => {
    const data = JSON.stringify({
      type: "SomethingElse",
      value: 42,
    });

    const result = parseDataChannelMessage(data);

    expect(result.type).toBe("unknown");
  });

  it("returns unknown when DominantSpeaker is missing endpoint", () => {
    const data = JSON.stringify({
      type: "DominantSpeaker",
    });

    const result = parseDataChannelMessage(data);

    expect(result.type).toBe("unknown");
  });

  it("returns unknown when EndpointMessage is missing payload fields", () => {
    const data = JSON.stringify({
      type: "EndpointMessage",
      to: "ep-1",
      from: "ep-2",
      // payload missing
    });

    const result = parseDataChannelMessage(data);

    expect(result.type).toBe("unknown");
  });
});

describe("isRemoteMute", () => {
  it("returns true when muteParticipant is mute and to !== from", () => {
    const msg: EndpointMessage = {
      type: "EndpointMessage",
      payload: { muteParticipant: "mute" },
      to: "ep-1",
      from: "ep-2",
    };

    expect(isRemoteMute(msg)).toBe(true);
  });

  it("returns false when muteParticipant is unmute", () => {
    const msg: EndpointMessage = {
      type: "EndpointMessage",
      payload: { muteParticipant: "unmute" },
      to: "ep-1",
      from: "ep-2",
    };

    expect(isRemoteMute(msg)).toBe(false);
  });

  it("returns false when to === from (self-mute)", () => {
    const msg: EndpointMessage = {
      type: "EndpointMessage",
      payload: { muteParticipant: "mute" },
      to: "ep-1",
      from: "ep-1",
    };

    expect(isRemoteMute(msg)).toBe(false);
  });
});
