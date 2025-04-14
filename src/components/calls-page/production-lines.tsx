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
  isReconnecting: boolean;
  isConnected: boolean;
  callActionHandlers: React.MutableRefObject<
    Record<string, Record<string, () => void>>
  >;
  isSettingGlobalMute?: boolean;
  setAddCallActive: (addCallActive: boolean) => void;
  setIsReconnecting: (isReconnecting: boolean) => void;
  connect: (url: string) => void;
};

export const ProductionLines = ({
  calls,
  shouldReduceVolume,
  isSingleCall,
  customGlobalMute,
  isMasterInputMuted,
  isReconnecting,
  isConnected,
  callActionHandlers,
  isSettingGlobalMute,
  setAddCallActive,
  setIsReconnecting,
  connect,
}: ProductionLinesProps) => {
  const [{ error }] = useGlobalState();
  const actionHandlerRef = callActionHandlers.current;

  useEffect(() => {
    if (error) {
      setIsReconnecting(false);
    }
  }, [error, setIsReconnecting]);

  const { deregisterCall, registerCallList } = useWebsocketReconnect({
    calls,
    isMasterInputMuted,
    isReconnecting,
    isConnected,
    setIsReconnecting,
    connect,
  });

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
              onToggleInputMute={(handler) => {
                if (!actionHandlerRef[callId]) actionHandlerRef[callId] = {};
                actionHandlerRef[callId].toggleInputMute = handler;
              }}
              onToggleOutputMute={(handler) => {
                if (!actionHandlerRef[callId]) actionHandlerRef[callId] = {};
                actionHandlerRef[callId].toggleOutputMute = handler;
              }}
              onIncreaseVolume={(handler) => {
                if (!actionHandlerRef[callId]) actionHandlerRef[callId] = {};
                actionHandlerRef[callId].increaseVolume = handler;
              }}
              onDecreaseVolume={(handler) => {
                if (!actionHandlerRef[callId]) actionHandlerRef[callId] = {};
                actionHandlerRef[callId].decreaseVolume = handler;
              }}
              onPushToTalkStart={(handler) => {
                if (!actionHandlerRef[callId]) actionHandlerRef[callId] = {};
                actionHandlerRef[callId].pushToTalkStart = handler;
              }}
              onPushToTalkStop={(handler) => {
                if (!actionHandlerRef[callId]) actionHandlerRef[callId] = {};
                actionHandlerRef[callId].pushToTalkStop = handler;
              }}
            />
          )
      )}
    </>
  );
};
