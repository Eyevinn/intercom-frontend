import styled from "@emotion/styled";
import React, { useEffect, useRef, useState } from "react";
import { ErrorMessage } from "@hookform/error-message";
import {
  PrimaryButton,
  FormLabel,
  FormInput,
  FormContainer,
  DecorativeLabel,
  StyledWarningMessage,
  ActionButton,
} from "../landing-page/form-elements";
import { useUpdateGlobalHotkey } from "./use-update-global-hotkey";
import { useCheckForDuplicateHotkey } from "./use-check-for-duplicate-hotkey";
import { Hotkeys } from "./types";

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

const CancelButton = styled(ActionButton)`
  background: #d6d3d1;

  &:disabled {
    background: rgba(214, 211, 209, 0.8);
  }
`;

const ButtonDiv = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 3rem;
`;

type TSettingsModalProps = {
  isOpen: boolean;
  callId: string;
  savedHotkeys: Hotkeys;
  customGlobalMute: string;
  lineName?: string;
  programOutPutLine?: boolean;
  isProgramUser: boolean;
  onClose: () => void;
  onSave: () => void;
};

export const SettingsModal = ({
  isOpen,
  callId,
  savedHotkeys,
  customGlobalMute,
  lineName,
  programOutPutLine,
  isProgramUser,
  onClose,
  onSave,
}: TSettingsModalProps) => {
  const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [hotkeys, setHotkeys] = useState<Hotkeys>({
    muteHotkey: "m",
    speakerHotkey: "n",
    pushToTalkHotkey: "t",
    increaseVolumeHotkey: "u",
    decreaseVolumeHotkey: "d",
    globalMuteHotkey: customGlobalMute,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({
    muteHotkey: "",
    speakerHotkey: "",
    pushToTalkHotkey: "",
    increaseVolumeHotkey: "",
    decreaseVolumeHotkey: "",
    globalMuteHotkey: "",
  });
  const [warning, setWarning] = useState<{ [key: string]: string }>({
    muteHotkey: "",
    speakerHotkey: "",
    pushToTalkHotkey: "",
    increaseVolumeHotkey: "",
    decreaseVolumeHotkey: "",
    globalMuteHotkey: "",
  });

  const [updateGlobalHotkey] = useUpdateGlobalHotkey();
  const globalStateDuplicates = useCheckForDuplicateHotkey({ callId, hotkeys });

  useEffect(() => {
    if (isOpen) {
      setHotkeys({
        ...savedHotkeys,
      });
    }
  }, [savedHotkeys, isOpen]);

  const validateFields = (key: keyof Hotkeys, value: string) => {
    const currentValues = {
      ...hotkeys,
      [key]: value,
    };

    const newErrors = (
      Object.keys(currentValues) as Array<keyof Hotkeys>
    ).reduce(
      (acc, field) => {
        const isDuplicate =
          Object.values(currentValues).filter(
            (val) => val && val === currentValues[field]
          ).length > 1;

        if (!currentValues[field]) {
          acc[field] = "This field can not be empty.";
        } else if (isDuplicate) {
          acc[field] = "This key is already in use.";
        } else {
          acc[field] = "";
        }

        return acc;
      },
      {} as { [K in keyof Hotkeys]: string }
    );

    const newWarning = (
      Object.keys(currentValues) as Array<keyof Hotkeys>
    ).reduce(
      (acc, field) => {
        const isGlobalStateDuplicate = globalStateDuplicates?.includes(
          currentValues[field]
        );
        const isGlobalMute =
          field === "globalMuteHotkey" &&
          customGlobalMute === currentValues[field];

        if (isGlobalStateDuplicate && !isGlobalMute) {
          acc[field] = "This key is used in another connected line.";
        } else {
          acc[field] = "";
        }

        return acc;
      },
      {} as { [K in keyof Hotkeys]: string }
    );

    setErrors(newErrors);
    setWarning(newWarning);
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
    const hasEmptyFields = Object.values(hotkeys).some((value) => !value);

    if (hasErrors || hasEmptyFields) {
      return;
    }
    updateGlobalHotkey({ callId, hotkeys });
    onSave();
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
          {(programOutPutLine ? isProgramUser : !isProgramUser) && (
            <FormLabel>
              <DecorativeLabel>Toggle mute: </DecorativeLabel>
              <FormInput
                id="hotkeyMute"
                ref={(el) => setInputRef(0, el)}
                type="text"
                placeholder="Enter hotkey"
                value={hotkeys.muteHotkey}
                onChange={(e) =>
                  handleInputChange("muteHotkey", e.target.value)
                }
                maxLength={1}
                onKeyDown={(e) => handleKeyDown(e, 0)}
              />
              {errors.muteHotkey && (
                <ErrorMessage
                  errors={{ mutekey: { message: errors.muteHotkey } }}
                  name="mutekey"
                  as={<StyledWarningMessage className="error-message" />}
                />
              )}
              {!errors.muteHotkey && warning.muteHotkey && (
                <ErrorMessage
                  errors={{ mutekey: { message: warning.muteHotkey } }}
                  name="mutekey"
                  as={StyledWarningMessage}
                />
              )}
            </FormLabel>
          )}
          {!(programOutPutLine && isProgramUser) && (
            <>
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
                    as={<StyledWarningMessage className="error-message" />}
                  />
                )}
                {!errors.speakerHotkey && warning.speakerHotkey && (
                  <ErrorMessage
                    errors={{ speakerkey: { message: warning.speakerHotkey } }}
                    name="speakerkey"
                    as={StyledWarningMessage}
                  />
                )}
              </FormLabel>
              <FormLabel>
                <DecorativeLabel>Toggle push to talk: </DecorativeLabel>
                <FormInput
                  id="hotkeyPushToTalk"
                  ref={(el) => setInputRef(2, el)}
                  type="text"
                  value={hotkeys.pushToTalkHotkey}
                  onChange={(e) =>
                    handleInputChange("pushToTalkHotkey", e.target.value)
                  }
                  placeholder="Enter hotkey"
                  maxLength={1}
                  onKeyDown={(e) => handleKeyDown(e, 2)}
                />
                {errors.pushToTalkHotkey && (
                  <ErrorMessage
                    errors={{
                      longpresskey: { message: errors.pushToTalkHotkey },
                    }}
                    name="longpresskey"
                    as={<StyledWarningMessage className="error-message" />}
                  />
                )}
                {!errors.pushToTalkHotkey && warning.pushToTalkHotkey && (
                  <ErrorMessage
                    errors={{
                      longpresskey: { message: warning.pushToTalkHotkey },
                    }}
                    name="longpresskey"
                    as={StyledWarningMessage}
                  />
                )}
              </FormLabel>
              <FormLabel>
                <DecorativeLabel>Increase volume:</DecorativeLabel>
                <FormInput
                  id="increaseVolume"
                  ref={(el) => setInputRef(3, el)}
                  type="text"
                  value={hotkeys.increaseVolumeHotkey}
                  onChange={(e) =>
                    handleInputChange("increaseVolumeHotkey", e.target.value)
                  }
                  placeholder="Enter hotkey"
                  maxLength={1}
                  onKeyDown={(e) => handleKeyDown(e, 3)}
                />
                {errors.increaseVolumeHotkey && (
                  <ErrorMessage
                    errors={{
                      increasevolumekey: {
                        message: errors.increaseVolumeHotkey,
                      },
                    }}
                    name="increasevolumekey"
                    as={<StyledWarningMessage className="error-message" />}
                  />
                )}
                {!errors.increaseVolumeHotkey &&
                  warning.increaseVolumeHotkey && (
                    <ErrorMessage
                      errors={{
                        increasevolumekey: {
                          message: warning.increaseVolumeHotkey,
                        },
                      }}
                      name="increasevolumekey"
                      as={StyledWarningMessage}
                    />
                  )}
              </FormLabel>
              <FormLabel>
                <DecorativeLabel>Decrease volume:</DecorativeLabel>
                <FormInput
                  id="decreaseVolume"
                  ref={(el) => setInputRef(4, el)}
                  type="text"
                  value={hotkeys.decreaseVolumeHotkey}
                  onChange={(e) =>
                    handleInputChange("decreaseVolumeHotkey", e.target.value)
                  }
                  placeholder="Enter hotkey"
                  maxLength={1}
                  onKeyDown={(e) => handleKeyDown(e, 4)}
                />
                {errors.decreaseVolumeHotkey && (
                  <ErrorMessage
                    errors={{
                      decreasevolumehotkey: {
                        message: errors.decreaseVolumeHotkey,
                      },
                    }}
                    name="decreasevolumehotkey"
                    as={<StyledWarningMessage className="error-message" />}
                  />
                )}
                {!errors.decreaseVolumeHotkey &&
                  warning.decreaseVolumeHotkey && (
                    <ErrorMessage
                      errors={{
                        decreasevolumehotkey: {
                          message: warning.decreaseVolumeHotkey,
                        },
                      }}
                      name="decreasevolumehotkey"
                      as={StyledWarningMessage}
                    />
                  )}
              </FormLabel>
            </>
          )}
          <FormLabel>
            <DecorativeLabel>Toggle mute all microphones: </DecorativeLabel>
            <FormInput
              id="globalMuteMicrophones"
              ref={(el) => setInputRef(3, el)}
              type="text"
              value={hotkeys.globalMuteHotkey}
              onChange={(e) =>
                handleInputChange("globalMuteHotkey", e.target.value)
              }
              placeholder="Enter hotkey"
              maxLength={1}
              onKeyDown={(e) => handleKeyDown(e, 3)}
            />
            {errors.globalMuteHotkey && (
              <ErrorMessage
                errors={{
                  globalMuteHotkey: { message: errors.globalMuteHotkey },
                }}
                name="globalMuteHotkey"
                as={<StyledWarningMessage className="error-message" />}
              />
            )}
            {!errors.globalMuteHotkey && warning.globalMuteHotkey && (
              <ErrorMessage
                errors={{
                  globalMuteHotkey: { message: warning.globalMuteHotkey },
                }}
                name="globalMuteHotkey"
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
