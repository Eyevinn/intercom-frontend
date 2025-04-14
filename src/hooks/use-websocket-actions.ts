export const useWebsocketActions = ({
  callIndexMap,
  callActionHandlers,
  handleToggleGlobalMute,
}: {
  callIndexMap: React.MutableRefObject<Record<number, string>>;
  callActionHandlers: React.MutableRefObject<
    Record<string, Record<string, () => void>>
  >;
  handleToggleGlobalMute: () => void;
}) => {
  return (action: string, index?: number) => {
    if (action === "toggle_global_mute") {
      handleToggleGlobalMute();
      return;
    }

    if (typeof index !== "number") {
      console.warn(
        "Missing or invalid index for call-specific action:",
        action
      );
      return;
    }

    const callId = callIndexMap.current[index];
    if (!callId) {
      console.warn("No callId found for index:", index);
      return;
    }

    const handlers = callActionHandlers.current[callId];
    if (!handlers) {
      console.warn(`No handlers found for callId: ${callId}`);
      return;
    }

    const handlerMap: Record<string, () => void | undefined> = {
      toggle_input_mute: handlers.toggleInputMute,
      toggle_output_mute: handlers.toggleOutputMute,
      increase_volume: handlers.increaseVolume,
      decrease_volume: handlers.decreaseVolume,
      push_to_talk_start: handlers.pushToTalkStart,
      push_to_talk_stop: handlers.pushToTalkStop,
    };

    const handler = handlerMap[action];
    if (handler) {
      handler();
    } else {
      console.warn(`Unknown action: ${action}`);
    }
  };
};
