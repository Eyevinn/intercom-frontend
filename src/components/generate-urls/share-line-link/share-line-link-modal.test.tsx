import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ShareLineLinkModal } from "./share-line-link-modal";

const renderModal = (onRefresh = vi.fn()) => {
  render(
    <ShareLineLinkModal
      urls={["https://example.test/shared"]}
      onRefresh={onRefresh}
      onClose={vi.fn()}
    />
  );
  return onRefresh;
};

describe("ShareLineLinkModal", () => {
  it("restricts recipients by default", () => {
    renderModal();

    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("asks for an unrestricted link when the box is cleared", async () => {
    const onRefresh = renderModal();

    await userEvent.click(screen.getByRole("checkbox"));

    expect(onRefresh).toHaveBeenCalledWith({ guest: false });
  });

  it("asks for a restricted link when the box is ticked again", async () => {
    const onRefresh = renderModal();

    await userEvent.click(screen.getByRole("checkbox"));
    await userEvent.click(screen.getByRole("checkbox"));

    expect(onRefresh).toHaveBeenLastCalledWith({ guest: true });
  });
});
