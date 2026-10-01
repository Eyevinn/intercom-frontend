import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ManageProductionButtons } from "./manage-production-buttons";
import { TBasicProductionResponse } from "../../api/api";

vi.mock("../../global-state/context-provider", () => ({
  useGlobalState: () => [{}, vi.fn()],
}));

vi.mock("../../contexts/preset-context", () => ({
  usePresetContext: () => ({ presets: [], updatePreset: vi.fn() }),
}));

vi.mock("../manage-productions-page/use-add-production-line", () => ({
  useAddProductionLine: () => ({ loading: false, success: false }),
}));

vi.mock("../manage-productions-page/use-delete-production", () => ({
  useDeleteProduction: () => ({ loading: false, success: false }),
}));

vi.mock("../../hooks/use-has-duplicate-line-name.ts", () => ({
  useHasDuplicateLineName: () => false,
}));

const production: TBasicProductionResponse = {
  name: "Test Production",
  productionId: "123",
  lines: [],
};

const renderButtons = (isDeleteProductionDisabled: boolean) =>
  render(
    <ManageProductionButtons
      production={production}
      isDeleteProductionDisabled={isDeleteProductionDisabled}
    />
  );

afterEach(() => {
  vi.clearAllMocks();
});

describe("ManageProductionButtons delete feedback", () => {
  it("explains why delete is disabled when the production has participants", () => {
    renderButtons(true);

    const deleteButton = screen.getByRole("button", {
      name: /delete production/i,
    });
    expect(deleteButton).toBeDisabled();

    const info = screen.getByText(
      "This production cannot be deleted while it has active participants."
    );
    expect(info).toBeInTheDocument();
    expect(deleteButton).toHaveAttribute(
      "aria-describedby",
      info.getAttribute("id")
    );
  });

  it("shows no disabled explanation when delete is enabled", () => {
    renderButtons(false);

    const deleteButton = screen.getByRole("button", {
      name: /delete production/i,
    });
    expect(deleteButton).toBeEnabled();
    expect(
      screen.queryByText(
        "This production cannot be deleted while it has active participants."
      )
    ).not.toBeInTheDocument();
    expect(deleteButton).not.toHaveAttribute("aria-describedby");
  });
});
