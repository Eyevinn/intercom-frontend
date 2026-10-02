import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useWebsocketReconnect } from "./use-websocket-reconnect.ts";
import { authCircuitBreaker } from "../api/auth-circuit-breaker.ts";

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockDispatch = vi.fn();
let mockWebsocket: { readyState: number; url: string } | null = null;
let mockError: unknown = null;

vi.mock("../global-state/context-provider", () => ({
  useGlobalState: () => [
    { websocket: mockWebsocket, error: mockError },
    mockDispatch,
  ],
}));

vi.mock("./use-call-list", () => ({
  useCallList: () => ({
    deregisterCall: vi.fn(),
    registerCallList: vi.fn(),
  }),
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

const { CLOSED } = WebSocket;

type Overrides = Partial<Parameters<typeof useWebsocketReconnect>[0]>;

const makeProps = (overrides: Overrides = {}) => ({
  calls: {},
  isMasterInputMuted: false,
  everConnected: true,
  isWSReconnecting: false,
  isWSConnected: false,
  isConnectionConflict: false,
  setIsWSReconnecting: vi.fn(),
  wsConnect: vi.fn(),
  ...overrides,
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("useWebsocketReconnect — auth circuit breaker integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    authCircuitBreaker.resetForTests();
    mockWebsocket = { readyState: CLOSED, url: "ws://localhost/ws" };
    mockError = null;
  });

  afterEach(() => {
    authCircuitBreaker.resetForTests();
    vi.useRealTimers();
  });

  it("reconnects while the breaker is healthy", async () => {
    const props = makeProps();
    renderHook(() => useWebsocketReconnect(props));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    expect(props.wsConnect).toHaveBeenCalledWith("ws://localhost/ws");
  });

  it("does NOT reconnect while the breaker is coordinating a reauth", async () => {
    authCircuitBreaker.configure({
      reauthRunner: () => new Promise<void>(() => {}),
      onError: vi.fn(),
    });
    await act(async () => {
      authCircuitBreaker.report401();
    });
    expect(authCircuitBreaker.isPaused()).toBe(true);

    const props = makeProps();
    renderHook(() => useWebsocketReconnect(props));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });

    expect(props.wsConnect).not.toHaveBeenCalled();
  });

  it("resumes reconnecting once the breaker recovers", async () => {
    let resolveReauth!: () => void;
    authCircuitBreaker.configure({
      reauthRunner: () =>
        new Promise<void>((resolve) => {
          resolveReauth = resolve;
        }),
      onError: vi.fn(),
    });
    await act(async () => {
      authCircuitBreaker.report401();
    });

    const props = makeProps();
    renderHook(() => useWebsocketReconnect(props));

    // Paused — nothing reconnects yet.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });
    expect(props.wsConnect).not.toHaveBeenCalled();

    // Reauth succeeds → breaker closes → the breakerTick re-runs the effect.
    await act(async () => {
      resolveReauth();
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(authCircuitBreaker.isActive()).toBe(true);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    expect(props.wsConnect).toHaveBeenCalledWith("ws://localhost/ws");
  });
});
