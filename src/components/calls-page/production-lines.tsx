import { useEffect } from "react";
import { useGlobalState } from "../../global-state/context-provider";
import { CallState } from "../../global-state/types";
import { useWebsocketReconnect } from "../../hooks/use-websocket-reconnect";
import { ProductionLine } from "../production-line/production-line";

type ProductionLinesProps = {
  calls: Record<string, CallState>;
  shouldReduceVolume: boolean;
  isSingleCall: boolean;
  customGlobalMute: string;
  isMasterInputMuted: boolean;
  isWSReconnecting: boolean;
  isWSConnected: boolean;
  callActionHandlers: React.MutableRefObject<
    Record<string, Record<string, () => void>>
  >;
  isSettingGlobalMute?: boolean;
  setAddCallActive: (addCallActive: boolean) => void;
  setIsWSReconnecting: (isReconnecting: boolean) => void;
  wsConnect: (url: string) => void;
};

export const ProductionLines = ({
  calls,
  shouldReduceVolume,
  isSingleCall,
  customGlobalMute,
  isMasterInputMuted,
  isWSReconnecting,
  isWSConnected,
  callActionHandlers,
  isSettingGlobalMute,
  setAddCallActive,
  setIsWSReconnecting,
  wsConnect,
}: ProductionLinesProps) => {
  const [{ error }] = useGlobalState();
  const actionHandlerRef = callActionHandlers.current;

  useEffect(() => {
    if (error) {
      setIsWSReconnecting(false);
    }
  }, [error, setIsWSReconnecting]);

  const { deregisterCall, registerCallList } = useWebsocketReconnect({
    calls,
    isMasterInputMuted,
    isWSReconnecting,
    isWSConnected,
    setIsWSReconnecting,
    wsConnect,
  });

  const setActionHandler = (
    callId: string,
    action: string,
    handler: () => void
  ) => {
    if (!actionHandlerRef[callId]) actionHandlerRef[callId] = {};
    actionHandlerRef[callId][action] = handler;
  };

  return (
    <>
      {Object.entries(calls).map(
        ([callId, callState]) =>
          callId &&
          callState.joinProductionOptions && (
            <ProductionLine
              key={callId}
              id={callId}
              shouldReduceVolume={shouldReduceVolume}
              callState={callState}
              isSingleCall={isSingleCall}
              customGlobalMute={customGlobalMute}
              masterInputMute={isMasterInputMuted}
              setFailedToConnect={() => setAddCallActive(true)}
              isSettingGlobalMute={isSettingGlobalMute}
              registerCallState={registerCallList}
              deregisterCall={deregisterCall}
              onToggleInputMute={(handler) =>
                setActionHandler(callId, "toggleInputMute", handler)
              }
              onToggleOutputMute={(handler) =>
                setActionHandler(callId, "toggleOutputMute", handler)
              }
              onIncreaseVolume={(handler) =>
                setActionHandler(callId, "increaseVolume", handler)
              }
              onDecreaseVolume={(handler) =>
                setActionHandler(callId, "decreaseVolume", handler)
              }
              onPushToTalkStart={(handler) =>
                setActionHandler(callId, "pushToTalkStart", handler)
              }
              onPushToTalkStop={(handler) =>
                setActionHandler(callId, "pushToTalkStop", handler)
              }
            />
          )
      )}
    </>
  );
};
