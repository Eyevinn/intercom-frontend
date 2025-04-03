import styled from "@emotion/styled";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MicMuted, MicUnmuted } from "../../assets/icons/icon";
import { isMobile } from "../../bowser";
import { useGlobalState } from "../../global-state/context-provider";
import { useCallList } from "../../hooks/use-call-list";
import { useWebSocket } from "../../hooks/use-websocket";
import { DisplayContainerHeader } from "../landing-page/display-container-header";
import { PrimaryButton, SecondaryButton } from "../landing-page/form-elements";
import { JoinProduction } from "../landing-page/join-production";
import { Modal } from "../modal/modal";
import { ModalConfirmationText } from "../modal/modal-confirmation-text";
import { PageHeader } from "../page-layout/page-header";
import { ProductionLine } from "../production-line/production-line";
import { useAudioCue } from "../production-line/use-audio-cue";
import { useGlobalHotkeys } from "../production-line/use-line-hotkeys";
import { VerifyDecision } from "../verify-decision/verify-decision";
import { ConnectToWSButton } from "./connect-to-ws-button";

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
  const [customGlobalMute, setCustomGlobalMute] = useState("p");
  const [{ calls, selectedProductionId, websocket }, dispatch] =
    useGlobalState();
  const { registerCallList } = useCallList({
    websocket,
    globalMute: isMasterInputMuted,
    numberOfCalls: Object.values(calls).length,
  });
  const [shouldReduceVolume, setShouldReduceVolume] = useState(false);
  const [isSomeoneSpeaking, setIsSomeoneSpeaking] = useState(false);

  const { productionId: paramProductionId, lineId: paramLineId } = useParams();
  const navigate = useNavigate();

  const isEmpty = Object.values(calls).length === 0;
  const isSingleCall = Object.values(calls).length === 1;

  const isProgramOutputAdded = Object.entries(calls).some(
    ([, callState]) =>
      callState.joinProductionOptions?.lineUsedForProgramOutput &&
      !callState.joinProductionOptions.isProgramUser
  );

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

  const { connect, isConnected } = useWebSocket({
    onAction: (action) => {
      Object.values(callActionHandlers.current).forEach((handlers) => {
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
          case "toggle_global_mute":
            handleToggleGlobalMute();
            break;
          default:
            console.warn("Unknown action:", action);
        }
      });
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
    if (isProgramOutputAdded) {
      setIsSomeoneSpeaking(
        Object.entries(calls).some(
          ([, callState]) =>
            !callState.joinProductionOptions?.lineUsedForProgramOutput &&
            callState.audioLevelAboveThreshold &&
            !callState.joinProductionOptions?.isProgramUser
        )
      );
    }
  }, [calls, isProgramOutputAdded]);

  const startTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (isSomeoneSpeaking) {
      if (!shouldReduceVolume) {
        startTimeoutRef.current = window.setTimeout(() => {
          setShouldReduceVolume(true);
        }, 1000);
      }
    } else if (shouldReduceVolume) {
      setShouldReduceVolume(false);
    }

    return () => {
      if (startTimeoutRef.current !== null) {
        window.clearTimeout(startTimeoutRef.current);
        startTimeoutRef.current = null;
      }
    };
  }, [isSomeoneSpeaking, shouldReduceVolume]);

  useEffect(() => {
    if (selectedProductionId) {
      setProductionId(selectedProductionId);
    }
  }, [selectedProductionId]);

  useEffect(() => {
    let newGlobalMute = customGlobalMute;

    Object.entries(calls).forEach(([, callState]) => {
      if (
        callState.hotkeys?.globalMuteHotkey &&
        callState.hotkeys.globalMuteHotkey !== newGlobalMute
      ) {
        newGlobalMute = callState.hotkeys.globalMuteHotkey;
      }
    });

    if (newGlobalMute !== customGlobalMute) {
      setCustomGlobalMute(newGlobalMute);
    }
  }, [calls, customGlobalMute]);

  useEffect(() => {
    if (isEmpty && !paramProductionId && !paramLineId) {
      navigate("/");
    }
  }, [isEmpty, paramProductionId, paramLineId, navigate]);

  useGlobalHotkeys({
    muteInput: setIsMasterInputMuted,
    isInputMuted: isMasterInputMuted,
    customKey: customGlobalMute || "p",
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
        }
      });
    }
  };

  return (
    <>
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
          <Modal onClose={() => setConfirmExitModalOpen(false)}>
            <DisplayContainerHeader>Confirm</DisplayContainerHeader>
            <ModalConfirmationText>
              Are you sure you want to leave all calls?
            </ModalConfirmationText>
            <VerifyDecision
              confirm={runExitAllCalls}
              abort={() => setConfirmExitModalOpen(false)}
            />
          </Modal>
        )}
        <HeaderButtons>
          {!isEmpty && (
            <ConnectToWSButton isConnected={isConnected} connect={connect} />
          )}
          {!isEmpty && !isSingleCall && !isMobile && (
            <MuteAllCallsBtn
              type="button"
              onClick={() => setIsMasterInputMuted(!isMasterInputMuted)}
              className={isMasterInputMuted ? "mute" : ""}
            >
              {isMasterInputMuted ? "Unmute All" : "Mute All"}
              {isMasterInputMuted ? <MicMuted /> : <MicUnmuted />}
            </MuteAllCallsBtn>
          )}
          {!isEmpty && (
            <AddCallContainer>
              <SecondaryButton
                type="button"
                onClick={() => setAddCallActive(!addCallActive)}
              >
                Add Call
              </SecondaryButton>
            </AddCallContainer>
          )}
        </HeaderButtons>
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
          {Object.entries(calls)
            .toReversed()
            .map(([callId, callState]) => {
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
                  onToggleInputMute={(handler) => {
                    callActionHandlers.current[callId].toggleInputMute =
                      handler;
                  }}
                  onToggleOutputMute={(handler) => {
                    callActionHandlers.current[callId].toggleOutputMute =
                      handler;
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
