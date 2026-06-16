import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { UserSettingsForm } from "./user-settings-form";
import { TGlobalState } from "../../global-state/types";
import { useGlobalState } from "../../global-state/context-provider";
import { useFetchProductionList } from "../landing-page/use-fetch-production-list";
import { useSubmitForm } from "./use-submit-form";

// ── Module mocks ─────────────────────────────────────────────────────────────

vi.mock("../../global-state/context-provider", () => ({
  useGlobalState: vi.fn(),
}));

vi.mock("../landing-page/use-fetch-production-list", () => ({
  useFetchProductionList: vi.fn(),
}));

vi.mock("./use-submit-form", () => ({
  useSubmitForm: vi.fn(),
}));

vi.mock("../../hooks/use-submit-form-enter-press", () => ({
  useSubmitOnEnter: vi.fn(),
}));

vi.mock("../reload-devices-button.tsx/reload-devices-button", () => ({
  ReloadDevicesButton: () => null,
}));

vi.mock("../production-line/firefox-warning", () => ({
  FirefoxWarning: () => null,
}));

vi.mock("../../bowser", () => ({
  isBrowserFirefox: false,
  isBrowserSafari: false,
  isMobile: false,
  isIpad: false,
}));

// ── Typed mock references ────────────────────────────────────────────────────

const mockUseGlobalState = vi.mocked(useGlobalState);
const mockUseFetchProductionList = vi.mocked(useFetchProductionList);
const mockUseSubmitForm = vi.mocked(useSubmitForm);

// ── Helpers ──────────────────────────────────────────────────────────────────

const mockState: TGlobalState = {
  calls: {},
  error: {},
  reloadProductionList: false,
  reloadPresetList: false,
  production: null,
  selectedProductionId: null,
  devices: { input: [], output: [], videoInput: [] },
  userSettings: null,
  apiError: false,
  websocket: null,
};

const mockDispatch = vi.fn();

const productionWithLines = {
  name: "Morning Show",
  productionId: "prod-1",
  lines: [
    { id: "line-1", name: "Line One", participants: [], smbConferenceId: "" },
    { id: "line-2", name: "Line Two", participants: [], smbConferenceId: "" },
  ],
};

const productionList = {
  productions: [productionWithLines],
  offset: 0 as const,
  limit: 0 as const,
  totalItems: 0 as const,
};

const defaultValues = {
  username: "Alice",
  productionId: "",
  lineId: "",
  audioinput: "mic1",
  audiooutput: "spk1",
  lineUsedForProgramOutput: false,
  isProgramUser: false,
};

// ── Tests ────────────────────────────────────────────────────────────────────

describe("UserSettingsForm — lineId auto-selection fix", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseGlobalState.mockReturnValue([mockState, mockDispatch]);
    mockUseFetchProductionList.mockReturnValue({
      productions: productionList,
      doInitialLoad: false,
      error: null,
      setIntervalLoad: vi.fn(),
    });
    mockUseSubmitForm.mockReturnValue({ onSubmit: vi.fn() });
  });

  // ── Test 1: button disabled when no production selected ───────────────────

  it("Join button is disabled when no production is selected (lineId is empty)", async () => {
    await act(async () => {
      render(
        <UserSettingsForm
          isJoinProduction
          buttonText="Join"
          defaultValues={defaultValues}
        />
      );
    });

    const joinButton = screen.getByRole("button", { name: "Join" });
    expect(joinButton).toBeDisabled();
  });

  // ── Test 2: Join button enabled after selecting a production ──────────────

  it("Join button is enabled after selecting a production with lines", async () => {
    render(
      <UserSettingsForm
        isJoinProduction
        buttonText="Join"
        defaultValues={defaultValues}
      />
    );

    // The production select is the first combobox rendered.
    const productionSelect = screen.getAllByRole("combobox")[0];

    // Wrap in act so that all React state updates (setProduction, then the
    // useEffect that calls setValue("lineId", id, {shouldValidate:true}))
    // are fully flushed before asserting. With shouldValidate:true the form
    // isValid becomes true and the Join button is enabled.
    await act(async () => {
      fireEvent.change(productionSelect, {
        target: { value: productionWithLines.productionId },
      });
    });

    const joinButton = screen.getByRole("button", { name: "Join" });
    expect(joinButton).not.toBeDisabled();
  });

  // ── Test 3: first line auto-selected in line dropdown ────────────────────

  it("line dropdown shows the first line selected after choosing a production", async () => {
    await act(async () => {
      render(
        <UserSettingsForm
          isJoinProduction
          buttonText="Join"
          defaultValues={defaultValues}
        />
      );
    });

    const productionSelect = screen.getAllByRole("combobox")[0];

    await act(async () => {
      fireEvent.change(productionSelect, {
        target: { value: productionWithLines.productionId },
      });
    });

    // The line select is the second combobox. After the production is set,
    // the useEffect calls setValue("lineId", "line-1", { shouldValidate: true })
    // so the select's value should equal the first line's id.
    const lineSelect = screen.getAllByRole("combobox")[1] as HTMLSelectElement;
    expect(lineSelect.value).toBe("line-1");
  });
});

// ── Camera select for video-enabled lines ────────────────────────────────────

const productionWithVideoLine = {
  name: "Video Show",
  productionId: "prod-2",
  lines: [
    {
      id: "line-1",
      name: "Video Line",
      participants: [],
      smbConferenceId: "",
      videoEnabled: true,
    },
  ],
};

describe("UserSettingsForm — camera select on video-enabled lines", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseGlobalState.mockReturnValue([
      {
        ...mockState,
        devices: {
          input: [],
          output: [],
          videoInput: [
            {
              deviceId: "cam-1",
              label: "Built-in Camera",
              groupId: "group-1",
              kind: "videoinput",
              toJSON: () => ({}),
            } as MediaDeviceInfo,
          ],
        },
      },
      mockDispatch,
    ]);
    mockUseSubmitForm.mockReturnValue({ onSubmit: vi.fn() });
  });

  const selectProduction = async (productionId: string) => {
    await act(async () => {
      render(
        <UserSettingsForm
          isJoinProduction
          buttonText="Join"
          defaultValues={defaultValues}
        />
      );
    });

    await act(async () => {
      fireEvent.change(screen.getAllByRole("combobox")[0], {
        target: { value: productionId },
      });
    });
  };

  it("offers camera selection when the selected line is video enabled", async () => {
    mockUseFetchProductionList.mockReturnValue({
      productions: {
        ...productionList,
        productions: [productionWithVideoLine],
      },
      doInitialLoad: false,
      error: null,
      setIntervalLoad: vi.fn(),
    });

    await selectProduction(productionWithVideoLine.productionId);

    const cameraSelect = screen.getByRole("combobox", { name: "Camera" });
    expect(cameraSelect).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Built-in Camera" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "No camera" })
    ).toBeInTheDocument();
  });

  it("does not offer camera selection when the selected line is audio only", async () => {
    mockUseFetchProductionList.mockReturnValue({
      productions: productionList,
      doInitialLoad: false,
      error: null,
      setIntervalLoad: vi.fn(),
    });

    await selectProduction(productionWithLines.productionId);

    expect(
      screen.queryByRole("combobox", { name: "Camera" })
    ).not.toBeInTheDocument();
  });
});
