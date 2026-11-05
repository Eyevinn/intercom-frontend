import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { AdminPanel, AdminPanelButton } from "./admin-panel";
import { TParticipant } from "./types";

// Covers #636 — the admin panel UI — and #676: the functional per-participant
// mute/unmute toggle. The kick control remains a disabled placeholder (#638).

const other: TParticipant = {
  name: "Alice",
  sessionId: "session-other",
  endpointId: "endpoint-other",
  isActive: true,
  isWhip: false,
  hasVideo: false,
};

const me: TParticipant = {
  name: "Me",
  sessionId: "session-me",
  endpointId: "endpoint-me",
  isActive: true,
  isWhip: false,
  hasVideo: false,
};

const whip: TParticipant = {
  name: "Whip ingest",
  sessionId: "session-whip",
  endpointId: "endpoint-whip",
  isActive: true,
  isWhip: true,
  hasVideo: false,
};

const inactive: TParticipant = {
  name: "Bob",
  sessionId: "session-inactive",
  endpointId: "endpoint-inactive",
  isActive: false,
  isWhip: false,
  hasVideo: false,
};

const renderPanel = (overrides?: {
  participants?: TParticipant[];
  participantMuteState?: Record<string, boolean>;
}) => {
  const onClose = vi.fn();
  const onToggleMute = vi.fn();
  render(
    <AdminPanel
      participants={overrides?.participants ?? [me, other]}
      sessionId="session-me"
      participantMuteState={overrides?.participantMuteState}
      onToggleMute={onToggleMute}
      onClose={onClose}
    />
  );
  return { onClose, onToggleMute };
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

  it("renders a functional mute toggle and a disabled kick placeholder for other participants", () => {
    renderPanel();

    const muteButton = screen.getByRole("button", {
      name: `Mute ${other.name}`,
    });
    const kickButton = screen.getByRole("button", {
      name: `Kick ${other.name} (coming soon)`,
    });

    expect(muteButton).toBeEnabled();
    expect(muteButton).toHaveAttribute("aria-pressed", "false");
    expect(kickButton).toBeDisabled();
  });

  it("sends a mute directive for the target endpoint when an unmuted participant is clicked", () => {
    const { onToggleMute } = renderPanel();

    fireEvent.click(screen.getByRole("button", { name: `Mute ${other.name}` }));

    expect(onToggleMute).toHaveBeenCalledWith(other.endpointId, true);
  });

  it("reflects an already-muted participant and sends an unmute directive when clicked", () => {
    const { onToggleMute } = renderPanel({
      participantMuteState: { [other.endpointId]: true },
    });

    const unmuteButton = screen.getByRole("button", {
      name: `Unmute ${other.name}`,
    });
    expect(unmuteButton).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(unmuteButton);

    expect(onToggleMute).toHaveBeenCalledWith(other.endpointId, false);
  });

  it("does not render action slots for yourself", () => {
    renderPanel();

    expect(
      screen.queryByRole("button", { name: `Mute ${me.name}` })
    ).toBeNull();
  });

  it("does not render action slots for WHIP participants", () => {
    renderPanel({ participants: [me, whip] });

    expect(screen.getByText(/Whip ingest/)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: `Mute ${whip.name}` })
    ).toBeNull();
    expect(
      screen.queryByRole("button", { name: `Kick ${whip.name} (coming soon)` })
    ).toBeNull();
  });

  it("does not render action slots for inactive participants", () => {
    renderPanel({ participants: [me, inactive] });

    expect(screen.getByText(/Bob/)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: `Mute ${inactive.name}` })
    ).toBeNull();
    expect(
      screen.queryByRole("button", {
        name: `Kick ${inactive.name} (coming soon)`,
      })
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
