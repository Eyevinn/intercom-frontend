import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { VideoLineJoinCard } from "./video-line-join-card";
import { TGlobalState } from "../../global-state/types";
import { useGlobalState } from "../../global-state/context-provider";
import { useInitiateProductionCall } from "../../hooks/use-initiate-production-call";

// ── Module mocks ─────────────────────────────────────────────────────────────

vi.mock("../../global-state/context-provider", () => ({
  useGlobalState: vi.fn(),
}));

vi.mock("../../hooks/use-initiate-production-call", () => ({
  useInitiateProductionCall: vi.fn(),
}));

vi.mock("../../hooks/use-video-device-labels", () => ({
  useVideoDeviceLabels: vi.fn(),
}));

// ── Typed mock references ────────────────────────────────────────────────────

const mockUseGlobalState = vi.mocked(useGlobalState);
const mockUseInitiateProductionCall = vi.mocked(useInitiateProductionCall);

// ── Helpers ──────────────────────────────────────────────────────────────────

const camera = {
  deviceId: "cam-1",
  label: "Built-in Camera",
  groupId: "group-1",
  kind: "videoinput",
  toJSON: () => ({}),
} as MediaDeviceInfo;

const baseState: TGlobalState = {
  calls: {},
  error: {},
  reloadProductionList: false,
  reloadPresetList: false,
  production: null,
  selectedProductionId: null,
  devices: { input: [], output: [], videoInput: [camera] },
  userSettings: null,
  apiError: false,
  websocket: null,
};

const mockDispatch = vi.fn();
const mockInitiate = vi.fn();

const withUsername = (username: string | null): TGlobalState => ({
  ...baseState,
  userSettings: username
    ? { username, audioinput: "mic-1", audiooutput: "spk-1" }
    : null,
});

const renderCard = () =>
  render(
    <VideoLineJoinCard
      productionId="prod-1"
      lineId="line-1"
      lineName="Video Line"
      productionName="Video Show"
      customGlobalMute="p"
      onJoined={vi.fn()}
    />
  );

// ── Tests ────────────────────────────────────────────────────────────────────

describe("VideoLineJoinCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInitiate.mockResolvedValue(true);
    mockUseInitiateProductionCall.mockReturnValue({
      initiateProductionCall: mockInitiate,
    });
    mockUseGlobalState.mockReturnValue([withUsername("Alice"), mockDispatch]);
  });

  it("offers camera selection listing the available devices", () => {
    renderCard();

    expect(
      screen.getByRole("combobox", { name: "Camera" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "No camera" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Built-in Camera" })
    ).toBeInTheDocument();
  });

  it("does not gate joining behind a username field — it uses the stored one", () => {
    renderCard();

    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Join" })).not.toBeDisabled();
  });

  it("disables Join when no username is stored", () => {
    mockUseGlobalState.mockReturnValue([withUsername(null), mockDispatch]);
    renderCard();

    expect(screen.getByRole("button", { name: "Join" })).toBeDisabled();
  });

  it("initiates the call with the chosen camera and video enabled", async () => {
    renderCard();

    fireEvent.change(screen.getByRole("combobox", { name: "Camera" }), {
      target: { value: "cam-1" },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Join" }));
    });

    expect(mockInitiate).toHaveBeenCalledTimes(1);
    expect(mockInitiate.mock.calls[0][0].payload.joinProductionOptions).toEqual(
      expect.objectContaining({
        productionId: "prod-1",
        lineId: "line-1",
        username: "Alice",
        videoinput: "cam-1",
        videoEnabled: true,
      })
    );
  });
});
