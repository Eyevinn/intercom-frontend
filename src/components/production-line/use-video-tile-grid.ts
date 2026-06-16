import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { LabelResult } from "./match-video-tile-labels.ts";
import { TParticipant } from "./types.ts";
import {
  setTilePinTransitioning,
  setTilePipStream,
  setTilePipLabel,
  updateVideoTileLabel,
  updateVideoTileContainerPinned,
} from "./video-element-factory.ts";

type UseVideoTileGridArgs = {
  videoElements: HTMLVideoElement[] | null;
  participants: TParticipant[];
  tileMatches: LabelResult[];
  pinnedContainer: HTMLElement | null;
  pinnedSessionId: string | null;
  cameraStream: MediaStream | null;
  cameraLabel: string | null;
  pendingPinPromiseRef: React.MutableRefObject<Promise<void> | null>;
  onAutoUnpin: () => void;
};

type UseVideoTileGridResult = {
  setVideoGridEl: Dispatch<SetStateAction<HTMLDivElement | null>>;
};

export const useVideoTileGrid = ({
  videoElements,
  participants,
  tileMatches,
  pinnedContainer,
  pinnedSessionId,
  cameraStream,
  cameraLabel,
  pendingPinPromiseRef,
  onAutoUnpin,
}: UseVideoTileGridArgs): UseVideoTileGridResult => {
  const [videoGridEl, setVideoGridEl] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    const mainGrid = videoGridEl;
    if (!mainGrid) return undefined;

    const elements = videoElements || [];

    const staleVideoElements = new Set<HTMLVideoElement>();
    elements.forEach((el, i) => {
      const sessionId = tileMatches[i]?.sessionId ?? null;
      if (sessionId) {
        // eslint-disable-next-line no-param-reassign
        el.dataset.lastSessionId = sessionId;
      }
      const tracked = sessionId ?? el.dataset.lastSessionId ?? null;
      if (!tracked) return;
      const liveBacking = participants.some(
        (p) => p.sessionId === tracked && p.isActive && p.hasVideo
      );
      if (liveBacking) return;
      // The egress is a single persistent ssrc-rewrite slot: its track stays
      // `live` across source swaps/leaves and only momentarily stops carrying
      // media while no publisher feeds it. Keep the tile MOUNTED as long as
      // the track is live so an `unmute` (re-pin / rejoin) can recover it in
      // place — removing it from the DOM on a mere silence caused a detach
      // race (rvfc doesn't fire while detached; Safari loses the decode
      // pipeline) that left the tile black after the source returned.
      // Showing/hiding the tile (frozen-frame suppression) is owned by the
      // per-element frame-liveness monitor in attachShowWhenReady, which keys
      // off actual presented frames rather than this list or the `mute` event.
      // Only drop the slot once the track has genuinely ended.
      const trackAlive =
        el.srcObject instanceof MediaStream &&
        el.srcObject.getVideoTracks().some((t) => t.readyState === "live");
      if (trackAlive) return;
      staleVideoElements.add(el);
    });

    const liveElements = staleVideoElements.size
      ? elements.filter((el) => !staleVideoElements.has(el))
      : elements;
    const tiles = liveElements.map((el) => el.parentElement ?? el);
    const currentTileSet = new Set<Element>(tiles);

    const pinnedParticipant = pinnedSessionId
      ? (participants.find((p) => p.sessionId === pinnedSessionId) ?? null)
      : null;
    liveElements.forEach((videoEl) => {
      const originalIdx = elements.indexOf(videoEl);
      const match = tileMatches[originalIdx];
      const name = pinnedParticipant?.name ?? match?.name ?? null;
      const isWhip = pinnedParticipant?.isWhip ?? match?.isWhip ?? false;
      updateVideoTileLabel(videoEl, name, isWhip);
    });

    // Remove stale tiles then reorder (pinned tile first).
    Array.from(mainGrid.children).forEach((child) => {
      if (!currentTileSet.has(child)) mainGrid.removeChild(child);
    });

    const ordered =
      pinnedContainer && tiles.includes(pinnedContainer as HTMLElement)
        ? [
            pinnedContainer as HTMLElement,
            ...tiles.filter((t) => t !== pinnedContainer),
          ]
        : tiles;
    ordered.forEach((tile, idx) => {
      if (mainGrid.children[idx] === tile) return;
      mainGrid.insertBefore(tile, mainGrid.children[idx] ?? null);
    });

    return undefined;
  }, [
    videoGridEl,
    videoElements,
    participants,
    pinnedContainer,
    pinnedSessionId,
    tileMatches,
  ]);

  // Auto-clear the pin when the pinned tile's underlying stream is
  // removed (publisher left the line).
  useEffect(() => {
    if (!pinnedContainer) return;
    const tiles = (videoElements || []).map((el) => el.parentElement ?? el);
    if (!tiles.includes(pinnedContainer)) {
      onAutoUnpin();
    }
  }, [videoElements, pinnedContainer, onAutoUnpin]);

  // Update the pinned-tile visual state (CSS order + container styling).
  useEffect(() => {
    (videoElements || []).forEach((el) => {
      const tile = el.parentElement as HTMLElement;
      if (!tile) return;
      const isPinned = tile === pinnedContainer;
      tile.style.order = isPinned ? "-1" : "0";
      updateVideoTileContainerPinned(tile, isPinned);
    });
  }, [videoElements, pinnedContainer]);

  useEffect(() => {
    (videoElements || []).forEach((el) => {
      const tile = el.parentElement as HTMLElement | null;
      if (!tile) return;
      setTilePipStream(tile, cameraStream);
      setTilePipLabel(tile, cameraLabel);
    });
    return () => {
      (videoElements || []).forEach((el) => {
        const tile = el.parentElement as HTMLElement | null;
        if (!tile) return;
        setTilePipStream(tile, null);
      });
    };
  }, [videoElements, cameraStream, cameraLabel]);

  const prevPinnedSessionIdRef = useRef<string | null>(null);
  useEffect(() => {
    const prev = prevPinnedSessionIdRef.current;
    prevPinnedSessionIdRef.current = pinnedSessionId;

    if (!prev || !pinnedSessionId || prev === pinnedSessionId) return undefined;

    const targets: HTMLElement[] = pinnedContainer
      ? [pinnedContainer]
      : (videoElements ?? [])
          .map((el) => el.parentElement as HTMLElement | null)
          .filter((el): el is HTMLElement => el !== null);

    if (targets.length === 0) return undefined;

    type RVFCMetadata = { presentedFrames: number };
    type RVFC = (cb: (now: number, metadata: RVFCMetadata) => void) => number;
    type CVFC = (h: number) => void;

    let aborted = false;
    const perTarget = targets.map((tile) => {
      setTilePinTransitioning(tile, true);

      const clearedRef = { value: false };
      const clear = () => {
        if (clearedRef.value) return;
        clearedRef.value = true;
        setTilePinTransitioning(tile, false);
      };

      const frameCbHandleRef: { value: number | null } = { value: null };
      const videoEl = tile.querySelector("video");
      return {
        tile,
        videoEl,
        frameCbHandleRef,
        clearedRef,
        clear,
      };
    });

    // Wait until the SFU has acknowledged the pin swap before listening for
    // the "first new frame" — otherwise the previous publisher's video keeps
    // flowing during the backend round-trip and an rvfc fire would clear the
    // spinner over a frozen old frame.
    const pinSettled = pendingPinPromiseRef.current ?? Promise.resolve();

    pinSettled.finally(() => {
      if (aborted) return;
      perTarget.forEach((entry) => {
        const { videoEl, clearedRef, clear } = entry;
        const handleRef = entry.frameCbHandleRef;
        const rvfc = videoEl
          ? (videoEl as unknown as { requestVideoFrameCallback?: RVFC })
              .requestVideoFrameCallback
          : undefined;

        if (videoEl && typeof rvfc === "function") {
          const GAP_MS = 120;
          let lastFrameAt = performance.now();
          let gapObserved = false;
          const onFrame = (now: number) => {
            if (clearedRef.value || aborted) return;
            if (now - lastFrameAt > GAP_MS) gapObserved = true;
            lastFrameAt = now;
            if (gapObserved) {
              clear();
              return;
            }
            handleRef.value = rvfc.call(videoEl, onFrame);
          };
          handleRef.value = rvfc.call(videoEl, onFrame);
        } else {
          // No rvfc support — fall back to clearing immediately after the
          // backend confirms; better than holding a spinner forever.
          clear();
        }
      });
    });

    const safetyTimer = setTimeout(() => {
      perTarget.forEach(({ clear }) => clear());
    }, 8000);

    return () => {
      aborted = true;
      clearTimeout(safetyTimer);
      perTarget.forEach((entry) => {
        const { videoEl, clear } = entry;
        const handleRef = entry.frameCbHandleRef;
        if (handleRef.value != null && videoEl) {
          const cvfc = (
            videoEl as unknown as { cancelVideoFrameCallback?: CVFC }
          ).cancelVideoFrameCallback;
          if (typeof cvfc === "function") cvfc.call(videoEl, handleRef.value);
        }
        clear();
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pinnedSessionId, pinnedContainer]);

  return { setVideoGridEl };
};
