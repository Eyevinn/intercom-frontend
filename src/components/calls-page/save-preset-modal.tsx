import styled from "@emotion/styled";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { usePresetContext } from "../../contexts/preset-context";
import { Modal } from "../modal/modal";
import {
  FormInput,
  FormLabel,
  DecorativeLabel,
  PrimaryButton,
  StyledWarningMessage,
} from "../form-elements/form-elements";
import { InfoTooltip } from "../info-tooltip/info-tooltip";

const FormRow = styled.div`
  display: flex;
  flex-direction: column;
`;

const SubmitBtn = styled(PrimaryButton)`
  display: block;
  margin-left: auto;
  padding: 0.6rem 1.4rem;
  font-size: 1.4rem;
`;

const ErrorText = styled.p`
  color: #f96c6c;
  font-size: 1.4rem;
  margin: 0 0 1rem;
`;

const CompanionRow = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 1.5rem;
`;

const CompanionToggleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 0.8rem;
`;

const CompanionInputGroup = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const CompanionPrefix = styled.span`
  position: absolute;
  left: 1.2rem;
  font-size: 1.4rem;
  color: #9aa3ab;
  pointer-events: none;
`;

const CompanionInput = styled(FormInput)`
  padding-left: calc(2rem + 3.5ch);
  margin: 0;
  font-size: 1.4rem;
`;

const VisibilityRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
`;

const RadioOption = styled.button<{ active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  font-size: 1.4rem;
  font-weight: ${({ active }) => (active ? "600" : "400")};
  color: ${({ active }) =>
    active ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.45)"};
  transition: color 0.15s;

  &:hover {
    color: rgba(255, 255, 255, 0.8);
  }
`;

const RadioDot = styled.span<{ active: boolean }>`
  position: relative;
  width: 1.6rem;
  height: 1.6rem;
  border-radius: 50%;
  border: 0.2rem solid
    ${({ active }) =>
      active ? "rgba(89, 203, 232, 1)" : "rgba(255,255,255,0.3)"};
  background: transparent;
  flex-shrink: 0;
  transition: border-color 0.15s;

  &::after {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 0.7rem;
    height: 0.7rem;
    border-radius: 50%;
    background: rgba(89, 203, 232, 1);
    opacity: ${({ active }) => (active ? 1 : 0)};
    transition: opacity 0.15s;
  }
`;

const isValidHostPort = (input: string): boolean => {
  const pattern = /^([a-zA-Z0-9.-]+|\[[\da-fA-F:]+\])(:\d{1,5})?$/;
  return pattern.test(input);
};

type FormValues = {
  name: string;
};

type SavePresetModalProps = {
  onClose: () => void;
  companionUrl?: string;
  orderedPresetCalls?: {
    productionId: string;
    lineId: string;
    lineUsedForProgramOutput?: boolean;
    isProgramUser?: boolean;
    lineName?: string;
  }[];
};

export const SavePresetModal = ({
  onClose,
  companionUrl,
  orderedPresetCalls,
}: SavePresetModalProps) => {
  const { createLocalPreset, createPublicPreset } = usePresetContext();
  const [isLocal, setIsLocal] = useState(false);
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
  const [saveError, setSaveError] = useState<string | null>(null);
  const COMPANION_PROTOCOL = "ws://";
  const initialHostPort = companionUrl
    ? companionUrl.replace(/^wss?:\/\//, "").replace(/\/$/, "")
    : "";
  const [companionHostPort, setCompanionHostPort] = useState(initialHostPort);
  const [includeCompanion, setIncludeCompanion] = useState(true);
  const showCompanion = !!companionUrl;

  const isCompanionValid =
    !includeCompanion ||
    companionHostPort === "" ||
    isValidHostPort(companionHostPort);

  const handleCompanionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.trim();
    let without = v;
    if (v.startsWith("ws://")) without = v.slice(5);
    else if (v.startsWith("wss://")) without = v.slice(6);
    setCompanionHostPort(without);
  };

  const companionUrlToSave =
    includeCompanion && companionHostPort
      ? `${COMPANION_PROTOCOL}${companionHostPort}`
      : undefined;

  const onSubmit = async ({ name }: FormValues) => {
    setSaveError(null);
    const presetCalls = (orderedPresetCalls ?? []).map((r) => ({
      productionId: r.productionId,
      lineId: r.lineId,
      ...(r.lineUsedForProgramOutput
        ? { lineUsedForProgramOutput: true, isProgramUser: !!r.isProgramUser }
        : {}),
      ...(r.lineName ? { lineName: r.lineName } : {}),
    }));
    try {
      if (isLocal) {
        createLocalPreset(name, presetCalls, companionUrlToSave);
      } else {
        await createPublicPreset({
          name,
          calls: presetCalls,
          companionUrl: companionUrlToSave,
        });
      }
      onClose();
    } catch (e) {
      setSaveError(
        e instanceof Error ? e.message : "Failed to save configuration"
      );
    }
  };

  return (
    <Modal
      onClose={onClose}
      title="Save as Configuration"
      titleExtra={
        <InfoTooltip>
          A <strong>saved configuration</strong> is a saved combination of lines
          you can join with one click. Deleting a line removes it from any saved
          configurations it belongs to.
        </InfoTooltip>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <VisibilityRow>
          <RadioOption
            type="button"
            active={!isLocal}
            onClick={() => setIsLocal(false)}
          >
            <RadioDot active={!isLocal} />
            Public
          </RadioOption>
          <RadioOption
            type="button"
            active={isLocal}
            onClick={() => setIsLocal(true)}
          >
            <RadioDot active={isLocal} />
            Local
          </RadioOption>
          <InfoTooltip>
            <strong>Public</strong> saved configurations are stored on the
            server and visible to everyone.
            <br />
            <strong>Local</strong> saved configurations are stored in your
            browser only — not visible to others, but can still be shared via
            URL.
          </InfoTooltip>
        </VisibilityRow>
        {showCompanion && (
          <CompanionRow>
            <CompanionToggleRow>
              <RadioOption
                type="button"
                active={includeCompanion}
                onClick={() => setIncludeCompanion((v) => !v)}
              >
                <RadioDot active={includeCompanion} />
                Include Companion URL
              </RadioOption>
              <InfoTooltip>
                If included, joining this saved configuration will automatically
                connect to your Bitfocus Companion WebSocket server.
              </InfoTooltip>
            </CompanionToggleRow>
            {includeCompanion && (
              <>
                <CompanionInputGroup>
                  <CompanionPrefix aria-hidden="true">
                    {COMPANION_PROTOCOL}
                  </CompanionPrefix>
                  <CompanionInput
                    id="companion-url"
                    type="text"
                    placeholder="localhost:12345"
                    value={companionHostPort}
                    onChange={handleCompanionChange}
                  />
                </CompanionInputGroup>
                {!isCompanionValid && (
                  <StyledWarningMessage role="alert">
                    Enter a valid host:port (e.g. localhost:12345)
                  </StyledWarningMessage>
                )}
              </>
            )}
          </CompanionRow>
        )}
        <FormRow>
          <FormLabel htmlFor="preset-name">
            <DecorativeLabel>Configuration name</DecorativeLabel>
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
            <StyledWarningMessage role="alert">
              {errors.name.message}
            </StyledWarningMessage>
          )}
        </FormRow>
        {saveError && <ErrorText role="alert">{saveError}</ErrorText>}
        <SubmitBtn type="submit" disabled={isSubmitting || !isCompanionValid}>
          {isSubmitting ? "Saving..." : "Save configuration"}
        </SubmitBtn>
      </form>
    </Modal>
  );
};
