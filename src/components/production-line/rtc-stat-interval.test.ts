import { describe, it, expect } from "vitest";
import { getMaxAudioLevel, readAnalyserLevel } from "./rtc-stat-interval.ts";

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
