import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { useRtcConnection } from "./use-rtc-connection.ts";
import { GlobalStateContext } from "../../global-state/context-provider.tsx";
import { TGlobalState } from "../../global-state/types.ts";
import { TUseAudioInputValues } from "./use-audio-input.ts";

// ── Global RTCPeerConnection stub (not available in happy-dom) ──────

const rtcInstances: MockRTCPeerConnection[] = [];

class MockRTCPeerConnection extends EventTarget {
  constructor() {
    super();
    rtcInstances.push(this);
  }

  connectionState: RTCPeerConnectionState = "new";

  iceGatheringState: RTCIceGatheringState = "new";

  iceConnectionState: RTCIceConnectionState = "new";

  signalingState: RTCSignalingState = "stable";

  addTrack = vi.fn();

  close = vi.fn();

  createDataChannel = vi.fn().mockReturnValue({
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });

  setRemoteDescription = vi.fn().mockResolvedValue(undefined);

  createAnswer = vi.fn().mockResolvedValue({ sdp: "v=0\r\n", type: "answer" });

  setLocalDescription = vi.fn().mockResolvedValue(undefined);

  getStats = vi.fn().mockResolvedValue(new Map());
}

vi.stubGlobal("RTCPeerConnection", MockRTCPeerConnection);

// ── Mocks ──────────────────────────────────────────────────────────

const mockNavigate = vi.fn();

vi.mock("react-router", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("../../utils/logger.ts", () => ({
  default: {
    cyan: vi.fn(),
    red: vi.fn(),
    log: vi.fn(),
  },
}));

vi.mock("../../api/api.ts", () => ({
  API: {
    patchAudioSession: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock("./rtc-stat-interval.ts", () => ({
  startRtcStatInterval: vi.fn().mockReturnValue(() => {}),
}));

// ── Helpers ────────────────────────────────────────────────────────

const mockDispatch = vi.fn();

const mockState: TGlobalState = {
  calls: {},
  error: {},
  reloadProductionList: false,
  reloadPresetList: false,
  production: null,
  selectedProductionId: null,
  devices: { input: null, output: null, videoInput: null },
  userSettings: null,
  apiError: false,
  websocket: null,
};

const wrapper = ({ children }: { children: ReactNode }) =>
  createElement(
    GlobalStateContext.Provider,
    { value: [mockState, mockDispatch] },
    children
  );

const defaultOptions = {
  inputAudioStream: null as TUseAudioInputValues,
  inputVideoStream: null as null,
  videoEnabled: false,
  sdpOffer: null,
  joinProductionOptions: null,
  audiooutput: undefined,
  sessionId: null,
  callId: "test-call-id",
};

// ── Tests ──────────────────────────────────────────────────────────

describe("useRtcConnection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null connectionState initially", () => {
    const { result } = renderHook(() => useRtcConnection(defaultOptions), {
      wrapper,
    });

    expect(result.current.connectionState).toBeNull();
  });

  it("returns empty audioElements initially", () => {
    const { result } = renderHook(() => useRtcConnection(defaultOptions), {
      wrapper,
    });

    expect(result.current.audioElements).toEqual([]);
  });

  it("does not connect when sdpOffer is null", () => {
    renderHook(() => useRtcConnection(defaultOptions), {
      wrapper,
    });

    // Should not have dispatched UPDATE_CALL (which happens during connection)
    expect(mockDispatch).not.toHaveBeenCalledWith(
      expect.objectContaining({
        type: "UPDATE_CALL",
        payload: expect.objectContaining({
          updates: expect.objectContaining({ dataChannel: expect.anything() }),
        }),
      })
    );
  });

  it("does not connect when sessionId is null", () => {
    renderHook(
      () =>
        useRtcConnection({
          ...defaultOptions,
          sdpOffer: "v=0\r\n",
        }),
      { wrapper }
    );

    expect(mockDispatch).not.toHaveBeenCalledWith(
      expect.objectContaining({
        type: "UPDATE_CALL",
        payload: expect.objectContaining({
          updates: expect.objectContaining({ dataChannel: expect.anything() }),
        }),
      })
    );
  });

  it("clears a video tile's stale lastSessionId when its slot is recycled (unmute)", () => {
    // The backend reuses a fixed pool of receive slots and never
    // renegotiates: when the pinned publisher leaves and a new one is
    // selected, SMB rewrites the new publisher onto the SAME slot/SSRC, which
    // fires `unmute`. If the tile keeps the departed publisher's
    // lastSessionId, computeVideoTileLabels can never rebind it and the grid
    // drops it as stale → permanent black screen. unmute must void the
    // binding so the matcher re-adopts the slot for the now-active source.
    rtcInstances.length = 0;
    const { result } = renderHook(
      () =>
        useRtcConnection({
          ...defaultOptions,
          inputAudioStream: "no-device",
          sdpOffer: "v=0\r\n",
          sessionId: "session-1",
          joinProductionOptions: {
            productionId: "1",
            lineId: "line-1",
            username: "user",
            lineUsedForProgramOutput: false,
            isProgramUser: false,
          },
        }),
      { wrapper }
    );

    const pc = rtcInstances[rtcInstances.length - 1];
    const stream = new MediaStream();
    const track = Object.assign(new EventTarget(), {
      kind: "video",
      id: "video-track-1",
    });

    act(() => {
      const trackEvent = Object.assign(new Event("track"), {
        streams: [stream],
        track,
      });
      pc.dispatchEvent(trackEvent);
    });

    const videoEl = result.current.videoElements[0];
    expect(videoEl).toBeDefined();

    // The grid binds the tile to the publisher currently feeding the slot.
    videoEl.dataset.lastSessionId = "departed-publisher";

    act(() => {
      track.dispatchEvent(new Event("unmute"));
    });

    expect(videoEl.dataset.lastSessionId).toBe("");
  });

  it("does not connect when inputAudioStream is null", () => {
    renderHook(
      () =>
        useRtcConnection({
          ...defaultOptions,
          sdpOffer: "v=0\r\n",
          sessionId: "session-1",
          joinProductionOptions: {
            productionId: "1",
            lineId: "line-1",
            username: "user",
            lineUsedForProgramOutput: false,
            isProgramUser: false,
          },
        }),
      { wrapper }
    );

    expect(mockDispatch).not.toHaveBeenCalledWith(
      expect.objectContaining({
        type: "UPDATE_CALL",
        payload: expect.objectContaining({
          updates: expect.objectContaining({ dataChannel: expect.anything() }),
        }),
      })
    );
  });
});
