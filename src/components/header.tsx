import styled from "@emotion/styled";
import { FC, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { backgroundColour } from "../css-helpers/defaults.ts";
import { useGlobalState } from "../global-state/context-provider.tsx";
import { HeadsetIcon } from "../assets/icons/icon.tsx";
import { useAudioCue } from "./production-line/use-audio-cue.ts";
import { DisplayContainerHeader } from "./landing-page/display-container-header.tsx";
import { Modal } from "./modal/modal.tsx";
import { VerifyDecision } from "./verify-decision/verify-decision.tsx";
import { ModalConfirmationText } from "./modal/modal-confirmation-text.ts";

const HeaderWrapper = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  background: ${backgroundColour};
  padding: 1rem;
  font-size: 3rem;
  font-weight: semi-bold;
  margin: 0 0 1rem 0;
  cursor: pointer;

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
      <HeaderWrapper onClick={returnToRoot}>
        <HeadsetIcon />
        Intercom
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
