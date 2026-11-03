import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { CreateProductionPage } from "./create-production-page";
import { TGlobalState } from "../../global-state/types";
import { useGlobalState } from "../../global-state/context-provider";
import { useFetchProductionList } from "../landing-page/use-fetch-production-list";
import { useFetchProduction } from "../landing-page/use-fetch-production";
import { useCreateProduction } from "./use-create-production";
import { usePresetContext } from "../../contexts/preset-context";

// ── Module mocks ─────────────────────────────────────────────────────────────

vi.mock("../../global-state/context-provider", () => ({
  useGlobalState: vi.fn(),
}));

vi.mock("../landing-page/use-fetch-production-list", () => ({
  useFetchProductionList: vi.fn(),
}));

vi.mock("../landing-page/use-fetch-production", () => ({
  useFetchProduction: vi.fn(),
}));

vi.mock("./use-create-production", () => ({
  useCreateProduction: vi.fn(),
}));

vi.mock("../../contexts/preset-context", () => ({
  usePresetContext: vi.fn(),
}));

vi.mock("../../components/layout/page-header", () => ({
  PageHeader: ({ title }: { title: string }) => <div>{title}</div>,
}));

vi.mock("../../bowser", () => ({
  isMobile: false,
}));

// ── Typed mock references ────────────────────────────────────────────────────

const mockUseGlobalState = vi.mocked(useGlobalState);
const mockUseFetchProductionList = vi.mocked(useFetchProductionList);
const mockUseFetchProduction = vi.mocked(useFetchProduction);
const mockUseCreateProduction = vi.mocked(useCreateProduction);
const mockUsePresetContext = vi.mocked(usePresetContext);

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

// ── Tests ────────────────────────────────────────────────────────────────────

describe("CreateProductionPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseGlobalState.mockReturnValue([mockState, vi.fn()]);
    mockUseFetchProductionList.mockReturnValue({
      productions: productionList,
      doInitialLoad: false,
      error: null,
      setIntervalLoad: vi.fn(),
    });
    mockUseFetchProduction.mockReturnValue({
      production: null,
      error: null,
      loading: false,
    });
    mockUseCreateProduction.mockReturnValue({
      loading: false,
      success: false,
      data: null,
    });
    mockUsePresetContext.mockReturnValue({
      presets: [],
      error: null,
      loading: false,
      deletePreset: vi.fn(),
      updatePreset: vi.fn(),
      createLocalPreset: vi.fn(),
      createPublicPreset: vi.fn(),
    });
  });

  it("renders both the Production and Saved Configuration sections", () => {
    render(<CreateProductionPage />);

    expect(
      screen.getByRole("heading", { name: /Production/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Saved Configuration/i })
    ).toBeInTheDocument();
  });

  it("keeps the preset line select disabled until a production is chosen, then enables it", async () => {
    render(<CreateProductionPage />);

    // Preset form has two selects per call card: production then line.
    const comboboxes = screen.getAllByRole("combobox");
    const productionSelect = comboboxes[0];
    const lineSelect = comboboxes[1];

    expect(lineSelect).toBeDisabled();

    await act(async () => {
      fireEvent.change(productionSelect, { target: { value: "prod-1" } });
    });

    expect(lineSelect).toBeEnabled();
    expect(
      screen.getByRole("option", { name: "Line One" })
    ).toBeInTheDocument();
  });
});
