import styled from "@emotion/styled";
import React, { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
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
  const [hotkeys, setHotkeys] = useState<Hotkeys>({
    muteHotkey: "m",
    speakerHotkey: "n",
    pushToTalkHotkey: "t",
    increaseVolumeHotkey: "u",
    decreaseVolumeHotkey: "d",
    globalMuteHotkey: customGlobalMute,
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

  const {
    formState: { errors },
    register,
    handleSubmit,
    clearErrors,
    setValue,
    trigger,
    watch,
  } = useForm<Hotkeys>({
    defaultValues: {
      muteHotkey: savedHotkeys.muteHotkey,
      speakerHotkey: savedHotkeys.speakerHotkey,
      pushToTalkHotkey: savedHotkeys.pushToTalkHotkey,
      increaseVolumeHotkey: savedHotkeys.increaseVolumeHotkey,
      decreaseVolumeHotkey: savedHotkeys.decreaseVolumeHotkey,
      globalMuteHotkey: customGlobalMute,
    },
    resetOptions: {
      keepDirtyValues: true, // user-interacted input will be retained
      keepErrors: true, // input errors will be retained with value update
    },
  });

  useEffect(() => {
    if (isOpen) {
      setHotkeys({
        ...savedHotkeys,
      });
    }
  }, [savedHotkeys, isOpen]);

  useEffect(() => {
    if (!globalStateDuplicates) return;

    const validateFieldsGlobally = () => {
      const currentValues = watch();

      const newWarning = (
        Object.keys(currentValues) as Array<keyof Hotkeys>
      ).reduce(
        (acc, field) => {
          const isGlobalStateDuplicate = currentValues[field]
            ? globalStateDuplicates?.includes(currentValues[field])
            : false;
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

      setWarning(newWarning);
    };

    validateFieldsGlobally();
  }, [globalStateDuplicates, customGlobalMute, watch]);

  const validateFieldsLocally = (value: string, key: string) => {
    const currentValues = watch();

    const otherValues = Object.entries(currentValues)
      .filter(([k]) => k !== key)
      .map(([, v]) => v);
    return (
      !otherValues.includes(value) ||
      `The hotkey "${value}" is already assigned.`
    );
  };

  const onSubmit: SubmitHandler<Hotkeys> = (payload) => {
    updateGlobalHotkey({ callId, hotkeys: payload });
    onSave();
  };

  const updateFieldErrors = (field: keyof Hotkeys, value: string) => {
    const currentValues = watch();

    const uniqueKeys = Object.entries(currentValues).reduce<
      Record<string, boolean>
    >((acc, [key, val]) => {
      const isUnique =
        Object.values(currentValues).filter((v) => v === val).length === 1;
      acc[key] = isUnique;
      return acc;
    }, {});

    const uniqueFields = Object.keys(uniqueKeys).filter(
      (key) => uniqueKeys[key]
    );

    clearErrors(uniqueFields as Array<keyof Hotkeys>);

    const duplicateFields = Object.entries(currentValues)
      .filter(([key, val]) => val === value && key !== field)
      .map(([key]) => key);

    const fieldsToUpdate = [
      field,
      ...(duplicateFields as Array<keyof Hotkeys>),
    ];

    trigger(fieldsToUpdate);
  };

  const renderFormInput = (
    field: keyof Hotkeys,
    formError: boolean,
    formWarning: string
  ) => (
    <>
      <FormInput
        // eslint-disable-next-line
        {...register(field, {
          required: "Hotkey is required",
          minLength: 1,
          validate: (value) => {
            return validateFieldsLocally(value, field);
          },
          onChange: (e) => {
            setValue(field, e.target.value);
            setHotkeys((prev) => ({ ...prev, [field]: e.target.value }));
            updateFieldErrors(field, e.target.value);
          },
        })}
        placeholder="Enter hotkey"
      />
      <ErrorMessage
        errors={errors}
        name={field}
        as={<StyledWarningMessage className="error-message" />}
      />
      {formError && formWarning && (
        <ErrorMessage
          errors={{ [field]: { message: formWarning } }}
          name={field}
          as={StyledWarningMessage}
        />
      )}
    </>
  );

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={stopPropagation}>
        <ModalCloseButton onClick={onClose}>X</ModalCloseButton>
        <ModalHeader>Hotkey settings for line: {lineName}</ModalHeader>
        <FormContainer>
          {(programOutPutLine ? isProgramUser : !isProgramUser) && (
            <FormLabel>
              <DecorativeLabel>Toggle mute: </DecorativeLabel>
              {renderFormInput(
                "muteHotkey",
                !errors.muteHotkey,
                warning.muteHotkey
              )}
            </FormLabel>
          )}
          {!(programOutPutLine && isProgramUser) && (
            <>
              <FormLabel>
                <DecorativeLabel>Toggle speaker: </DecorativeLabel>
                {renderFormInput(
                  "speakerHotkey",
                  !errors.speakerHotkey,
                  warning.speakerHotkey
                )}
              </FormLabel>
              {!programOutPutLine && (
                <FormLabel>
                  <DecorativeLabel>Toggle push to talk: </DecorativeLabel>
                  {renderFormInput(
                    "pushToTalkHotkey",
                    !errors.pushToTalkHotkey,
                    warning.pushToTalkHotkey
                  )}
                </FormLabel>
              )}
              <FormLabel>
                <DecorativeLabel>Increase volume:</DecorativeLabel>
                {renderFormInput(
                  "increaseVolumeHotkey",
                  !errors.increaseVolumeHotkey,
                  warning.increaseVolumeHotkey
                )}
              </FormLabel>
              <FormLabel>
                <DecorativeLabel>Decrease volume:</DecorativeLabel>
                {renderFormInput(
                  "decreaseVolumeHotkey",
                  !errors.decreaseVolumeHotkey,
                  warning.decreaseVolumeHotkey
                )}
              </FormLabel>
            </>
          )}
          {!programOutPutLine && (
            <FormLabel>
              <DecorativeLabel>Toggle mute all microphones: </DecorativeLabel>
              {renderFormInput(
                "globalMuteHotkey",
                !errors.globalMuteHotkey,
                warning.globalMuteHotkey
              )}
            </FormLabel>
          )}
          <ButtonDiv>
            <CancelButton type="button" onClick={onClose}>
              Cancel
            </CancelButton>
            <PrimaryButton type="button" onClick={handleSubmit(onSubmit)}>
              Save settings
            </PrimaryButton>
          </ButtonDiv>
        </FormContainer>
      </ModalContent>
    </ModalOverlay>
  );
};
