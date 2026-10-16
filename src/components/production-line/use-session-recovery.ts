import { useCallback, useEffect, useRef, useState } from "react";
import { THeartbeatStatus } from "./use-heartbeat.ts";
import { backoffDelayMs } from "../../utils/backoff.ts";

// ok           - the call is healthy.
// reconnecting - the manager is unreachable, or the session is being
//                re-established; nothing for the user to do.
// failed       - recovery did not succeed within RECOVERY_WINDOW_MS; the user
//                can trigger a manual rejoin.
export type TRecoveryPhase = "ok" | "reconnecting" | "failed";

// How long we keep trying automatically before asking the user to rejoin.
export const RECOVERY_WINDOW_MS = 60_000;

type TProps = {
  connectionState: RTCPeerConnectionState | null;
  // Called right before a new session is established so the caller can reset
  // per-connection state.
  onRejoin: () => void;
};

// Orchestrates recovery when the manager restarts or the session is lost:
//  - heartbeats failing with network/5xx errors show a reconnecting state while
//    the loop keeps retrying;
//  - a 404/410 heartbeat (session unknown), or a peer connection that fails
//    after having been connected, triggers an automatic rejoin by bumping
//    `attempt`, which callers use as a React key to remount the connection;
//  - failures to re-establish the session are retried with backoff;
//  - after RECOVERY_WINDOW_MS without recovery the phase becomes "failed" and
//    `rejoin()` offers a manual retry.
export const useSessionRecovery = ({ connectionState, onRejoin }: TProps) => {
  const [attempt, setAttempt] = useState(0);
  const [heartbeatStatus, setHeartbeatStatus] =
    useState<THeartbeatStatus>("ok");
  // Pending: a failed session request that has not been retried yet.
  const [establishFailed, setEstablishFailed] = useState(false);
  // Consecutive failures since the last successful rejoin; drives the backoff.
  const failureCount = useRef(0);
  const [rejoining, setRejoining] = useState(false);
  const [gaveUp, setGaveUp] = useState(false);
  const [deadlineEpoch, setDeadlineEpoch] = useState(0);
  const everConnected = useRef(false);
  // The new peer connection starts from a reset (non-connected) state; a stale
  // "connected" from the previous connection must not complete the rejoin.
  const sawResetSinceRejoin = useRef(false);
  const onRejoinRef = useRef(onRejoin);
  onRejoinRef.current = onRejoin;

  if (connectionState === "connected") {
    everConnected.current = true;
  }

  const connectionLost = everConnected.current && connectionState === "failed";
  const needsRejoin =
    heartbeatStatus === "lost" || connectionLost || establishFailed;
  const degraded =
    heartbeatStatus === "unreachable" || needsRejoin || rejoining;

  const reportHeartbeat = useCallback((status: THeartbeatStatus) => {
    setHeartbeatStatus(status);
  }, []);

  const reportEstablishError = useCallback(() => {
    failureCount.current += 1;
    setEstablishFailed(true);
  }, []);

  const startRejoin = useCallback(() => {
    onRejoinRef.current();
    setHeartbeatStatus("ok");
    sawResetSinceRejoin.current = false;
    setRejoining(true);
    setAttempt((a) => a + 1);
  }, []);

  // Manual rejoin from the error state: starts a fresh recovery window.
  const rejoin = useCallback(() => {
    setGaveUp(false);
    failureCount.current = 0;
    setEstablishFailed(false);
    setDeadlineEpoch((e) => e + 1);
    startRejoin();
  }, [startRejoin]);

  // Automatic rejoin (with backoff after failed attempts).
  useEffect(() => {
    if (!needsRejoin || gaveUp) return undefined;
    const timer = setTimeout(
      () => {
        // The failure that triggered this rejoin is being handled now.
        setEstablishFailed(false);
        startRejoin();
      },
      failureCount.current > 0
        ? backoffDelayMs(failureCount.current, { baseMs: 2000, maxMs: 10_000 })
        : 0
    );
    return () => clearTimeout(timer);
  }, [needsRejoin, gaveUp, startRejoin]);

  // A rejoin has completed once the new peer connection is up.
  useEffect(() => {
    if (!rejoining) return;
    if (connectionState !== "connected") {
      sawResetSinceRejoin.current = true;
    } else if (sawResetSinceRejoin.current) {
      setRejoining(false);
      failureCount.current = 0;
    }
  }, [rejoining, connectionState]);

  // Give up automatic recovery after the window has elapsed.
  useEffect(() => {
    if (!degraded) {
      setGaveUp(false);
      return undefined;
    }
    const timer = setTimeout(() => setGaveUp(true), RECOVERY_WINDOW_MS);
    return () => clearTimeout(timer);
  }, [degraded, deadlineEpoch]);

  let phase: TRecoveryPhase = "ok";
  if (degraded) phase = gaveUp ? "failed" : "reconnecting";

  return {
    phase,
    attempt,
    rejoin,
    reportHeartbeat,
    reportEstablishError,
  };
};
