import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { type Dispatch } from "react";
import { useInitiateProductionCall } from "./use-initiate-production-call";
import { type TGlobalStateAction } from "../global-state/global-state-actions";

// ── Module mocks ─────────────────────────────────────────────────────────────

vi.mock("./use-fetch-devices", () => ({
  useFetchDevices: vi.fn(),
}));

vi.mock("./use-device-permission", () => ({
  useDevicePermissions: vi.fn(),
}));

vi.mock("../bowser", () => ({
  isBrowserSafari: false,
  isMobile: false,
  isIpad: false,
}));

vi.mock("../utils/logger", () => ({
  default: { red: vi.fn() },
}));

// ── Typed mock references ────────────────────────────────────────────────────

import { useFetchDevices } from "./use-fetch-devices";
import { useDevicePermissions } from "./use-device-permission";
import * as bowser from "../bowser";

const mockUseFetchDevices = vi.mocked(useFetchDevices);
const mockUseDevicePermissions = vi.mocked(useDevicePermissions);

// ── Helpers ──────────────────────────────────────────────────────────────────

const FAKE_UUID = "test-uuid-1234";

function makeDevice(deviceId: string): MediaDeviceInfo {
  return { deviceId, label: deviceId, kind: "audioinput", groupId: "" } as MediaDeviceInfo;
}

function makeOutputDevice(deviceId: string): MediaDeviceInfo {
  return { deviceId, label: deviceId, kind: "audiooutput", groupId: "" } as MediaDeviceInfo;
}

const defaultJoinOptions = {
  productionId: "prod-1",
  lineId: "line-1",
  username: "Alice",
  audioinput: "mic1",
  lineUsedForProgramOutput: false,
  isProgramUser: false,
};

const defaultPayload = {
  joinProductionOptions: defaultJoinOptions,
  audiooutput: "spk1",
};

// ── Tests ────────────────────────────────────────────────────────────────────

describe("useInitiateProductionCall", () => {
  let mockDispatch: Dispatch<TGlobalStateAction>;
  let mockGetUpdatedDevices: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockDispatch = vi.fn() as unknown as Dispatch<TGlobalStateAction>;
    mockGetUpdatedDevices = vi.fn();

    vi.stubGlobal("crypto", { randomUUID: vi.fn().mockReturnValue(FAKE_UUID) });

    mockUseDevicePermissions.mockReturnValue({ permission: true, denied: false });
    mockUseFetchDevices.mockReturnValue([mockGetUpdatedDevices] as unknown as ReturnType<typeof mockUseFetchDevices>);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  // ── Race condition: empty device list ────────────────────────────────────

  describe("empty device list (early-load race condition)", () => {
    it("returns true and dispatches ADD_CALL + SELECT_PRODUCTION_ID without dispatching ERROR", async () => {
      mockGetUpdatedDevices.mockResolvedValue({ input: [], output: [] });

      const { result } = renderHook(() =>
        useInitiateProductionCall({ dispatch: mockDispatch }),
      );

      let returnValue: boolean | undefined;
      await act(async () => {
        returnValue = await result.current.initiateProductionCall({
          payload: defaultPayload,
        });
      });

      expect(returnValue).toBe(true);

      expect(mockDispatch).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: "ERROR" }),
      );

      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: "ADD_CALL" }),
      );
      expect(mockDispatch).toHaveBeenCalledWith({
        type: "SELECT_PRODUCTION_ID",
        payload: "prod-1",
      });
    });
  });

  // ── Valid devices ─────────────────────────────────────────────────────────

  describe("valid devices", () => {
    it("returns true and dispatches ADD_CALL + SELECT_PRODUCTION_ID when both devices are found", async () => {
      mockGetUpdatedDevices.mockResolvedValue({
        input: [makeDevice("mic1"), makeDevice("mic2")],
        output: [makeOutputDevice("spk1")],
      });

      const { result } = renderHook(() =>
        useInitiateProductionCall({ dispatch: mockDispatch }),
      );

      let returnValue: boolean | undefined;
      await act(async () => {
        returnValue = await result.current.initiateProductionCall({
          payload: defaultPayload,
        });
      });

      expect(returnValue).toBe(true);
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "ADD_CALL",
          payload: expect.objectContaining({ id: FAKE_UUID }),
        }),
      );
      expect(mockDispatch).toHaveBeenCalledWith({
        type: "SELECT_PRODUCTION_ID",
        payload: "prod-1",
      });
      expect(mockDispatch).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: "ERROR" }),
      );
    });
  });

  // ── Input device not found ────────────────────────────────────────────────

  describe("input device not found", () => {
    it("returns false and dispatches ERROR, does not dispatch ADD_CALL", async () => {
      mockGetUpdatedDevices.mockResolvedValue({
        input: [makeDevice("other-mic")],
        output: [makeOutputDevice("spk1")],
      });

      const { result } = renderHook(() =>
        useInitiateProductionCall({ dispatch: mockDispatch }),
      );

      let returnValue: boolean | undefined;
      await act(async () => {
        returnValue = await result.current.initiateProductionCall({
          payload: defaultPayload,
        });
      });

      expect(returnValue).toBe(false);
      expect(mockDispatch).toHaveBeenCalledWith({
        type: "ERROR",
        payload: { error: expect.any(Error) },
      });
      const dispatchMock = mockDispatch as unknown as ReturnType<typeof vi.fn>;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errorCall = dispatchMock.mock.calls.find((call: any[]) => call[0]?.type === "ERROR");
      expect(errorCall?.[0].payload.error.message).toBe(
        "Selected devices are not available",
      );
      expect(mockDispatch).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: "ADD_CALL" }),
      );
    });
  });

  // ── Output device not found (non-Safari) ─────────────────────────────────

  describe("output device not found on non-Safari browser", () => {
    it("returns false and dispatches ERROR when output device is missing", async () => {
      mockGetUpdatedDevices.mockResolvedValue({
        input: [makeDevice("mic1")],
        output: [makeOutputDevice("other-spk")],
      });

      const { result } = renderHook(() =>
        useInitiateProductionCall({ dispatch: mockDispatch }),
      );

      let returnValue: boolean | undefined;
      await act(async () => {
        returnValue = await result.current.initiateProductionCall({
          payload: defaultPayload,
        });
      });

      expect(returnValue).toBe(false);
      const dispatchMock2 = mockDispatch as unknown as ReturnType<typeof vi.fn>;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errorCall = dispatchMock2.mock.calls.find((call: any[]) => call[0]?.type === "ERROR");
      expect(errorCall?.[0].payload.error.message).toBe(
        "Selected devices are not available",
      );
      expect(mockDispatch).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: "ADD_CALL" }),
      );
    });
  });

  // ── Output device not found on Safari ─────────────────────────────────────

  describe("output device not found on Safari", () => {
    it("skips output check and returns true — Safari has no audiooutput selector", async () => {
      vi.mocked(bowser).isBrowserSafari = true;

      mockGetUpdatedDevices.mockResolvedValue({
        input: [makeDevice("mic1")],
        output: [makeOutputDevice("other-spk")],
      });

      const { result } = renderHook(() =>
        useInitiateProductionCall({ dispatch: mockDispatch }),
      );

      let returnValue: boolean | undefined;
      await act(async () => {
        returnValue = await result.current.initiateProductionCall({
          payload: defaultPayload,
        });
      });

      expect(returnValue).toBe(true);
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: "ADD_CALL" }),
      );
      expect(mockDispatch).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: "ERROR" }),
      );

      // Reset so subsequent tests are unaffected
      vi.mocked(bowser).isBrowserSafari = false;
    });
  });

  // ── getUpdatedDevices throws ──────────────────────────────────────────────

  describe("getUpdatedDevices throws", () => {
    it("returns false and dispatches ERROR with the thrown error", async () => {
      const thrownError = new Error("Enumeration failed");
      mockGetUpdatedDevices.mockRejectedValue(thrownError);

      const { result } = renderHook(() =>
        useInitiateProductionCall({ dispatch: mockDispatch }),
      );

      let returnValue: boolean | undefined;
      await act(async () => {
        returnValue = await result.current.initiateProductionCall({
          payload: defaultPayload,
        });
      });

      expect(returnValue).toBe(false);
      expect(mockDispatch).toHaveBeenCalledWith({
        type: "ERROR",
        payload: { error: thrownError },
      });
      expect(mockDispatch).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: "ADD_CALL" }),
      );
    });
  });
});
