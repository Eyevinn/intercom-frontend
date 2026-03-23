import styled from "@emotion/styled";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useGlobalState } from "../../global-state/context-provider";
import { API } from "../../api/api";
import { Modal } from "../modal/modal";
import {
  FormInput,
  FormLabel,
  DecorativeLabel,
  PrimaryButton,
} from "../form-elements/form-elements";

const FormRow = styled.div`
  display: flex;
  flex-direction: column;
`;

const SubmitBtn = styled(PrimaryButton)`
  width: 100%;
  justify-content: center;
`;

const ErrorText = styled.p`
  color: #f96c6c;
  font-size: 1.4rem;
  margin: 0 0 1rem;
`;

const SuccessText = styled.p`
  color: #91fa8c;
  font-size: 1.4rem;
  margin: 0 0 1rem;
`;

const ValidationError = styled.span`
  color: #f96c6c;
  font-size: 1.3rem;
  display: block;
  margin: -1.5rem 0 1rem;
`;

type FormValues = {
  name: string;
};

type SavePresetModalProps = {
  onClose: () => void;
};

export const SavePresetModal = ({ onClose }: SavePresetModalProps) => {
  const [{ calls }] = useGlobalState();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ mode: "onSubmit" });
  const {
    ref: nameRef,
    onChange: nameOnChange,
    onBlur: nameOnBlur,
    name: nameAttr,
  } = register("name", {
    required: "Name is required",
    minLength: { value: 1, message: "Name is required" },
    maxLength: {
      value: 200,
      message: "Name must be 200 characters or fewer",
    },
  });
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const onSubmit = async ({ name }: FormValues) => {
    setSaveError(null);
    const presetCalls = Object.values(calls)
      .map((c) => c.joinProductionOptions)
      .filter(Boolean)
      .map((o) => ({
        productionId: o!.productionId,
        lineId: o!.lineId,
      }));
    try {
      await API.createPreset({ name, calls: presetCalls });
      setSaved(true);
      setTimeout(onClose, 2000);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Failed to save preset");
    }
  };

  return (
    <Modal onClose={onClose} title="Save Preset">
      {saved ? (
        <SuccessText>Preset saved! Closing...</SuccessText>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormRow>
            <FormLabel htmlFor="preset-name">
              <DecorativeLabel>Preset name</DecorativeLabel>
              <FormInput
                id="preset-name"
                placeholder="e.g. Morning show setup"
                ref={nameRef}
                onChange={nameOnChange}
                onBlur={nameOnBlur}
                name={nameAttr}
              />
            </FormLabel>
            {errors.name && (
              <ValidationError role="alert">
                {errors.name.message}
              </ValidationError>
            )}
          </FormRow>
          {saveError && <ErrorText role="alert">{saveError}</ErrorText>}
          <SubmitBtn type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Preset"}
          </SubmitBtn>
        </form>
      )}
    </Modal>
  );
};
