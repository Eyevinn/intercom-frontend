import styled from "@emotion/styled";
import React, { useRef } from "react";
import { PrimaryButton, SecondaryButton } from "../landing-page/form-elements";

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
  text-color: white;
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

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormField = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Label = styled.label`
  font-size: 1.4rem;
  width: 30%;
  color: white;
`;

const Input = styled.input`
  flex: 1;
  padding: 0.5rem;
  border: 0.1rem solid #ccc;
  border-radius: 0.25rem;
  font-size: 1.2rem;
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

type Hotkeys = {
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
        <Form>
          <FormField>
            <Label>Toggle mute: </Label>
            <Input
              id="hotkeyMute"
              ref={(el) => setInputRef(0, el)}
              type="text"
              placeholder="Enter hotkey"
              value={hotkeys.muteHotkey}
              onChange={(e) => handleInputChange("muteHotkey", e.target.value)}
              maxLength={1}
              onKeyDown={(e) => handleKeyDown(e, 0)}
            />
          </FormField>
          <FormField>
            <Label>Toggle speaker: </Label>
            <Input
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
          </FormField>
          <FormField>
            <Label>Toggle press to speak: </Label>
            <Input
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
          </FormField>
          <ButtonDiv>
            <CancelButton type="button" onClick={onClose}>
              Cancel
            </CancelButton>
            <PrimaryButton type="button" onClick={onSave}>
              Save settings
            </PrimaryButton>
          </ButtonDiv>
        </Form>
      </ModalContent>
    </ModalOverlay>
  );
};
