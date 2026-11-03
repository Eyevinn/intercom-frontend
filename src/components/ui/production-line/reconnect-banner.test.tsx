import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ReconnectBanner } from "./reconnect-banner.tsx";

describe("ReconnectBanner", () => {
  it("renders nothing when healthy", () => {
    const { container } = render(
      <ReconnectBanner phase="ok" onRejoin={vi.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("shows a reconnecting status without a rejoin button", () => {
    render(<ReconnectBanner phase="reconnecting" onRejoin={vi.fn()} />);
    expect(screen.getByRole("status").textContent).toMatch(/Reconnecting/);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("shows an error with a manual rejoin button when failed", () => {
    const onRejoin = vi.fn();
    render(<ReconnectBanner phase="failed" onRejoin={onRejoin} />);
    expect(screen.getByRole("alert")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Rejoin" }));
    expect(onRejoin).toHaveBeenCalledTimes(1);
  });
});
