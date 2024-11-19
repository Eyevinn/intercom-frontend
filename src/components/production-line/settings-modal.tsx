import styled from "@emotion/styled";
import React, { useRef, useState } from "react";
import { ErrorMessage } from "@hookform/error-message";
import {
  PrimaryButton,
  SecondaryButton,
  FormLabel,
  FormInput,
  FormContainer,
  DecorativeLabel,
  StyledWarningMessage,
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
  const [errors, setErrors] = useState<{ [key: string]: string }>({
    muteHotkey: "",
    speakerHotkey: "",
    pressToTalkHotkey: "",
  });

  const validateFields = (key: string, value: string) => {
    const currentValues = {
      ...hotkeys,
      [key]: value,
    };

    const duplicates = Object.entries(currentValues).reduce(
      (acc, [field, val]) => {
        if (val && value && val === value && field !== key) {
          acc[key] = "This key is already in use.";
        }
        return acc;
      },
      {} as { [key: string]: string }
    );

    setErrors((prevErrors) => ({
      ...prevErrors,
      muteHotkey:
        key === "muteHotkey"
          ? duplicates.muteHotkey || ""
          : prevErrors.muteHotkey,
      speakerHotkey:
        key === "speakerHotkey"
          ? duplicates.speakerHotkey || ""
          : prevErrors.speakerHotkey,
      pressToTalkHotkey:
        key === "pressToTalkHotkey"
          ? duplicates.pressToTalkHotkey || ""
          : prevErrors.pressToTalkHotkey,
    }));
  };

  const handleInputChange = (key: keyof typeof hotkeys, value: string) => {
    if (value.length <= 1 && /^[a-zA-Z]?$/.test(value)) {
      setHotkeys((prev) => ({
        ...prev,
        [key]: value,
      }));
      validateFields(key, value);
    }
  };

  const handleSave = () => {
    const hasErrors = Object.values(errors).some((error) => error !== "");
    if (!hasErrors) {
      onSave();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const nextInput = inputRefs.current[index + 1];
      if (nextInput) {
        nextInput.focus();
      } else {
        handleSave();
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const previousInput = inputRefs.current[index - 1];
      if (previousInput) {
        previousInput.focus();
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const nextInput = inputRefs.current[index + 1];
      if (nextInput) {
        nextInput.focus();
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
            {errors.muteHotkey && (
              <ErrorMessage
                errors={{ mutekey: { message: errors.muteHotkey } }}
                name="mutekey"
                as={StyledWarningMessage}
              />
            )}
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
            {errors.speakerHotkey && (
              <ErrorMessage
                errors={{ speakerkey: { message: errors.speakerHotkey } }}
                name="speakerkey"
                as={StyledWarningMessage}
              />
            )}
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
            {errors.pressToTalkHotkey && (
              <ErrorMessage
                errors={{ presskey: { message: errors.pressToTalkHotkey } }}
                name="presskey"
                as={StyledWarningMessage}
              />
            )}
          </FormLabel>
          <ButtonDiv>
            <CancelButton type="button" onClick={onClose}>
              Cancel
            </CancelButton>
            <PrimaryButton type="button" onClick={handleSave}>
              Save settings
            </PrimaryButton>
          </ButtonDiv>
        </FormContainer>
      </ModalContent>
    </ModalOverlay>
  );
};
