import styled from "@emotion/styled";
import React, { useRef } from "react";
import {
  PrimaryButton,
  SecondaryButton,
  FormLabel,
  FormInput,
  FormContainer,
  DecorativeLabel,
} from "../landing-page/form-elements";

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.div`
  background: #383838;
  border-radius: 0.5rem;
  padding: 2rem;
  width: 80%;
  max-width: 40rem;
  box-shadow: 0 0.4rem 0.8rem rgba(0, 0, 0, 0.2);
  color: white;
`;

const ModalHeader = styled.h2`
  font-size: 2rem;
  margin-bottom: 2rem;
  font-weight: 600;
`;

const ModalCloseButton = styled.button`
  background: none;
  border: none;
  position: absolute;
  top: 1rem;
  right: 1rem;
  cursor: pointer;
  font-size: 1.6rem;
`;

const CancelButton = styled(SecondaryButton)`
  background-color: #000000;
`;

const ButtonDiv = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 3rem;
`;

export type Hotkeys = {
  muteHotkey: string;
  speakerHotkey: string;
  pressToTalkHotkey: string;
};

type TSettingsModalProps = {
  hotkeys: Hotkeys;
  lineName?: string;
  setHotkeys: React.Dispatch<React.SetStateAction<Hotkeys>>;
  onClose: () => void;
  onSave: () => void;
};

export const SettingsModal = ({
  hotkeys,
  lineName,
  setHotkeys,
  onClose,
  onSave,
}: TSettingsModalProps) => {
  const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleInputChange = (key: string, value: string) => {
    if (value.length <= 1 && /^[a-zA-Z]?$/.test(value)) {
      setHotkeys((prev: Hotkeys) => ({
        ...prev,
        [key]: value,
      }));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const nextInput = inputRefs.current[index + 1];
      if (nextInput) {
        nextInput.focus();
      } else {
        onSave();
      }
    }
  };

  const setInputRef = (index: number, el: HTMLInputElement | null) => {
    inputRefs.current[index] = el;
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={stopPropagation}>
        <ModalCloseButton onClick={onClose}>X</ModalCloseButton>
        <ModalHeader>Hotkey settings for line: {lineName}</ModalHeader>
        <FormContainer>
          <FormLabel>
            <DecorativeLabel>Toggle mute: </DecorativeLabel>
            <FormInput
              id="hotkeyMute"
              ref={(el) => setInputRef(0, el)}
              type="text"
              placeholder="Enter hotkey"
              value={hotkeys.muteHotkey}
              onChange={(e) => handleInputChange("muteHotkey", e.target.value)}
              maxLength={1}
              onKeyDown={(e) => handleKeyDown(e, 0)}
            />
          </FormLabel>
          <FormLabel>
            <DecorativeLabel>Toggle speaker: </DecorativeLabel>
            <FormInput
              id="hotkeySpeaker"
              ref={(el) => setInputRef(1, el)}
              type="text"
              value={hotkeys.speakerHotkey}
              onChange={(e) =>
                handleInputChange("speakerHotkey", e.target.value)
              }
              placeholder="Enter hotkey"
              maxLength={1}
              onKeyDown={(e) => handleKeyDown(e, 1)}
            />
          </FormLabel>
          <FormLabel>
            <DecorativeLabel>Toggle press to speak: </DecorativeLabel>
            <FormInput
              id="hotkeyPress"
              ref={(el) => setInputRef(2, el)}
              type="text"
              value={hotkeys.pressToTalkHotkey}
              onChange={(e) =>
                handleInputChange("pressToTalkHotkey", e.target.value)
              }
              placeholder="Enter hotkey"
              maxLength={1}
              onKeyDown={(e) => handleKeyDown(e, 2)}
            />
          </FormLabel>
          <ButtonDiv>
            <CancelButton type="button" onClick={onClose}>
              Cancel
            </CancelButton>
            <PrimaryButton type="button" onClick={onSave}>
              Save settings
            </PrimaryButton>
          </ButtonDiv>
        </FormContainer>
      </ModalContent>
    </ModalOverlay>
  );
};
