import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { AdminPanel, AdminPanelButton } from "./admin-panel";
import { TParticipant } from "./types";

// Covers #636 — the foundational admin panel UI. The mute and kick controls
// are disabled placeholder slots; their behaviour lands in sibling issues.

const other: TParticipant = {
  name: "Alice",
  sessionId: "session-other",
  endpointId: "endpoint-other",
  isActive: true,
  isWhip: false,
};

const me: TParticipant = {
  name: "Me",
  sessionId: "session-me",
  endpointId: "endpoint-me",
  isActive: true,
  isWhip: false,
};

const renderPanel = (overrides?: { participants?: TParticipant[] }) => {
  const onClose = vi.fn();
  render(
    <AdminPanel
      participants={overrides?.participants ?? [me, other]}
      sessionId="session-me"
      onClose={onClose}
    />
  );
  return { onClose };
};

describe("AdminPanel", () => {
  it("renders the admin panel dialog", () => {
    renderPanel();

    expect(
      screen.getByRole("dialog", { name: "Admin panel" })
    ).toBeInTheDocument();
  });

  it("lists the current participants", () => {
    renderPanel();

    expect(screen.getByText(/Alice/)).toBeInTheDocument();
    expect(screen.getByText(/Me/)).toBeInTheDocument();
  });

  it("renders disabled placeholder mute and kick slots for other participants", () => {
    renderPanel();

    const muteButton = screen.getByRole("button", {
      name: `Mute ${other.name} (coming soon)`,
    });
    const kickButton = screen.getByRole("button", {
      name: `Kick ${other.name} (coming soon)`,
    });

    expect(muteButton).toBeDisabled();
    expect(kickButton).toBeDisabled();
  });

  it("does not render placeholder slots for yourself", () => {
    renderPanel();

    expect(
      screen.queryByRole("button", { name: `Mute ${me.name} (coming soon)` })
    ).toBeNull();
  });

  it("shows an empty state when there are no participants", () => {
    renderPanel({ participants: [] });

    expect(screen.getByText(/No participants/)).toBeInTheDocument();
  });

  it("calls onClose when the close button is clicked", () => {
    const { onClose } = renderPanel();

    fireEvent.click(screen.getByRole("button", { name: "Close" }));

    expect(onClose).toHaveBeenCalled();
  });
});

describe("AdminPanelButton", () => {
  it("calls onClick when pressed", () => {
    const onClick = vi.fn();
    render(<AdminPanelButton onClick={onClick} />);

    fireEvent.click(screen.getByRole("button", { name: "Open admin panel" }));

    expect(onClick).toHaveBeenCalled();
  });
});
