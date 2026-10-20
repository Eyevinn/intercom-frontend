import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  afterAll,
} from "vitest";
import { renderHook, act } from "@testing-library/react";
import { API } from "../../api/api.ts";
import logger from "../../utils/logger.ts";
import { TJoinProductionOptions } from "./types.ts";
import { waitForIceGathering } from "./ice-gathering.ts";
import { createAudioElement } from "./audio-element-factory.ts";
import { createVideoElement } from "./video-element-factory.ts";

const rtcInstances: FakeRTCPeerConnection[] = [];

class FakeRTCPeerConnection extends EventTarget {
  config: RTCConfiguration | undefined;

  constructor(config?: RTCConfiguration) {
    super();
    this.config = config;
    rtcInstances.push(this);
  }

  iceGatheringState: RTCIceGatheringState = "complete";

  close = vi.fn();

  addTrack = vi.fn();

  setRemoteDescription = vi.fn().mockResolvedValue(undefined);

  createAnswer = vi
    .fn()
    .mockResolvedValue({ sdp: "v=0\r\nanswer", type: "answer" });

  setLocalDescription = vi.fn().mockResolvedValue(undefined);
}

vi.stubGlobal("RTCPeerConnection", FakeRTCPeerConnection);

const hadGetTracks = "getTracks" in MediaStream.prototype;
if (!hadGetTracks) {
  Object.defineProperty(MediaStream.prototype, "getTracks", {
    configurable: true,
    value(this: MediaStream) {
      return [...this.getAudioTracks(), ...this.getVideoTracks()];
    },
  });
}

vi.mock("../../api/api.ts", () => ({
  API: {
    offerAudioSession: vi.fn(),
    patchAudioSession: vi.fn(),
    deleteAudioSession: vi.fn(),
    heartbeat: vi.fn(),
  },
}));

vi.mock("../../utils/logger.ts", () => ({
  default: {
    red: vi.fn(),
    cyan: vi.fn(),
    log: vi.fn(),
  },
}));

vi.mock("./ice-gathering.ts", () => ({
  waitForIceGathering: vi.fn(),
}));

vi.mock("./audio-element-factory.ts", () => ({
  createAudioElement: vi.fn(),
}));

vi.mock("./video-element-factory.ts", () => ({
  createVideoElement: vi.fn(),
  stopFrameMonitor: vi.fn(),
}));

// eslint-disable-next-line import/first
import { useShadowRtcConnection } from "./use-shadow-rtc-connection.ts";

const mockOffer = API.offerAudioSession as ReturnType<typeof vi.fn>;
const mockPatch = API.patchAudioSession as ReturnType<typeof vi.fn>;
const mockDelete = API.deleteAudioSession as ReturnType<typeof vi.fn>;
const mockHeartbeat = API.heartbeat as ReturnType<typeof vi.fn>;
const mockIce = waitForIceGathering as ReturnType<typeof vi.fn>;
const mockCreateAudio = createAudioElement as ReturnType<typeof vi.fn>;
const mockCreateVideo = createVideoElement as ReturnType<typeof vi.fn>;
const mockLoggerRed = logger.red as ReturnType<typeof vi.fn>;

const makeOptions = (
  overrides: Partial<TJoinProductionOptions> = {}
): TJoinProductionOptions => ({
  productionId: "7",
  lineId: "3",
  username: "shadow-user",
  lineUsedForProgramOutput: true,
  isProgramUser: false,
  ...overrides,
});

type FakeTrack = EventTarget & {
  kind: "audio" | "video";
  id: string;
  readyState: MediaStreamTrackState;
};

const makeTrack = (kind: "audio" | "video", id: string): FakeTrack =>
  Object.assign(new EventTarget(), {
    kind,
    id,
    readyState: "live" as MediaStreamTrackState,
  });

const asTrack = (t: FakeTrack) => t as unknown as MediaStreamTrack;

const fireTrack = (
  pc: FakeRTCPeerConnection,
  track: FakeTrack,
  streams: MediaStream[]
) => {
  act(() => {
    pc.dispatchEvent(Object.assign(new Event("track"), { track, streams }));
  });
};

const deferred = <T>() => {
  let resolve!: (v: T) => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

const flush = async () => {
  await act(async () => {
    for (let i = 0; i < 10; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await Promise.resolve();
    }
  });
};

type Opts = TJoinProductionOptions | null;

const renderShadow = (initial: Opts) =>
  renderHook((opts: Opts) => useShadowRtcConnection(opts), {
    initialProps: initial,
  });

describe("useShadowRtcConnection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    rtcInstances.length = 0;

    mockOffer.mockResolvedValue({ sdp: "v=0\r\noffer", sessionId: "shadow-1" });
    mockPatch.mockResolvedValue(undefined);
    mockDelete.mockResolvedValue("ok");
    mockHeartbeat.mockResolvedValue("ok");
    mockIce.mockResolvedValue(undefined);

    mockCreateAudio.mockImplementation(
      ({ stream }: { stream: MediaStream }) => {
        const el = document.createElement("audio");
        el.srcObject = stream;
        vi.spyOn(el, "pause");
        return el;
      }
    );
    mockCreateVideo.mockImplementation(
      ({ stream }: { stream: MediaStream }) => {
        const el = document.createElement("video");
        el.srcObject = stream;
        vi.spyOn(el, "pause");
        return el;
      }
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  afterAll(() => {
    if (!hadGetTracks) {
      delete (MediaStream.prototype as Partial<MediaStream>).getTracks;
    }
  });

  describe("no options", () => {
    it("is a no-op when options are null", async () => {
      const { result } = renderShadow(null);
      await flush();

      expect(mockOffer).not.toHaveBeenCalled();
      expect(rtcInstances).toHaveLength(0);
      expect(result.current.audioElements).toEqual([]);
      expect(result.current.videoElements).toEqual([]);
    });

    it("does nothing on unmount when it never connected", async () => {
      const { unmount } = renderShadow(null);
      await flush();
      unmount();
      expect(mockDelete).not.toHaveBeenCalled();
    });
  });

  describe("invalid ids", () => {
    it.each([
      ["productionId", { productionId: "abc" }],
      ["lineId", { lineId: "not-a-number" }],
      ["empty productionId", { productionId: "" }],
    ])(
      "logs and does not request an offer when %s is NaN",
      async (_label, overrides) => {
        renderShadow(makeOptions(overrides));
        await flush();

        expect(mockOffer).not.toHaveBeenCalled();
        expect(rtcInstances).toHaveLength(0);
        expect(mockLoggerRed).toHaveBeenCalledTimes(1);
        expect(mockLoggerRed).toHaveBeenCalledWith(
          expect.stringContaining("invalid")
        );
      }
    );
  });

  describe("happy path", () => {
    it("negotiates offer → remote → answer → local → ICE → patch in order", async () => {
      renderShadow(makeOptions());
      await flush();

      expect(mockOffer).toHaveBeenCalledWith({
        productionId: 7,
        lineId: 3,
        username: "shadow-user",
      });
      expect(rtcInstances).toHaveLength(1);
      const pc = rtcInstances[0];

      expect(pc.setRemoteDescription).toHaveBeenCalledWith({
        sdp: "v=0\r\noffer",
        type: "offer",
      });
      expect(pc.setLocalDescription).toHaveBeenCalledWith({
        sdp: "v=0\r\nanswer",
        type: "answer",
      });
      expect(mockIce).toHaveBeenCalledWith(pc);
      expect(mockPatch).toHaveBeenCalledWith({
        sessionId: "shadow-1",
        sdpAnswer: "v=0\r\nanswer",
      });

      const order = [
        mockOffer.mock.invocationCallOrder[0],
        pc.setRemoteDescription.mock.invocationCallOrder[0],
        pc.createAnswer.mock.invocationCallOrder[0],
        pc.setLocalDescription.mock.invocationCallOrder[0],
        mockIce.mock.invocationCallOrder[0],
        mockPatch.mock.invocationCallOrder[0],
      ];
      expect([...order].sort((a, b) => a - b)).toEqual(order);
    });

    it("creates a receive-only peer connection (no local tracks) with STUN servers", async () => {
      renderShadow(makeOptions());
      await flush();

      const pc = rtcInstances[0];
      expect(pc.addTrack).not.toHaveBeenCalled();
      expect(pc.config?.iceServers?.length).toBeGreaterThan(0);
    });

    it("sends a heartbeat every 10s after the answer is patched", async () => {
      vi.useFakeTimers();
      renderShadow(makeOptions());
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });
      expect(mockPatch).toHaveBeenCalled();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(9999);
      });
      expect(mockHeartbeat).not.toHaveBeenCalled();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(1);
      });
      expect(mockHeartbeat).toHaveBeenCalledTimes(1);
      expect(mockHeartbeat).toHaveBeenCalledWith({ sessionId: "shadow-1" });

      await act(async () => {
        await vi.advanceTimersByTimeAsync(20000);
      });
      expect(mockHeartbeat).toHaveBeenCalledTimes(3);
    });

    it("logs heartbeat failures without stopping the interval", async () => {
      vi.useFakeTimers();
      mockHeartbeat.mockRejectedValue(new Error("boom"));
      renderShadow(makeOptions());
      await act(async () => {
        await vi.advanceTimersByTimeAsync(10000);
      });
      expect(mockLoggerRed).toHaveBeenCalledWith(
        expect.stringContaining("Shadow heartbeat error for session shadow-1")
      );

      await act(async () => {
        await vi.advanceTimersByTimeAsync(10000);
      });
      expect(mockHeartbeat).toHaveBeenCalledTimes(2);
    });
  });

  describe("failures", () => {
    it("logs when negotiation fails and does not patch or heartbeat", async () => {
      vi.useFakeTimers();
      mockIce.mockRejectedValueOnce(new Error("ice exploded"));

      renderShadow(makeOptions());
      await act(async () => {
        await vi.advanceTimersByTimeAsync(30000);
      });

      expect(mockPatch).not.toHaveBeenCalled();
      expect(mockHeartbeat).not.toHaveBeenCalled();
      expect(mockLoggerRed).toHaveBeenCalledWith(
        expect.stringContaining("Shadow RTC connection failed")
      );
    });

    it("still deletes the session on unmount after a failed negotiation", async () => {
      mockIce.mockRejectedValueOnce(new Error("ice exploded"));
      const { unmount } = renderShadow(makeOptions());
      await flush();

      unmount();

      expect(rtcInstances[0].close).toHaveBeenCalled();
      expect(mockDelete).toHaveBeenCalledWith({ sessionId: "shadow-1" });
    });

    it("logs when the offer request itself fails", async () => {
      mockOffer.mockRejectedValueOnce(new Error("503"));
      renderShadow(makeOptions());
      await flush();

      expect(rtcInstances).toHaveLength(0);
      expect(mockLoggerRed).toHaveBeenCalledWith(
        expect.stringContaining("Shadow RTC connection failed")
      );
    });
  });

  describe("teardown", () => {
    it("closes the PC, stops the heartbeat and deletes the session on unmount", async () => {
      vi.useFakeTimers();
      const { unmount } = renderShadow(makeOptions());
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });
      const pc = rtcInstances[0];

      unmount();

      expect(pc.close).toHaveBeenCalledTimes(1);
      expect(mockDelete).toHaveBeenCalledTimes(1);
      expect(mockDelete).toHaveBeenCalledWith({ sessionId: "shadow-1" });

      await act(async () => {
        await vi.advanceTimersByTimeAsync(60000);
      });
      expect(mockHeartbeat).not.toHaveBeenCalled();
    });

    it("tears down the old session and opens a new one when options change", async () => {
      mockOffer
        .mockResolvedValueOnce({ sdp: "v=0\r\noffer", sessionId: "shadow-1" })
        .mockResolvedValueOnce({ sdp: "v=0\r\noffer", sessionId: "shadow-2" });

      const { rerender } = renderShadow(makeOptions({ lineId: "3" }));
      await flush();
      const firstPc = rtcInstances[0];

      rerender(makeOptions({ lineId: "4" }));
      await flush();

      expect(firstPc.close).toHaveBeenCalledTimes(1);
      expect(mockDelete).toHaveBeenCalledWith({ sessionId: "shadow-1" });
      expect(mockOffer).toHaveBeenLastCalledWith(
        expect.objectContaining({ lineId: 4 })
      );
      expect(rtcInstances).toHaveLength(2);
      expect(rtcInstances[1].close).not.toHaveBeenCalled();
      expect(mockDelete).not.toHaveBeenCalledWith({ sessionId: "shadow-2" });
    });

    it("tears down when options switch to null", async () => {
      const { rerender } = renderShadow(makeOptions());
      await flush();

      rerender(null);

      expect(rtcInstances[0].close).toHaveBeenCalled();
      expect(mockDelete).toHaveBeenCalledWith({ sessionId: "shadow-1" });
    });

    it("deletes the session if aborted before the offer resolves", async () => {
      const offer = deferred<{ sdp: string; sessionId: string }>();
      mockOffer.mockReturnValueOnce(offer.promise);

      const { unmount } = renderShadow(makeOptions());
      await flush();
      expect(mockOffer).toHaveBeenCalledTimes(1);

      unmount();
      expect(mockDelete).not.toHaveBeenCalled();

      await act(async () => {
        offer.resolve({ sdp: "v=0\r\noffer", sessionId: "late-1" });
      });
      await flush();

      expect(mockDelete).toHaveBeenCalledTimes(1);
      expect(mockDelete).toHaveBeenCalledWith({ sessionId: "late-1" });
      expect(rtcInstances).toHaveLength(0);
      expect(mockPatch).not.toHaveBeenCalled();
    });

    it("does not patch or start a heartbeat if aborted during ICE gathering", async () => {
      vi.useFakeTimers();
      const ice = deferred<void>();
      mockIce.mockReturnValueOnce(ice.promise);

      const { unmount } = renderShadow(makeOptions());
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });
      expect(mockIce).toHaveBeenCalled();

      unmount();
      expect(mockDelete).toHaveBeenCalledWith({ sessionId: "shadow-1" });

      await act(async () => {
        ice.resolve();
        await vi.advanceTimersByTimeAsync(30000);
      });

      expect(mockPatch).not.toHaveBeenCalled();
      expect(mockHeartbeat).not.toHaveBeenCalled();
      expect(mockLoggerRed).not.toHaveBeenCalled();
    });

    it("does not start a heartbeat if aborted while the patch is in flight", async () => {
      vi.useFakeTimers();
      const patch = deferred<void>();
      mockPatch.mockReturnValueOnce(patch.promise);

      const { unmount } = renderShadow(makeOptions());
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });
      expect(mockPatch).toHaveBeenCalled();

      unmount();

      await act(async () => {
        patch.resolve();
        await vi.advanceTimersByTimeAsync(30000);
      });
      expect(mockHeartbeat).not.toHaveBeenCalled();
    });

    it("pauses and clears media elements on teardown", async () => {
      const { result, rerender } = renderShadow(makeOptions());
      await flush();
      const pc = rtcInstances[0];

      const audioTrack = makeTrack("audio", "a1");
      const videoTrack = makeTrack("video", "v1");
      fireTrack(pc, audioTrack, [new MediaStream([asTrack(audioTrack)])]);
      fireTrack(pc, videoTrack, [new MediaStream([asTrack(videoTrack)])]);

      const [audioEl] = result.current.audioElements;
      const [videoEl] = result.current.videoElements;
      expect(audioEl).toBeDefined();
      expect(videoEl).toBeDefined();

      rerender(null);

      expect(result.current.audioElements).toEqual([]);
      expect(result.current.videoElements).toEqual([]);
      expect(audioEl.pause).toHaveBeenCalled();
      expect(audioEl.srcObject).toBeNull();
      expect(videoEl.pause).toHaveBeenCalled();
      expect(videoEl.srcObject).toBeNull();
    });

    it("ignores track events that arrive after teardown", async () => {
      const { rerender } = renderShadow(makeOptions());
      await flush();
      const pc = rtcInstances[0];

      rerender(null);

      const track = makeTrack("audio", "a1");
      fireTrack(pc, track, [new MediaStream([asTrack(track)])]);
      expect(mockCreateAudio).not.toHaveBeenCalled();
    });
  });

  describe("track events", () => {
    const connect = async () => {
      const hook = renderShadow(makeOptions());
      await flush();
      return { ...hook, pc: rtcInstances[0] };
    };

    it("creates an audio element for an incoming audio track", async () => {
      const { result, pc } = await connect();
      const track = makeTrack("audio", "a1");
      const stream = new MediaStream([asTrack(track)]);

      fireTrack(pc, track, [stream]);

      expect(mockCreateAudio).toHaveBeenCalledWith(
        expect.objectContaining({ stream, lineId: "3", audiooutput: undefined })
      );
      expect(result.current.audioElements).toHaveLength(1);
      expect(result.current.audioElements[0].srcObject).toBe(stream);
    });

    it("ignores an audio track that arrives without a stream", async () => {
      const { result, pc } = await connect();
      fireTrack(pc, makeTrack("audio", "a1"), []);

      expect(mockCreateAudio).not.toHaveBeenCalled();
      expect(result.current.audioElements).toEqual([]);
    });

    it("creates a video element for an incoming video track using the stream id as endpointId", async () => {
      const { result, pc } = await connect();
      const track = makeTrack("video", "v1");
      const stream = new MediaStream([asTrack(track)]);

      fireTrack(pc, track, [stream]);

      expect(mockCreateVideo).toHaveBeenCalledWith({
        stream,
        lineId: "3",
        endpointId: stream.id,
      });
      expect(result.current.videoElements).toHaveLength(1);
    });

    it("wraps a stream-less video track in a new MediaStream (forwarder relay mode)", async () => {
      const { result, pc } = await connect();
      const track = makeTrack("video", "v1");

      fireTrack(pc, track, []);

      expect(mockCreateVideo).toHaveBeenCalledTimes(1);
      const arg = mockCreateVideo.mock.calls[0][0] as {
        stream: MediaStream;
        endpointId: string | null;
      };
      expect(arg.stream).toBeInstanceOf(MediaStream);
      expect(arg.stream.getTracks()).toContain(track);
      expect(arg.endpointId).toBeNull();
      expect(result.current.videoElements).toHaveLength(1);
    });

    it("dedupes a video track fired twice with the same stream", async () => {
      const { result, pc } = await connect();
      const track = makeTrack("video", "v1");
      const stream = new MediaStream([asTrack(track)]);

      fireTrack(pc, track, [stream]);
      fireTrack(pc, track, [stream]);

      expect(result.current.videoElements).toHaveLength(1);
    });

    it("dedupes a video track re-announced on a different stream with the same track id", async () => {
      const { result, pc } = await connect();
      const track = makeTrack("video", "v1");

      fireTrack(pc, track, [new MediaStream([asTrack(track)])]);
      fireTrack(pc, track, [new MediaStream([asTrack(track)])]);

      expect(result.current.videoElements).toHaveLength(1);
    });

    it("keeps distinct video tracks as separate tiles, newest first", async () => {
      const { result, pc } = await connect();
      const t1 = makeTrack("video", "v1");
      const t2 = makeTrack("video", "v2");
      const s1 = new MediaStream([asTrack(t1)]);
      const s2 = new MediaStream([asTrack(t2)]);

      fireTrack(pc, t1, [s1]);
      fireTrack(pc, t2, [s2]);

      expect(result.current.videoElements).toHaveLength(2);
      expect(result.current.videoElements[0].srcObject).toBe(s2);
      expect(result.current.videoElements[1].srcObject).toBe(s1);
    });

    it("removes the video tile when the remote track ends", async () => {
      const { result, pc } = await connect();
      const track = makeTrack("video", "v1");
      fireTrack(pc, track, [new MediaStream([asTrack(track)])]);
      const [el] = result.current.videoElements;

      act(() => {
        track.dispatchEvent(new Event("ended"));
      });

      expect(result.current.videoElements).toEqual([]);
      expect(el.pause).toHaveBeenCalled();
      expect(el.srcObject).toBeNull();
    });

    it("removes the video tile when its track is removed from the stream", async () => {
      const { result, pc } = await connect();
      const track = makeTrack("video", "v1");
      const stream = new MediaStream([asTrack(track)]);
      fireTrack(pc, track, [stream]);
      expect(result.current.videoElements).toHaveLength(1);

      act(() => {
        stream.dispatchEvent(
          Object.assign(new Event("removetrack"), {
            track: { id: "someone-else" },
          })
        );
      });
      expect(result.current.videoElements).toHaveLength(1);

      act(() => {
        stream.dispatchEvent(
          Object.assign(new Event("removetrack"), { track })
        );
      });
      expect(result.current.videoElements).toEqual([]);
    });
  });
});
