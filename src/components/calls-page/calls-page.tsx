import styled from "@emotion/styled";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useGlobalState } from "../../global-state/context-provider";
import { useCallList } from "../../hooks/use-call-list";
import { useWebSocket } from "../../hooks/use-websocket";
import { PrimaryButton } from "../landing-page/form-elements";
import { JoinProduction } from "../landing-page/join-production";
import { UserSettingsButton } from "../landing-page/user-settings-button";
import { Modal } from "../modal/modal";
import { PageHeader } from "../page-layout/page-header";
import { useAudioCue } from "../production-line/use-audio-cue";
import { useGlobalHotkeys } from "../production-line/use-line-hotkeys";
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

const AddCallContainer = styled.div`
  display: flex;

  button {
    display: flex;
    align-items: center;
  }
`;

const MuteAllCallsBtn = styled(PrimaryButton)`
  background: rgba(50, 56, 59, 1);
  color: #6fd84f;
  border: 0.2rem solid #6d6d6d;
  &.mute {
    svg {
      fill: #f96c6c;
    }
  }

  padding: 1rem;
  margin-right: 1rem;
  display: flex;
  align-items: center;
  color: white;

  svg {
    fill: #6fd84f;
    width: 3rem;
  }
`;

const HeaderButtons = styled.div`
  display: flex;
  gap: 1rem;
`;

export const CallsPage = () => {
  const [productionId, setProductionId] = useState<string | null>(null);
  const [addCallActive, setAddCallActive] = useState(false);
  const [confirmExitModalOpen, setConfirmExitModalOpen] = useState(false);
  const [isMasterInputMuted, setIsMasterInputMuted] = useState(true);
  const [{ calls, selectedProductionId, websocket }, dispatch] =
    useGlobalState();
  const { registerCallList, deregisterCall } = useCallList({
    websocket,
    globalMute: isMasterInputMuted,
    numberOfCalls: Object.values(calls).length,
  });
  const [showSettings, setShowSettings] = useState<boolean>(false);

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
  usePreventPullToRefresh();

  let muteToggleTimeout: NodeJS.Timeout | null = null;

  const handleToggleGlobalMute = () => {
    if (muteToggleTimeout) return;
    setIsMasterInputMuted((prev) => !prev);
    muteToggleTimeout = setTimeout(() => {
      muteToggleTimeout = null;
    }, 300);
  };

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

  const { connect, isConnected } = useWebSocket({
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
        console.warn("No handlers registered for callId:", callId);
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
        case "push_to_talk":
          handlers.pushToTalk?.();
          break;
        default:
          console.warn("Unknown call-specific action:", action);
      }
    },
    dispatch,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      if (
        websocket &&
        websocket.readyState === WebSocket.CLOSED &&
        websocket.url
      ) {
        console.log("Reconnecting WebSocket to", websocket.url);
        connect(websocket.url);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [websocket, connect]);

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
        />
      </PageHeader>
      <Container>
        {isFirstConnection && (
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
          {Object.entries(calls).map(([callId, callState]) => {
            if (!callActionHandlers.current[callId]) {
              callActionHandlers.current[callId] = {};
            }

            return (
              <ProductionLine
                key={callId}
                id={callId}
                callState={callState}
                isSingleCall={isSingleCall}
                customGlobalMute={customGlobalMute}
                masterInputMute={isMasterInputMuted}
                shouldReduceVolume={shouldReduceVolume}
                registerCallState={registerCallList}
                deregisterCall={deregisterCall}
                onToggleInputMute={(handler) => {
                  callActionHandlers.current[callId].toggleInputMute = handler;
                }}
                onToggleOutputMute={(handler) => {
                  callActionHandlers.current[callId].toggleOutputMute = handler;
                }}
                onIncreaseVolume={(handler) => {
                  callActionHandlers.current[callId].increaseVolume = handler;
                }}
                onDecreaseVolume={(handler) => {
                  callActionHandlers.current[callId].decreaseVolume = handler;
                }}
                onPushToTalk={(handler) => {
                  callActionHandlers.current[callId].pushToTalk = handler;
                }}
              />
            );
          })}
        </CallsContainer>
      </Container>
    </>
  );
};
