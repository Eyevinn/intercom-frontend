import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { KebabMenu } from "./kebab-menu";

const mockUseIsGuest = vi.fn();
vi.mock("../../hooks/use-is-guest", () => ({
  useIsGuest: () => mockUseIsGuest(),
}));

vi.mock("../../hooks/use-share-url", () => ({
  useShareUrl: () => ({ shareUrl: vi.fn(), url: "" }),
}));

afterEach(() => {
  mockUseIsGuest.mockReset();
});

const renderMenu = (props?: { showHotkeys?: boolean }) =>
  render(
    <KebabMenu
      productionId="p1"
      lineId="l1"
      production={null}
      line={null}
      showHotkeys={props?.showHotkeys}
      onOpenHotkeys={props?.showHotkeys ? vi.fn() : undefined}
    />
  );

describe("KebabMenu", () => {
  it("offers Share and WebRTC to a normal user", async () => {
    mockUseIsGuest.mockReturnValue(false);
    renderMenu();

    await userEvent.click(screen.getByRole("button", { name: "More options" }));

    expect(screen.getByRole("menuitem", { name: "Share" })).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: "WebRTC" })
    ).toBeInTheDocument();
  });

  it("renders nothing for a guest when hotkeys are unavailable", () => {
    mockUseIsGuest.mockReturnValue(true);
    const { container } = renderMenu();

    expect(container).toBeEmptyDOMElement();
  });

  it("keeps Hotkeys but drops Share and WebRTC for a guest", async () => {
    mockUseIsGuest.mockReturnValue(true);
    renderMenu({ showHotkeys: true });

    await userEvent.click(screen.getByRole("button", { name: "More options" }));

    expect(
      screen.getByRole("menuitem", { name: "Hotkeys" })
    ).toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: "Share" })).toBeNull();
    expect(screen.queryByRole("menuitem", { name: "WebRTC" })).toBeNull();
  });
});
