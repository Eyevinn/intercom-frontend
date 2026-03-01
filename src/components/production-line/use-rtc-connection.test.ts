import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { useRtcConnection } from "./use-rtc-connection.ts";
import { GlobalStateContext } from "../../global-state/context-provider.tsx";
import { TGlobalState } from "../../global-state/types.ts";
import { TUseAudioInputValues } from "./use-audio-input.ts";

// ── Global RTCPeerConnection stub (not available in happy-dom) ──────

class MockRTCPeerConnection extends EventTarget {
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
  production: null,
  selectedProductionId: null,
  devices: { input: null, output: null },
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
