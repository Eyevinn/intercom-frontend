import styled from "@emotion/styled";
import { FC, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { HeadsetIcon } from "../assets/icons/icon.tsx";
import { backgroundColour } from "../css-helpers/defaults.ts";
import { useGlobalState } from "../global-state/context-provider.tsx";
import { DisplayContainerHeader } from "./landing-page/display-container-header.tsx";
import { ModalConfirmationText } from "./modal/modal-confirmation-text.ts";
import { Modal } from "./modal/modal.tsx";
import { useAudioCue } from "./production-line/use-audio-cue.ts";
import { VerifyDecision } from "./verify-decision/verify-decision.tsx";

const HeaderWrapper = styled.div`
  width: 100%;
  background: ${backgroundColour};
  margin: 0 0 1rem 0;
`;

const HomeButton = styled.button`
  background: ${backgroundColour};
  border: none;
  padding: 1rem;
  display: flex;
  align-items: center;
  width: fit-content;
  font-size: 3rem;
  font-weight: semi-bold;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.87);

  svg {
    width: 2.4rem;
    height: 2.4rem;
    margin-right: 1rem;
    margin-left: 1rem;
    fill: #59cbe8;
  }
`;

export const Header: FC = () => {
  const [confirmExitModalOpen, setConfirmExitModalOpen] = useState(false);
  const [{ calls }, dispatch] = useGlobalState();
  const navigate = useNavigate();
  const location = useLocation();
  const { playExitSound } = useAudioCue();
  const isEmpty = Object.values(calls).length === 0;

  const runExitAllCalls = () => {
    setConfirmExitModalOpen(false);
    navigate("/");
    playExitSound();
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

  const returnToRoot = () => {
    if (location.pathname.includes("/line") && isEmpty) {
      runExitAllCalls();
    } else if (location.pathname.includes("/line")) {
      setConfirmExitModalOpen(true);
    } else {
      navigate("/");
    }
  };

  return (
    <>
      <HeaderWrapper>
        <HomeButton onClick={returnToRoot}>
          <HeadsetIcon />
          Intercom
        </HomeButton>
      </HeaderWrapper>
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
    </>
  );
};
