import { describe, it, expect } from "vitest";
import {
  globalReducer,
  initialGlobalState,
} from "./global-state-reducer.ts";
import { TGlobalStateAction } from "./global-state-actions.ts";
import { CallState, TGlobalState } from "./types.ts";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockHotkeys = {
  muteHotkey: "m",
  speakerHotkey: "n",
  pushToTalkHotkey: "t",
  increaseVolumeHotkey: "+",
  decreaseVolumeHotkey: "-",
  globalMuteHotkey: "g",
};

function createMockCallState(overrides: Partial<CallState> = {}): CallState {
  return {
    joinProductionOptions: null,
    mediaStreamInput: null,
    dominantSpeaker: null,
    audioLevelAboveThreshold: false,
    connectionState: null,
    audioElements: null,
    sessionId: null,
    hotkeys: mockHotkeys,
    dataChannel: null,
    isRemotelyMuted: false,
    ...overrides,
  };
}

function stateWithCall(
  id: string,
  callOverrides: Partial<CallState> = {},
  stateOverrides: Partial<TGlobalState> = {},
): TGlobalState {
  return {
    ...initialGlobalState,
    calls: { [id]: createMockCallState(callOverrides) },
    ...stateOverrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("globalReducer", () => {
  // ── Initial state ──────────────────────────────────────────────────────

  it("should have the correct initial state shape", () => {
    expect(initialGlobalState).toEqual({
      production: null,
      error: { callErrors: null, globalError: null },
      reloadProductionList: false,
      devices: { input: null, output: null },
      userSettings: null,
      selectedProductionId: null,
      calls: {},
      apiError: false,
      websocket: null,
    });
  });

  // ── ERROR ──────────────────────────────────────────────────────────────

  describe("ERROR", () => {
    it("should set a global error when no callId is provided", () => {
      const error = new Error("Something went wrong");
      const action: TGlobalStateAction = {
        type: "ERROR",
        payload: { error },
      };

      const next = globalReducer(initialGlobalState, action);

      expect(next.error.globalError).toBe(error);
      expect(next.error.callErrors).toBeNull();
      expect(next).not.toBe(initialGlobalState);
    });

    it("should set a call-specific error when callId is provided", () => {
      const error = new Error("Call failed");
      const action: TGlobalStateAction = {
        type: "ERROR",
        payload: { callId: "call-1", error },
      };

      const next = globalReducer(initialGlobalState, action);

      expect(next.error.callErrors).toEqual({ "call-1": error });
    });

    it("should accumulate call errors for different call ids", () => {
      const err1 = new Error("err1");
      const err2 = new Error("err2");

      let state = globalReducer(initialGlobalState, {
        type: "ERROR",
        payload: { callId: "a", error: err1 },
      });
      state = globalReducer(state, {
        type: "ERROR",
        payload: { callId: "b", error: err2 },
      });

      expect(state.error.callErrors).toEqual({ a: err1, b: err2 });
    });

    it("should clear global error when null is passed without callId", () => {
      const withError = globalReducer(initialGlobalState, {
        type: "ERROR",
        payload: { error: new Error("oops") },
      });

      const cleared = globalReducer(withError, {
        type: "ERROR",
        payload: { error: null },
      });

      expect(cleared.error.globalError).toBeNull();
    });
  });

  // ── PRODUCTION_UPDATED ─────────────────────────────────────────────────

  describe("PRODUCTION_UPDATED", () => {
    it("should set reloadProductionList to true", () => {
      const action: TGlobalStateAction = { type: "PRODUCTION_UPDATED" };
      const next = globalReducer(initialGlobalState, action);

      expect(next.reloadProductionList).toBe(true);
      expect(next).not.toBe(initialGlobalState);
    });
  });

  // ── API_NOT_AVAILABLE ──────────────────────────────────────────────────

  describe("API_NOT_AVAILABLE", () => {
    it("should set apiError to an Error with the correct message", () => {
      const action: TGlobalStateAction = { type: "API_NOT_AVAILABLE" };
      const next = globalReducer(initialGlobalState, action);

      expect(next.apiError).toBeInstanceOf(Error);
      expect((next.apiError as Error).message).toBe("API not available");
    });
  });

  // ── PRODUCTION_LIST_FETCHED ────────────────────────────────────────────

  describe("PRODUCTION_LIST_FETCHED", () => {
    it("should set reloadProductionList to false", () => {
      const state: TGlobalState = {
        ...initialGlobalState,
        reloadProductionList: true,
      };
      const next = globalReducer(state, { type: "PRODUCTION_LIST_FETCHED" });

      expect(next.reloadProductionList).toBe(false);
    });
  });

  // ── DEVICES_UPDATED ────────────────────────────────────────────────────

  describe("DEVICES_UPDATED", () => {
    it("should update devices with the given payload", () => {
      const devices = {
        input: [{ deviceId: "mic-1" } as MediaDeviceInfo],
        output: [{ deviceId: "spk-1" } as MediaDeviceInfo],
      };
      const action: TGlobalStateAction = {
        type: "DEVICES_UPDATED",
        payload: devices,
      };

      const next = globalReducer(initialGlobalState, action);

      expect(next.devices).toBe(devices);
    });
  });

  // ── SELECT_PRODUCTION_ID ───────────────────────────────────────────────

  describe("SELECT_PRODUCTION_ID", () => {
    it("should set the selectedProductionId", () => {
      const action: TGlobalStateAction = {
        type: "SELECT_PRODUCTION_ID",
        payload: "prod-42",
      };

      const next = globalReducer(initialGlobalState, action);
      expect(next.selectedProductionId).toBe("prod-42");
    });

    it("should allow setting selectedProductionId to null", () => {
      const state: TGlobalState = {
        ...initialGlobalState,
        selectedProductionId: "prod-42",
      };
      const action: TGlobalStateAction = {
        type: "SELECT_PRODUCTION_ID",
        payload: null,
      };

      const next = globalReducer(state, action);
      expect(next.selectedProductionId).toBeNull();
    });
  });

  // ── ADD_CALL ───────────────────────────────────────────────────────────

  describe("ADD_CALL", () => {
    it("should add a call to the calls record", () => {
      const callState = createMockCallState({ sessionId: "sess-1" });
      const action: TGlobalStateAction = {
        type: "ADD_CALL",
        payload: { id: "call-1", callState },
      };

      const next = globalReducer(initialGlobalState, action);

      expect(next.calls["call-1"]).toBe(callState);
      expect(Object.keys(next.calls)).toHaveLength(1);
    });

    it("should preserve existing calls when adding a new one", () => {
      const first = createMockCallState({ sessionId: "s1" });
      const second = createMockCallState({ sessionId: "s2" });

      let state = globalReducer(initialGlobalState, {
        type: "ADD_CALL",
        payload: { id: "c1", callState: first },
      });
      state = globalReducer(state, {
        type: "ADD_CALL",
        payload: { id: "c2", callState: second },
      });

      expect(Object.keys(state.calls)).toHaveLength(2);
      expect(state.calls["c1"].sessionId).toBe("s1");
      expect(state.calls["c2"].sessionId).toBe("s2");
    });
  });

  // ── UPDATE_CALL ────────────────────────────────────────────────────────

  describe("UPDATE_CALL", () => {
    it("should merge updates into the existing call", () => {
      const state = stateWithCall("call-1", { dominantSpeaker: null });

      const next = globalReducer(state, {
        type: "UPDATE_CALL",
        payload: { id: "call-1", updates: { dominantSpeaker: "Alice" } },
      });

      expect(next.calls["call-1"].dominantSpeaker).toBe("Alice");
      expect(next.calls["call-1"].isRemotelyMuted).toBe(false);
    });

    it("should return the same state ref when audioLevelAboveThreshold is unchanged (perf optimization)", () => {
      const state = stateWithCall("call-1", {
        audioLevelAboveThreshold: true,
      });

      const next = globalReducer(state, {
        type: "UPDATE_CALL",
        payload: {
          id: "call-1",
          updates: { audioLevelAboveThreshold: true },
        },
      });

      expect(next).toBe(state);
    });

    it("should return a new state ref when audioLevelAboveThreshold changes", () => {
      const state = stateWithCall("call-1", {
        audioLevelAboveThreshold: false,
      });

      const next = globalReducer(state, {
        type: "UPDATE_CALL",
        payload: {
          id: "call-1",
          updates: { audioLevelAboveThreshold: true },
        },
      });

      expect(next).not.toBe(state);
      expect(next.calls["call-1"].audioLevelAboveThreshold).toBe(true);
    });

    it("should update normally when audioLevelAboveThreshold is not in the update", () => {
      const state = stateWithCall("call-1", { sessionId: "old" });

      const next = globalReducer(state, {
        type: "UPDATE_CALL",
        payload: {
          id: "call-1",
          updates: { sessionId: "new-session" },
        },
      });

      expect(next).not.toBe(state);
      expect(next.calls["call-1"].sessionId).toBe("new-session");
    });
  });

  // ── REMOVE_CALL ────────────────────────────────────────────────────────

  describe("REMOVE_CALL", () => {
    it("should remove the specified call and set production to null", () => {
      const state: TGlobalState = {
        ...initialGlobalState,
        calls: {
          "call-1": createMockCallState(),
          "call-2": createMockCallState(),
        },
        production: {
          name: "Test Prod",
          productionId: "p1",
          lines: [],
        },
      };

      const next = globalReducer(state, {
        type: "REMOVE_CALL",
        payload: { id: "call-1" },
      });

      expect(next.calls["call-1"]).toBeUndefined();
      expect(next.calls["call-2"]).toBeDefined();
      expect(next.production).toBeNull();
    });

    it("should result in empty calls when the last call is removed", () => {
      const state = stateWithCall("only-call");

      const next = globalReducer(state, {
        type: "REMOVE_CALL",
        payload: { id: "only-call" },
      });

      expect(Object.keys(next.calls)).toHaveLength(0);
    });
  });

  // ── UPDATE_USER_SETTINGS ───────────────────────────────────────────────

  describe("UPDATE_USER_SETTINGS", () => {
    it("should update userSettings with the given payload", () => {
      const settings = { username: "alice", audioinput: "mic-1" as string };
      const next = globalReducer(initialGlobalState, {
        type: "UPDATE_USER_SETTINGS",
        payload: settings,
      });

      expect(next.userSettings).toBe(settings);
    });

    it("should allow setting userSettings to null", () => {
      const state: TGlobalState = {
        ...initialGlobalState,
        userSettings: { username: "alice" },
      };

      const next = globalReducer(state, {
        type: "UPDATE_USER_SETTINGS",
        payload: null,
      });

      expect(next.userSettings).toBeNull();
    });
  });

  // ── SET_WEBSOCKET ──────────────────────────────────────────────────────

  describe("SET_WEBSOCKET", () => {
    it("should set the websocket in state", () => {
      const ws = {} as WebSocket;
      const next = globalReducer(initialGlobalState, {
        type: "SET_WEBSOCKET",
        payload: ws,
      });

      expect(next.websocket).toBe(ws);
    });

    it("should allow setting websocket to null", () => {
      const state: TGlobalState = {
        ...initialGlobalState,
        websocket: {} as WebSocket,
      };

      const next = globalReducer(state, {
        type: "SET_WEBSOCKET",
        payload: null,
      });

      expect(next.websocket).toBeNull();
    });
  });

  // ── HEARTBEAT_ERROR ───────────────────────────────────────────────────

  describe("HEARTBEAT_ERROR", () => {
    it("should store the heartbeat error as a call error keyed by sessionId", () => {
      const error = new Error("Stopped heartbeat after 3 retries.");
      const action: TGlobalStateAction = {
        type: "HEARTBEAT_ERROR",
        payload: { sessionId: "sess-1", error },
      };

      const next = globalReducer(initialGlobalState, action);

      expect(next.error.callErrors).toEqual({ "sess-1": error });
      expect(next).not.toBe(initialGlobalState);
    });

    it("should preserve existing call errors when adding a heartbeat error", () => {
      const existingError = new Error("call failed");
      const state: TGlobalState = {
        ...initialGlobalState,
        error: {
          ...initialGlobalState.error,
          callErrors: { "call-1": existingError },
        },
      };

      const heartbeatError = new Error("heartbeat timeout");
      const next = globalReducer(state, {
        type: "HEARTBEAT_ERROR",
        payload: { sessionId: "sess-2", error: heartbeatError },
      });

      expect(next.error.callErrors).toEqual({
        "call-1": existingError,
        "sess-2": heartbeatError,
      });
    });
  });

  // ── State immutability ─────────────────────────────────────────────────

  describe("state immutability", () => {
    it("should return a new state object for every handled action", () => {
      const actions: TGlobalStateAction[] = [
        { type: "ERROR", payload: { error: new Error("e") } },
        { type: "PRODUCTION_UPDATED" },
        { type: "API_NOT_AVAILABLE" },
        { type: "PRODUCTION_LIST_FETCHED" },
        {
          type: "DEVICES_UPDATED",
          payload: { input: null, output: null },
        },
        { type: "SELECT_PRODUCTION_ID", payload: "x" },
        {
          type: "ADD_CALL",
          payload: { id: "c1", callState: createMockCallState() },
        },
        { type: "UPDATE_USER_SETTINGS", payload: { username: "bob" } },
        { type: "SET_WEBSOCKET", payload: null },
        {
          type: "HEARTBEAT_ERROR",
          payload: {
            sessionId: "sess-1",
            error: new Error("heartbeat timeout"),
          },
        },
      ];

      for (const action of actions) {
        const next = globalReducer(initialGlobalState, action);
        expect(next).not.toBe(initialGlobalState);
      }
    });
  });
});
