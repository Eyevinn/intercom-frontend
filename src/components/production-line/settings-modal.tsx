import React, { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import {
  PrimaryButton,
  FormInput,
  FormContainer,
  StyledWarningMessage,
} from "../form-elements/form-elements";
import { useUpdateGlobalHotkey } from "./use-update-global-hotkey";
import { useCheckForDuplicateHotkey } from "./use-check-for-duplicate-hotkey";
import { Hotkeys } from "./types";
import { FormItem } from "../user-settings-form/form-item";
import {
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  CancelButton,
  ButtonDiv,
} from "./settings-modal-components";

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
    label: string,
    formError: boolean,
    formWarning: string
  ) => (
    <FormItem
      label={label}
      fieldName={field}
      errors={errors}
      errorClassName="error-message"
    >
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
      {formError && formWarning && (
        <ErrorMessage
          errors={{ [field]: { message: formWarning } }}
          name={field}
          as={StyledWarningMessage}
        />
      )}
    </FormItem>
  );

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={stopPropagation}>
        <ModalCloseButton onClick={onClose}>X</ModalCloseButton>
        <ModalHeader>Hotkey settings for line: {lineName}</ModalHeader>
        <FormContainer>
          {(programOutPutLine ? isProgramUser : !isProgramUser) &&
            renderFormInput(
              "muteHotkey",
              "Toggle mute",
              !errors.muteHotkey,
              warning.muteHotkey
            )}
          {!(programOutPutLine && isProgramUser) && (
            <>
              {renderFormInput(
                "speakerHotkey",
                "Toggle speaker",
                !errors.speakerHotkey,
                warning.speakerHotkey
              )}

              {!programOutPutLine &&
                renderFormInput(
                  "pushToTalkHotkey",
                  "Toggle push to talk",
                  !errors.pushToTalkHotkey,
                  warning.pushToTalkHotkey
                )}

              {renderFormInput(
                "increaseVolumeHotkey",
                "Increase volume",
                !errors.increaseVolumeHotkey,
                warning.increaseVolumeHotkey
              )}

              {renderFormInput(
                "decreaseVolumeHotkey",
                "Decrease volume",
                !errors.decreaseVolumeHotkey,
                warning.decreaseVolumeHotkey
              )}
            </>
          )}
          {!programOutPutLine &&
            renderFormInput(
              "globalMuteHotkey",
              "Toggle mute all microphones",
              !errors.globalMuteHotkey,
              warning.globalMuteHotkey
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
