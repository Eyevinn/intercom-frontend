import { describe, it, expect } from "vitest";
import {
  getPinnableParticipants,
  hasRemoteVideoPublisher,
} from "./pinnable-participants.ts";
import { TParticipant } from "./types.ts";

const participant = (overrides: Partial<TParticipant> = {}): TParticipant => ({
  name: "user",
  sessionId: "a",
  endpointId: "ep-a",
  isActive: true,
  isWhip: false,
  isWhepReceiver: false,
  hasVideo: true,
  ...overrides,
});

describe("getPinnableParticipants", () => {
  it("keeps active remote participants with video", () => {
    const a = participant({ sessionId: "a" });
    expect(getPinnableParticipants([a], "self")).toEqual([a]);
  });

  it("excludes self, inactive, video-less and WHEP receivers", () => {
    const list = [
      participant({ sessionId: "self" }),
      participant({ sessionId: "b", isActive: false }),
      participant({ sessionId: "c", hasVideo: false }),
      participant({ sessionId: "d", isWhepReceiver: true }),
    ];
    expect(getPinnableParticipants(list, "self")).toEqual([]);
  });
});

describe("hasRemoteVideoPublisher", () => {
  it("is true while a remote participant is publishing video", () => {
    expect(
      hasRemoteVideoPublisher([participant({ sessionId: "a" })], "self")
    ).toBe(true);
  });

  it("is false once the last publisher leaves, ignoring self and receivers", () => {
    const self = participant({ sessionId: "self" });
    const receiver = participant({ sessionId: "r", isWhepReceiver: true });
    const gone = participant({ sessionId: "a", isActive: false });

    expect(hasRemoteVideoPublisher([self, receiver, gone], "self")).toBe(false);
    expect(hasRemoteVideoPublisher([], "self")).toBe(false);
  });
});
