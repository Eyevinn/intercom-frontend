import styled from "@emotion/styled";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGlobalState } from "../../global-state/context-provider";
import { JoinProduction } from "../landing-page/join-production";
import { PrimaryButton, SecondaryButton } from "../landing-page/form-elements";
import { NavigateToRootButton } from "../navigate-to-root-button/navigate-to-root-button";
import { DisplayContainerHeader } from "../landing-page/display-container-header";
import { Modal } from "../modal/modal";
import { VerifyDecision } from "../verify-decision/verify-decision";
import { ModalConfirmationText } from "../modal/modal-confirmation-text";
import { MicMuted, MicUnmuted } from "../../assets/icons/icon";
import { useGlobalHotkeys } from "../production-line/use-line-hotkeys";
import { ProductionLine } from "../production-line/production-line";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  padding: 2rem;
`;

const CallsContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;

  form {
    margin: 0;
  }
`;

const CallContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 2rem;
  max-width: 40rem;
  min-width: 30rem;
`;

const AddCallContainer = styled.div`
  display: flex;
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  height: 4rem;
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

const HeaderRightSide = styled.div`
  display: flex;
`;

export const CallsPage = () => {
  const [productionId, setProductionId] = useState<string | null>(null);
  const [addCallActive, setAddCallActive] = useState(false);
  const [confirmExitModalOpen, setConfirmExitModalOpen] = useState(false);
  const [isMasterInputMuted, setIsMasterInputMuted] = useState(true);
  const [customGlobalMute, setCustomGlobalMute] = useState("p");
  const [{ calls, selectedProductionId }, dispatch] = useGlobalState();
  const [shouldReduceVolume, setShouldReduceVolume] = useState(false);

  const { productionId: paramProductionId, lineId: paramLineId } = useParams();
  const navigate = useNavigate();

  const isEmpty = Object.values(calls).length === 0;
  const isSingleCall = Object.values(calls).length === 1;

  useEffect(() => {
    const reduceVolume = Object.entries(calls).some(
      ([, callState]) =>
        !callState.joinProductionOptions?.lineUsedForProgramOutput &&
        callState.audioLevelAboveThreshold
    );

    setShouldReduceVolume(reduceVolume);
  }, [calls]);

  useEffect(() => {
    if (selectedProductionId) {
      setProductionId(selectedProductionId);
    }
  }, [selectedProductionId]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Object.entries(calls).forEach(([_, callState]) => {
      if (
        callState.hotkeys?.globalMuteHotkey &&
        callState.hotkeys.globalMuteHotkey !== customGlobalMute
      ) {
        setCustomGlobalMute(callState.hotkeys.globalMuteHotkey);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calls]);

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

  const runExitAllCalls = async () => {
    setProductionId(null);
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
    <Container>
      <ButtonWrapper>
        <NavigateToRootButton
          resetOnExitRequest={() => {
            if (isEmpty) {
              runExitAllCalls();
            } else {
              setConfirmExitModalOpen(true);
            }
          }}
        />
        <HeaderRightSide>
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
          {!isEmpty && (
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
              <ButtonWrapper>
                <SecondaryButton
                  type="button"
                  onClick={() => setAddCallActive(!addCallActive)}
                >
                  Add Call
                </SecondaryButton>
              </ButtonWrapper>
            </AddCallContainer>
          )}
        </HeaderRightSide>
      </ButtonWrapper>
      {isEmpty && paramProductionId && paramLineId && (
        <JoinProduction
          preSelected={{
            preSelectedProductionId: paramProductionId,
            preSelectedLineId: paramLineId,
          }}
          customGlobalMute={customGlobalMute}
        />
      )}
      <CallsContainer>
        {Object.entries(calls).map(
          ([callId, callState]) =>
            callId &&
            callState.joinProductionOptions && (
              <CallContainer key={callId}>
                <ProductionLine
                  id={callId}
                  shouldReduceVolume={shouldReduceVolume}
                  callState={callState}
                  isSingleCall={isSingleCall}
                  customGlobalMute={customGlobalMute}
                  masterInputMute={isMasterInputMuted}
                />
              </CallContainer>
            )
        )}
        {addCallActive && productionId && (
          <JoinProduction
            customGlobalMute={customGlobalMute}
            addAdditionalCallId={productionId}
            closeAddCallView={() => setAddCallActive(false)}
            className="calls-page"
          />
        )}
      </CallsContainer>
    </Container>
  );
};
