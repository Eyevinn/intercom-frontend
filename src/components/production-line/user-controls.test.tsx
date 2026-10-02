import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { UserControls } from "./user-controls";
import { TJoinProductionOptions, TLine } from "./types";

// Simulate an iOS mobile / iPad device. The volume slider must still render in
// this case (regression test for #621 — sliders were previously hidden on
// mobile/touch devices).
vi.mock("../../bowser", () => ({
  isIOSMobile: true,
  isIpad: true,
  isMobile: true,
}));

const baseJoinOptions: TJoinProductionOptions = {
  productionId: "p1",
  lineId: "l1",
  username: "tester",
  lineUsedForProgramOutput: false,
  isProgramUser: false,
};

const renderControls = (overrides?: {
  line?: TLine | null;
  joinProductionOptions?: Partial<TJoinProductionOptions>;
}) =>
  render(
    <UserControls
      line={overrides?.line ?? null}
      joinProductionOptions={{
        ...baseJoinOptions,
        ...overrides?.joinProductionOptions,
      }}
      isOutputMuted={false}
      isInputMuted={false}
      inputAudioStream="no-device"
      value={0.75}
      muteOutput={vi.fn()}
      muteInput={vi.fn()}
      handleInputChange={vi.fn()}
    />
  );

describe("UserControls volume slider", () => {
  it("renders the volume slider on mobile/touch devices for a regular line", () => {
    renderControls();

    expect(screen.getByRole("slider")).toBeInTheDocument();
  });

  it("renders the volume slider on mobile/touch devices for PGM (non-program user)", () => {
    renderControls({
      line: {
        name: "PGM",
        id: "pgm1",
        participants: [],
        programOutputLine: true,
      },
      joinProductionOptions: { isProgramUser: false },
    });

    expect(screen.getByRole("slider")).toBeInTheDocument();
  });

  it("still hides the volume slider for a program user on the program output line", () => {
    renderControls({
      line: {
        name: "PGM",
        id: "pgm1",
        participants: [],
        programOutputLine: true,
      },
      joinProductionOptions: { isProgramUser: true },
    });

    expect(screen.queryByRole("slider")).toBeNull();
  });
});
