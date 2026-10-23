import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useVideoDeviceLabels } from "./use-video-device-labels.ts";

const device = (kind: MediaDeviceKind, deviceId: string, label = "") =>
  ({ kind, deviceId, label, groupId: "" }) as MediaDeviceInfo;

const labelled = [
  device("audioinput", "mic-1", "Mic"),
  device("audiooutput", "spk-1", "Speaker"),
  device("videoinput", "cam-1", "Camera"),
];

const setup = (enumerateResults: MediaDeviceInfo[][]) => {
  const track = { stop: vi.fn() };
  const enumerateDevices = vi.fn();
  enumerateResults.forEach((r) => enumerateDevices.mockResolvedValueOnce(r));
  enumerateDevices.mockResolvedValue(enumerateResults.at(-1));
  const listeners = new Set<() => void>();
  const mediaDevices = {
    enumerateDevices,
    getUserMedia: vi.fn().mockResolvedValue({ getTracks: () => [track] }),
    addEventListener: vi.fn((_: string, cb: () => void) => listeners.add(cb)),
    removeEventListener: vi.fn((_: string, cb: () => void) =>
      listeners.delete(cb)
    ),
  };
  vi.stubGlobal("navigator", { mediaDevices });
  const fireDeviceChange = () => listeners.forEach((cb) => cb());
  return { mediaDevices, track, listeners, fireDeviceChange };
};

describe("useVideoDeviceLabels", () => {
  const dispatch = vi.fn();

  beforeEach(() => {
    dispatch.mockClear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("does nothing when disabled", () => {
    const { mediaDevices } = setup([labelled]);

    renderHook(() => useVideoDeviceLabels({ enabled: false, dispatch }));

    expect(mediaDevices.enumerateDevices).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("dispatches devices without opening the camera when labels are readable", async () => {
    const { mediaDevices } = setup([labelled]);

    renderHook(() => useVideoDeviceLabels({ enabled: true, dispatch }));

    await waitFor(() => expect(dispatch).toHaveBeenCalledTimes(1));
    expect(mediaDevices.getUserMedia).not.toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith({
      type: "DEVICES_UPDATED",
      payload: {
        input: [labelled[0]],
        output: [labelled[1]],
        videoInput: [labelled[2]],
      },
    });
  });

  it("warms up the camera to unlock labels and stops the stream", async () => {
    const { mediaDevices, track } = setup([
      [device("videoinput", "")],
      labelled,
    ]);

    renderHook(() => useVideoDeviceLabels({ enabled: true, dispatch }));

    await waitFor(() => expect(dispatch).toHaveBeenCalledTimes(1));
    expect(mediaDevices.getUserMedia).toHaveBeenCalledWith({
      video: true,
      audio: false,
    });
    expect(track.stop).toHaveBeenCalledTimes(1);
    expect(dispatch.mock.calls[0][0].payload.videoInput).toEqual([labelled[2]]);
  });

  it("does not dispatch when the camera warm-up is rejected", async () => {
    const { mediaDevices } = setup([[device("videoinput", "")]]);
    mediaDevices.getUserMedia.mockRejectedValue(new Error("denied"));

    renderHook(() => useVideoDeviceLabels({ enabled: true, dispatch }));

    await waitFor(() =>
      expect(mediaDevices.getUserMedia).toHaveBeenCalledTimes(1)
    );
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("refreshes the list when devices change", async () => {
    const extraCamera = device("videoinput", "cam-2", "USB Camera");
    const { fireDeviceChange } = setup([labelled, [...labelled, extraCamera]]);

    renderHook(() => useVideoDeviceLabels({ enabled: true, dispatch }));
    await waitFor(() => expect(dispatch).toHaveBeenCalledTimes(1));

    fireDeviceChange();

    await waitFor(() => expect(dispatch).toHaveBeenCalledTimes(2));
    expect(dispatch.mock.calls[1][0].payload.videoInput).toEqual([
      labelled[2],
      extraCamera,
    ]);
  });

  it("removes the devicechange listener on unmount", async () => {
    const { listeners } = setup([labelled]);

    const { unmount } = renderHook(() =>
      useVideoDeviceLabels({ enabled: true, dispatch })
    );
    expect(listeners.size).toBe(1);

    unmount();

    expect(listeners.size).toBe(0);
  });

  it("warms up again on a new mount (no module-level state)", async () => {
    const first = setup([[device("videoinput", "")], labelled]);
    const { unmount } = renderHook(() =>
      useVideoDeviceLabels({ enabled: true, dispatch })
    );
    await waitFor(() => expect(dispatch).toHaveBeenCalledTimes(1));
    unmount();
    expect(first.mediaDevices.getUserMedia).toHaveBeenCalledTimes(1);

    const second = setup([[device("videoinput", "")], labelled]);
    renderHook(() => useVideoDeviceLabels({ enabled: true, dispatch }));

    await waitFor(() => expect(dispatch).toHaveBeenCalledTimes(2));
    expect(second.mediaDevices.getUserMedia).toHaveBeenCalledTimes(1);
  });
});
