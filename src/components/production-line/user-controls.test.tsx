import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { UserControls } from "./user-controls";
import { TJoinProductionOptions, TLine } from "./types";

// Mutable mock of the bowser device-detection helpers so individual tests can
// simulate different platforms. The volume slider must be hidden on iPhone and
// iPad (regression test for #727 — the slider has no effect on those devices,
// where volume is controlled by the hardware).
const mockBowser = vi.hoisted(() => ({
  isIOSMobile: false,
  isIpad: false,
  isMobile: false,
}));

vi.mock("../../bowser", () => mockBowser);

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
  beforeEach(() => {
    mockBowser.isIOSMobile = false;
    mockBowser.isIpad = false;
    mockBowser.isMobile = false;
  });

  it("renders the volume slider on a desktop device for a regular line", () => {
    renderControls();

    expect(screen.getByRole("slider")).toBeInTheDocument();
  });

  it("hides the volume slider on iPhone (iOS mobile)", () => {
    mockBowser.isIOSMobile = true;
    mockBowser.isMobile = true;

    renderControls();

    expect(screen.queryByRole("slider")).toBeNull();
  });

  it("hides the volume slider on iPad", () => {
    mockBowser.isIpad = true;

    renderControls();

    expect(screen.queryByRole("slider")).toBeNull();
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
