import logger from "../utils/logger";

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
    if (action === "toggle_global_mute" && handleToggleGlobalMute) {
      handleToggleGlobalMute();
      return;
    }

    if (typeof index !== "number") {
      logger.red(
        `Missing or invalid index for call-specific action: ${action}`
      );
      return;
    }

    const callId = callIndexMap.current[index];
    if (!callId) {
      logger.red(`No callId found for index: ${index}`);
      return;
    }

    const handlers = callActionHandlers.current[callId];
    if (!handlers) {
      logger.red(`No handlers found for callId: ${callId}`);
      return;
    }

    const handler = handlers[action];
    if (handler) {
      handler();
    } else {
      logger.red(`Unknown action: ${action}`);
    }
  };
};
