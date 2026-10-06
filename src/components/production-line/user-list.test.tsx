import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { UserList } from "./user-list";
import { TParticipant } from "./types";

// Covers #673 — the admin-side Kick button that force-disconnects a
// participant via the backend HTTP endpoint.

const participant: TParticipant = {
  name: "Kicky McKickface",
  sessionId: "session-1",
  endpointId: "endpoint-1",
  isActive: true,
  isWhip: false,
};

const renderList = (overrides?: {
  sessionId?: string | null;
  programOutputLine?: boolean;
  participants?: TParticipant[];
}) => {
  const callbacks = {
    setConfirmModalOpen: vi.fn(),
    setUserId: vi.fn(),
    setUserName: vi.fn(),
    setKickModalOpen: vi.fn(),
    setKickSessionId: vi.fn(),
    setKickUserName: vi.fn(),
  };

  render(
    <UserList
      participants={overrides?.participants ?? [participant]}
      sessionId={overrides?.sessionId ?? "my-own-session"}
      dominantSpeaker={null}
      audioLevelAboveThreshold={false}
      programOutputLine={overrides?.programOutputLine ?? false}
      setConfirmModalOpen={callbacks.setConfirmModalOpen}
      setUserId={callbacks.setUserId}
      setUserName={callbacks.setUserName}
      setKickModalOpen={callbacks.setKickModalOpen}
      setKickSessionId={callbacks.setKickSessionId}
      setKickUserName={callbacks.setKickUserName}
    />
  );

  return callbacks;
};

describe("UserList kick button", () => {
  it("renders a kick button for other active participants", () => {
    renderList();

    expect(
      screen.getByRole("button", { name: `Kick ${participant.name}` })
    ).toBeInTheDocument();
  });

  it("opens the kick confirm dialog with the participant session id and name", () => {
    const props = renderList();

    fireEvent.click(
      screen.getByRole("button", { name: `Kick ${participant.name}` })
    );

    expect(props.setKickSessionId).toHaveBeenCalledWith(participant.sessionId);
    expect(props.setKickUserName).toHaveBeenCalledWith(participant.name);
    expect(props.setKickModalOpen).toHaveBeenCalledWith(true);
  });

  it("does not render a kick button for yourself", () => {
    renderList({ sessionId: participant.sessionId });

    expect(
      screen.queryByRole("button", { name: `Kick ${participant.name}` })
    ).toBeNull();
  });

  it("does not render a kick button on a program output line", () => {
    renderList({ programOutputLine: true });

    expect(
      screen.queryByRole("button", { name: `Kick ${participant.name}` })
    ).toBeNull();
  });
});
