import styled from "@emotion/styled";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useGlobalState } from "../../global-state/context-provider";
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
  const [addCallActive, setAddCallActive] = useState(false);
  const [confirmExitModalOpen, setConfirmExitModalOpen] = useState(false);
  const [isMasterInputMuted, setIsMasterInputMuted] = useState(true);
  const [{ calls, selectedProductionId }, dispatch] = useGlobalState();
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
          <ProductionLines
            calls={calls}
            shouldReduceVolume={shouldReduceVolume}
            isSingleCall={isSingleCall}
            customGlobalMute={customGlobalMute}
            isMasterInputMuted={isMasterInputMuted}
            setAddCallActive={setAddCallActive}
          />
        </CallsContainer>
      </Container>
    </>
  );
};
