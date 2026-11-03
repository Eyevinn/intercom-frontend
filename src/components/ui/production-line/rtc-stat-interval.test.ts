import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getMaxAudioLevel,
  readAnalyserLevel,
  startRtcStatInterval,
} from "./rtc-stat-interval.ts";

describe("getMaxAudioLevel", () => {
  it("returns null when there are no stats", () => {
    expect(getMaxAudioLevel([])).toBeNull();
  });

  it("returns null when no stat has a numeric audioLevel", () => {
    expect(
      getMaxAudioLevel([{ type: "inbound-rtp" }, { audioLevel: "loud" }])
    ).toBeNull();
  });

  it("returns the highest audioLevel across stats", () => {
    expect(
      getMaxAudioLevel([
        { audioLevel: 0.01 },
        { audioLevel: 0.4 },
        { audioLevel: 0.2 },
      ])
    ).toBe(0.4);
  });

  it("ignores non-object entries", () => {
    expect(getMaxAudioLevel([null, undefined, 5, { audioLevel: 0.3 }])).toBe(
      0.3
    );
  });
});

describe("readAnalyserLevel", () => {
  // Minimal AnalyserNode stub: fills the buffer with a fixed time-domain
  // waveform. This lets us verify the RMS computation without WebAudio, which
  // is unavailable in happy-dom.
  const makeAnalyser = (fill: number): AnalyserNode =>
    ({
      getByteTimeDomainData: (buffer: Uint8Array) => {
        buffer.fill(fill);
      },
    }) as unknown as AnalyserNode;

  it("returns ~0 for a silent (centered) waveform", () => {
    const buffer = new Uint8Array(new ArrayBuffer(256));
    // 128 is the zero-crossing / silence value for byte time-domain data.
    const level = readAnalyserLevel(makeAnalyser(128), buffer);
    expect(level).toBeCloseTo(0, 5);
  });

  it("returns a non-zero level for a loud waveform even though playout is muted", () => {
    const buffer = new Uint8Array(new ArrayBuffer(256));
    // A DC offset far from 128 emulates active audio energy on the stream.
    const level = readAnalyserLevel(makeAnalyser(255), buffer);
    expect(level).toBeGreaterThan(0.02);
  });
});

// ── Regression test for #413 ────────────────────────────────────────
//
// When the local speaker (audio element) is muted, Chromium's inbound-rtp
// audioLevel stat drops to ~0, so the pre-patch code never reported activity
// and the speaking indicator stayed dark. The fix taps a WebAudio analyser
// directly on the remote MediaStream, which is independent of playout muting.
//
// This test drives the full stats interval with muted-looking getStats()
// values (audioLevel below threshold) while the analyser reports loud audio.
// It FAILS before the patch (no analyser fallback, so no dispatch) and PASSES
// after (the muted-but-active branch dispatches audioLevelAboveThreshold=true).

describe("startRtcStatInterval — muted speaker visual feedback (#413)", () => {
  // A suspended AudioContext must be resumed before the analyser produces data.
  // We start suspended to also verify W1 (resume/guard) is exercised.
  let resumeCalled = false;

  // Minimal WebAudio stubs (WebAudio is unavailable in happy-dom). The analyser
  // fills the buffer with a loud waveform (DC offset far from the 128 silence
  // point) so readAnalyserLevel() computes an RMS above the 0.02 threshold.
  const makeMockAudioContext = () => {
    const context = {
      state: "suspended" as AudioContextState,
      createMediaStreamSource: vi.fn(() => ({
        connect: vi.fn(),
        disconnect: vi.fn(),
      })),
      createAnalyser: vi.fn(() => ({
        fftSize: 256,
        connect: vi.fn(),
        disconnect: vi.fn(),
        getByteTimeDomainData: (buffer: Uint8Array) => {
          buffer.fill(255);
        },
      })),
      resume: vi.fn(() => {
        resumeCalled = true;
        context.state = "running";
        return Promise.resolve();
      }),
      close: vi.fn(() => Promise.resolve()),
    };

    return context;
  };

  // Constructor stub so `new AudioContext()` yields a fresh mock context.
  function MockAudioContext(this: unknown) {
    return makeMockAudioContext();
  }

  beforeEach(() => {
    resumeCalled = false;
    vi.useFakeTimers();
    vi.stubGlobal("AudioContext", MockAudioContext);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("dispatches audioLevelAboveThreshold=true from the analyser while playout is muted", async () => {
    const dispatch = vi.fn();

    // Muted playout: both inbound-rtp and media-source report ~silence.
    const mutedStats = new Map<string, unknown>([
      ["inbound", { type: "inbound-rtp", audioLevel: 0 }],
      ["source", { type: "media-source", audioLevel: 0 }],
    ]);

    const rtcPeerConnection = {
      getStats: vi.fn().mockResolvedValue(mutedStats),
    } as unknown as RTCPeerConnection;

    const remoteStream = {
      getAudioTracks: () => [{}],
    } as unknown as MediaStream;

    const stop = startRtcStatInterval({
      rtcPeerConnection,
      callId: "call-1",
      dispatch,
      getRemoteStream: () => remoteStream,
    });

    // Advance one interval tick and flush the getStats() promise chain.
    await vi.advanceTimersByTimeAsync(100);

    expect(resumeCalled).toBe(true);
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "UPDATE_CALL",
        payload: expect.objectContaining({
          id: "call-1",
          updates: expect.objectContaining({
            audioLevelAboveThreshold: true,
          }),
        }),
      })
    );

    stop();
  });
});
