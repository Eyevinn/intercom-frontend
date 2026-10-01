import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useCallActionHandlers } from "./use-call-action-handlers.ts";

type Handlers = Record<string, () => void>;

const setup = (
  overrides: Partial<Parameters<typeof useCallActionHandlers>[0]> = {}
) => {
  const handlers: Handlers = {};
  const setActionHandler = (action: string, handler: () => void) => {
    handlers[action] = handler;
  };

  const props = {
    value: 0.5,
    audioElements: null,
    isInputMuted: true,
    isProgramOutputLine: false as boolean | null | undefined,
    isProgramUser: false as boolean | null | undefined,
    setValue: vi.fn(),
    muteInput: vi.fn(),
    muteOutput: vi.fn(),
    startTalking: vi.fn(),
    stopTalking: vi.fn(),
    setActionHandler,
    ...overrides,
  };

  renderHook(() => useCallActionHandlers(props));

  return { handlers, props };
};

describe("useCallActionHandlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("registers all Companion action handlers", () => {
    const { handlers } = setup();

    expect(Object.keys(handlers).sort()).toEqual(
      [
        "toggle_input_mute",
        "toggle_output_mute",
        "increase_volume",
        "decrease_volume",
        "push_to_talk_start",
        "push_to_talk_stop",
      ].sort()
    );
  });

  describe("toggle_input_mute", () => {
    it("toggles input on a normal line", () => {
      const { handlers, props } = setup({ isInputMuted: true });

      handlers.toggle_input_mute();

      expect(props.muteInput).toHaveBeenCalledWith(false);
    });

    it("is ignored for a program listener (program line, not program user)", () => {
      const { handlers, props } = setup({
        isProgramOutputLine: true,
        isProgramUser: false,
      });

      handlers.toggle_input_mute();

      expect(props.muteInput).not.toHaveBeenCalled();
    });

    it("still toggles input for the program user on a program line", () => {
      const { handlers, props } = setup({
        isProgramOutputLine: true,
        isProgramUser: true,
        isInputMuted: false,
      });

      handlers.toggle_input_mute();

      expect(props.muteInput).toHaveBeenCalledWith(true);
    });
  });

  describe("toggle_output_mute", () => {
    it("toggles output on a normal line", () => {
      const { handlers, props } = setup();

      handlers.toggle_output_mute();

      expect(props.muteOutput).toHaveBeenCalledTimes(1);
    });

    it("is ignored for the program user on a program line", () => {
      const { handlers, props } = setup({
        isProgramOutputLine: true,
        isProgramUser: true,
      });

      handlers.toggle_output_mute();

      expect(props.muteOutput).not.toHaveBeenCalled();
    });
  });

  describe("push_to_talk on program lines", () => {
    it("starts and stops talking on a normal line", () => {
      const { handlers, props } = setup();

      handlers.push_to_talk_start();
      handlers.push_to_talk_stop();

      expect(props.startTalking).toHaveBeenCalledTimes(1);
      expect(props.stopTalking).toHaveBeenCalledTimes(1);
    });

    it("ignores push-to-talk on a program output line", () => {
      const { handlers, props } = setup({ isProgramOutputLine: true });

      handlers.push_to_talk_start();
      handlers.push_to_talk_stop();

      expect(props.startTalking).not.toHaveBeenCalled();
      expect(props.stopTalking).not.toHaveBeenCalled();
    });

    it("ignores push-to-talk on a program line even for the program user", () => {
      const { handlers, props } = setup({
        isProgramOutputLine: true,
        isProgramUser: true,
      });

      handlers.push_to_talk_start();
      handlers.push_to_talk_stop();

      expect(props.startTalking).not.toHaveBeenCalled();
      expect(props.stopTalking).not.toHaveBeenCalled();
    });
  });
});
