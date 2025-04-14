import styled from "@emotion/styled";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useGlobalState } from "../../global-state/context-provider";
import { useCallList } from "../../hooks/use-call-list";
import { useWebSocket } from "../../hooks/use-websocket";
import logger from "../../utils/logger";
import { JoinProduction } from "../landing-page/join-production";
import { UserSettingsButton } from "../landing-page/user-settings-button";
import { Modal } from "../modal/modal";
import { PageHeader } from "../page-layout/page-header";
import { useAudioCue } from "../production-line/use-audio-cue";
import { useGlobalHotkeys } from "../production-line/use-line-hotkeys";
import { UserSettings } from "../user-settings/user-settings";
import { ConfirmationModal } from "../verify-decision/confirmation-modal";
import { HeaderActions } from "./header-actions";
import { ProductionLines } from "./production-lines";
import { useCallsNavigation } from "./use-calls-navigation";
import { useGlobalMuteHotkey } from "./use-global-mute-hotkey";
import { usePreventPullToRefresh } from "./use-prevent-pull-to-refresh";
import { useSpeakerDetection } from "./use-speaker-detection";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
`;

const CallsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 2rem;
  padding: 0 2rem 2rem 2rem;

  form {
    margin: 0;
  }
`;

export const CallsPage = () => {
  const [productionId, setProductionId] = useState<string | null>(null);
  const [addCallActive, setAddCallActive] = useState<boolean>(false);
  const [confirmExitModalOpen, setConfirmExitModalOpen] =
    useState<boolean>(false);
  const [isMasterInputMuted, setIsMasterInputMuted] = useState<boolean>(true);
  const [{ calls, selectedProductionId, websocket }, dispatch] =
    useGlobalState();
  const { deregisterCall, sendCallsStateUpdate, resetLastSentCallsState } =
    useCallList({
      websocket,
      globalMute: isMasterInputMuted,
      numberOfCalls: Object.values(calls).length,
    });
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [isReconnecting, setIsReconnecting] = useState<boolean>(false);
  const [isSettingGlobalMute, setIsSettingGlobalMute] =
    useState<boolean>(false);

  const { productionId: paramProductionId, lineId: paramLineId } = useParams();
  const navigate = useCallsNavigation({
    isEmpty: Object.values(calls).length === 0,
    paramProductionId,
    paramLineId,
  });

  const isEmpty = Object.values(calls).length === 0;
  const isSingleCall = Object.values(calls).length === 1;
  const isFirstConnection = isEmpty && paramProductionId && paramLineId;

  const isProgramOutputAdded = Object.entries(calls).some(
    ([, callState]) =>
      callState.joinProductionOptions?.lineUsedForProgramOutput &&
      !callState.joinProductionOptions.isProgramUser
  );

  const { shouldReduceVolume } = useSpeakerDetection({
    isProgramOutputAdded,
    calls,
  });

  const customGlobalMute = useGlobalMuteHotkey({
    calls,
    initialHotkey: "p",
  });

  const callActionHandlers = useRef<Record<string, Record<string, () => void>>>(
    {}
  );
  const callIndexMap = useRef<Record<number, string>>({});

  useEffect(() => {
    callIndexMap.current = {};
    Object.keys(calls).forEach((callId, i) => {
      callIndexMap.current[i + 1] = callId;
    });
  }, [calls]);

  const muteToggleTimeoutRef = useRef<number | null>(null);

  const handleToggleGlobalMute = () => {
    if (muteToggleTimeoutRef.current !== null) return;

    setIsMasterInputMuted((prev) => {
      const newMuteState = !prev;

      setTimeout(() => {
        sendCallsStateUpdate();
      }, 0);

      return newMuteState;
    });

    setIsSettingGlobalMute(true);

    muteToggleTimeoutRef.current = window.setTimeout(() => {
      muteToggleTimeoutRef.current = null;
    }, 300);

    window.setTimeout(() => {
      setIsSettingGlobalMute(false);
    }, 1000);
  };

  const { connect, disconnect, isConnected } = useWebSocket({
    onAction: (action, index) => {
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
        logger.yellow(`No handlers found for callId: ${callId}`);
        return;
      }

      switch (action) {
        case "toggle_input_mute":
          handlers.toggleInputMute?.();
          break;
        case "toggle_output_mute":
          handlers.toggleOutputMute?.();
          break;
        case "increase_volume":
          handlers.increaseVolume?.();
          break;
        case "decrease_volume":
          handlers.decreaseVolume?.();
          break;
        case "push_to_talk_start":
          handlers.pushToTalkStart?.();
          break;
        case "push_to_talk_stop":
          handlers.pushToTalkStop?.();
          break;
        default:
          logger.yellow(`Unknown action: ${action}`);
          break;
      }
    },
    dispatch,
    onConnected: () => {
      sendCallsStateUpdate();
    },
    resetLastSentCallsState: () => {
      resetLastSentCallsState();
    },
  });

  usePreventPullToRefresh();

  useEffect(() => {
    if (selectedProductionId) {
      setProductionId(selectedProductionId);
    }
  }, [selectedProductionId]);

  useGlobalHotkeys({
    muteInput: setIsMasterInputMuted,
    isInputMuted: isMasterInputMuted,
    customKey: customGlobalMute,
  });

  const { playExitSound } = useAudioCue();

  const runExitAllCalls = async () => {
    setProductionId(null);
    playExitSound();
    navigate("/");
    if (!isEmpty) {
      Object.entries(calls).forEach(([callId]) => {
        if (callId) {
          dispatch({
            type: "REMOVE_CALL",
            payload: { id: callId },
          });
          deregisterCall(callId);
        }
      });
    }
  };

  return (
    <>
      {!isFirstConnection && (
        <UserSettingsButton onClick={() => setShowSettings(!showSettings)} />
      )}
      <PageHeader
        title={!isEmpty ? "Calls" : ""}
        hasNavigateToRoot
        onNavigateToRoot={() => {
          if (isEmpty) {
            runExitAllCalls();
          } else {
            setConfirmExitModalOpen(true);
          }
        }}
      >
        {confirmExitModalOpen && (
          <ConfirmationModal
            title="Confirm"
            description="Are you sure you want to leave all calls?"
            onCancel={() => setConfirmExitModalOpen(false)}
            onConfirm={runExitAllCalls}
          />
        )}

        {showSettings && (
          <Modal onClose={() => setShowSettings(false)}>
            <UserSettings
              buttonText="Save"
              needsConfirmation
              onSave={() => setShowSettings(false)}
            />
          </Modal>
        )}

        <HeaderActions
          isEmpty={isEmpty}
          isSingleCall={isSingleCall}
          isMasterInputMuted={isMasterInputMuted}
          setIsMasterInputMuted={setIsMasterInputMuted}
          addCallActive={addCallActive}
          setAddCallActive={setAddCallActive}
          isReconnecting={isReconnecting}
          connect={connect}
          disconnect={disconnect}
          isConnected={isConnected}
        />
      </PageHeader>
      <Container>
        {isEmpty && paramProductionId && paramLineId && (
          <JoinProduction
            preSelected={{
              preSelectedProductionId: paramProductionId,
              preSelectedLineId: paramLineId,
            }}
            customGlobalMute={customGlobalMute}
            updateUserSettings
            isFirstConnection={isFirstConnection || undefined}
          />
        )}
        <CallsContainer>
          {addCallActive && productionId && (
            <JoinProduction
              customGlobalMute={customGlobalMute}
              addAdditionalCallId={productionId}
              closeAddCallView={() => setAddCallActive(false)}
              className="calls-page"
            />
          )}
          <ProductionLines
            setAddCallActive={setAddCallActive}
            isMasterInputMuted={isMasterInputMuted}
            customGlobalMute={customGlobalMute}
            isSingleCall={isSingleCall}
            isReconnecting={isReconnecting}
            setIsReconnecting={setIsReconnecting}
            callActionHandlers={callActionHandlers}
            connect={connect}
            shouldReduceVolume={shouldReduceVolume}
            calls={calls}
            isConnected={isConnected}
            isSettingGlobalMute={isSettingGlobalMute}
          />
        </CallsContainer>
      </Container>
    </>
  );
};
