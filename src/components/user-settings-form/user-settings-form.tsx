import styled from "@emotion/styled";
import { useEffect, useState, Dispatch, SetStateAction } from "react";
import { useForm, useWatch } from "react-hook-form";
import { isBrowserFirefox, isBrowserSafari } from "../../bowser";
import { useGlobalState } from "../../global-state/context-provider";
import { useSubmitOnEnter } from "../../hooks/use-submit-form-enter-press";
import { ButtonWrapper } from "../generic-components";
import {
  DevicesSection,
  FormInput,
  FormSelect,
  PrimaryButton,
  SectionTitle,
  StyledWarningMessage,
} from "../form-elements/form-elements";
import {
  CheckboxWrapper,
  FetchErrorMessage,
} from "../landing-page/join-production-components";
import { Checkbox } from "../checkbox/checkbox";
import { TJoinProductionOptions, TProduction } from "../production-line/types";
import { ReloadDevicesButton } from "../reload-devices-button.tsx/reload-devices-button";
import { TUserSettings } from "../user-settings/types";
import { ConfirmationModal } from "../verify-decision/confirmation-modal";
import { FormItem } from "./form-item";
import { useSubmitForm } from "./use-submit-form";
import { useFetchProductionList } from "../landing-page/use-fetch-production-list";
import { FirefoxWarning } from "../production-line/firefox-warning";

type FormValues = TJoinProductionOptions & {
  audiooutput: string;
};

const SubmitButton = styled(PrimaryButton)<{ shouldSubmitOnEnter?: boolean }>`
  outline: ${({ shouldSubmitOnEnter }) =>
    shouldSubmitOnEnter ? "2px solid #007bff" : "none"};
  outline-offset: ${({ shouldSubmitOnEnter }) =>
    shouldSubmitOnEnter ? "2px" : "0"};
`;

export const UserSettingsForm = ({
  isJoinProduction,
  preSelected,
  buttonText,
  defaultValues,
  setJoinProductionOptions,
  customGlobalMute,
  closeAddCallView,
  updateUserSettings,
  onSave,
  needsConfirmation,
  hideUsername,
  hideDevices,
  isProgramUser,
  setIsProgramUser,
}: {
  isJoinProduction?: boolean;
  preSelected?: {
    preSelectedProductionId: string;
    preSelectedLineId: string;
  };
  addAdditionalCallId?: string;
  buttonText: string;
  defaultValues: TUserSettings | FormValues;
  setJoinProductionOptions?: React.Dispatch<
    React.SetStateAction<TJoinProductionOptions | null>
  >;
  customGlobalMute?: string;
  closeAddCallView?: () => void;
  updateUserSettings?: boolean;
  onSave?: () => void;
  needsConfirmation?: boolean;
  hideUsername?: boolean;
  hideDevices?: boolean;
  isProgramUser?: boolean;
  setIsProgramUser?: Dispatch<SetStateAction<boolean>>;
}) => {
  const [production, setProduction] = useState<TProduction | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
  const [selectedLineName, setSelectedLineName] = useState<string>("");
  const [isProgramOutputLine, setIsProgramOutputLine] =
    useState<boolean>(false);
  const {
    formState: { errors, isValid },
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    control,
  } = useForm<FormValues | TUserSettings>({
    defaultValues,
    resetOptions: {
      keepDirtyValues: true, // user-interacted input will be retained
      keepErrors: true, // input errors will be retained with value update
    },
  });

  const { productions, error: productionListFetchError } =
    useFetchProductionList({
      limit: "100",
      extended: "true",
    });

  // this will update whenever lineId changes
  const selectedLineId = useWatch({ name: "lineId", control });

  const [{ devices, selectedProductionId: globalSelectedProductionId, calls }] =
    useGlobalState();

  const isAlreadyJoined =
    !!production &&
    !!selectedLineId &&
    Object.values(calls).some(
      (c) =>
        c.joinProductionOptions?.productionId === production.productionId &&
        c.joinProductionOptions?.lineId === selectedLineId
    );

  const { onSubmit } = useSubmitForm({
    isJoinProduction,
    production,
    isProgramUser: isProgramUser || false,
    setJoinProductionOptions,
    customGlobalMute,
    closeAddCallView,
    updateUserSettings,
    onSave,
    selectedLineName,
  });

  const isSettingsConfig = !isJoinProduction;

  useEffect(() => {
    if (production && isJoinProduction) {
      const selectedLine = production.lines.find(
        (line) => line.id.toString() === selectedLineId
      );
      setSelectedLineName(selectedLine?.name ?? "");
      setIsProgramOutputLine(!!selectedLine?.programOutputLine);
      if (!selectedLine?.programOutputLine) {
        setIsProgramUser?.(false);
      }
    }
  }, [production, selectedLineId, isJoinProduction, setIsProgramUser]);

  // Update selected line id when a new production is fetched
  useEffect(() => {
    // Don't run this hook if we have pre-selected values
    if (preSelected || !isJoinProduction) return;

    if (!production) {
      setValue("lineId", "");

      return;
    }

    const lineId = production.lines[0]?.id?.toString() ?? "";

    setValue("lineId", lineId, { shouldValidate: true });
  }, [preSelected, production, setValue, isJoinProduction]);

  useEffect(() => {
    if (defaultValues && "productionId" in defaultValues) {
      setValue("productionId", defaultValues.productionId);
    }
  }, [defaultValues, setValue]);

  useEffect(() => {
    if (defaultValues && "productionId" in defaultValues && productions) {
      setProduction(
        productions?.productions.find(
          (p) => p.productionId === defaultValues.productionId
        ) || null
      );
    }
  }, [defaultValues, productions]);

  // If devices have been enumerated and none are available, set to "no-device".
  // Only do this when devices.input is a non-null empty array (i.e. enumeration
  // has completed and genuinely returned no input devices). When devices.input
  // is still null the enumeration hasn't finished yet and we must not
  // pre-emptively set "no-device" — that value would be sent to the backend and
  // cause a 500 error.
  useEffect(() => {
    if (devices.input !== null && devices.input.length === 0) {
      setValue("audioinput", "no-device", { shouldValidate: true });
    }
  }, [devices, setValue]);

  // When real devices arrive, react-hook-form may still hold "no-device" (or a
  // falsy value) captured from the DOM before enumeration completed. Reset the
  // field to the default device so the correct device ID is submitted.
  useEffect(() => {
    if (!devices.input || devices.input.length === 0) return;
    const current = getValues("audioinput");
    if (!current || current === "no-device") {
      const defaultDevice =
        devices.input.find((d) => d.deviceId === "default")?.deviceId ??
        devices.input[0].deviceId;
      setValue("audioinput", defaultDevice, { shouldValidate: true });
    }
  }, [devices.input, getValues, setValue]);

  // If user selects a production from the productionlist
  useEffect(() => {
    if (globalSelectedProductionId && isJoinProduction) {
      reset({
        productionId: `${globalSelectedProductionId}`,
      });
    }
  }, [reset, globalSelectedProductionId, isJoinProduction]);

  useSubmitOnEnter<FormValues | TUserSettings>({
    handleSubmit,
    submitHandler: onSubmit,
    needsConfirmation,
    shouldSubmitOnEnter: true,
    isBrowserFirefox,
    setConfirmModalOpen,
  });

  return (
    <div style={{ minWidth: updateUserSettings ? "min(40rem, 100%)" : "" }}>
      {!preSelected && isJoinProduction && productions && (
        <FormItem label="Production Name" errors={errors}>
          <FormSelect
            // eslint-disable-next-line
            {...register(`productionId`)}
            onChange={(ev) => {
              setProduction(
                productions?.productions.find(
                  (p) => p.productionId === ev.target.value
                ) || null
              );
            }}
          >
            {productions.productions.map((p) => (
              <option key={p.productionId} value={p.productionId}>
                {p.name}
              </option>
            ))}
          </FormSelect>
          {productionListFetchError && (
            <FetchErrorMessage>
              The production list could not be fetched.
              {productionListFetchError.name} {productionListFetchError.message}
              .
            </FetchErrorMessage>
          )}
        </FormItem>
      )}
      {!preSelected && isJoinProduction && productions && (
        <FormItem label="Line">
          <FormSelect
            // eslint-disable-next-line
            {...register(`lineId`, {
              required: "Line id is required",
              minLength: 1,
            })}
            style={{
              display: production ? "block" : "none",
              marginBottom: isAlreadyJoined ? 0 : undefined,
            }}
          >
            {production &&
              production.lines.map((line) => (
                <option key={line.id} value={line.id}>
                  {line.name || line.id}
                </option>
              ))}
          </FormSelect>
          {!production && (
            <StyledWarningMessage>
              Please enter a production id
            </StyledWarningMessage>
          )}
          {isAlreadyJoined && (
            <StyledWarningMessage style={{ marginTop: "0.5rem" }}>
              You have already joined this line
            </StyledWarningMessage>
          )}
        </FormItem>
      )}
      {!hideUsername && (
        <FormItem label="Username" fieldName="username" errors={errors}>
          <FormInput
            // eslint-disable-next-line
            {...register(`username`, {
              required: !hideUsername ? "Username is required" : false,
              minLength: 1,
            })}
            placeholder="Username"
          />
        </FormItem>
      )}
      {!hideDevices && (isJoinProduction || isSettingsConfig) && (
        <>
          <DevicesSection>
            <SectionTitle>
              {isBrowserSafari ? "Device" : "Devices"}
              <ReloadDevicesButton />
              {isBrowserFirefox && <FirefoxWarning type="firefox-warning" />}
            </SectionTitle>
          </DevicesSection>
          <FormItem label="Input">
            <FormSelect
              // eslint-disable-next-line
              {...register(`audioinput`)}
            >
              {devices.input && devices.input.length > 0 ? (
                devices.input.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label}
                  </option>
                ))
              ) : (
                <option value="no-device">No device available</option>
              )}
            </FormSelect>
          </FormItem>
          {!isBrowserSafari && (
            <FormItem label="Output">
              {devices.output && devices.output.length > 0 ? (
                <FormSelect
                  // eslint-disable-next-line
                  {...register(`audiooutput`)}
                >
                  {devices.output.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label}
                    </option>
                  ))}
                </FormSelect>
              ) : (
                <StyledWarningMessage>
                  Controlled by operating system
                </StyledWarningMessage>
              )}
            </FormItem>
          )}
        </>
      )}
      {isProgramOutputLine && isJoinProduction && (
        <CheckboxWrapper>
          <Checkbox
            label="Listener"
            checked={!isProgramUser}
            onChange={() => setIsProgramUser?.(false)}
          />
          <Checkbox
            label="Audio feed"
            checked={!!isProgramUser}
            onChange={() => setIsProgramUser?.(true)}
          />
        </CheckboxWrapper>
      )}
      <ButtonWrapper>
        <SubmitButton
          type="button"
          disabled={isJoinProduction ? !isValid || isAlreadyJoined : false}
          onClick={
            !needsConfirmation || isBrowserFirefox
              ? handleSubmit(onSubmit)
              : () => setConfirmModalOpen(true)
          }
          shouldSubmitOnEnter
        >
          {buttonText}
        </SubmitButton>
      </ButtonWrapper>

      {confirmModalOpen && (
        <ConfirmationModal
          title="Confirm"
          description="Are you sure you want to update your settings?"
          confirmationText="This will update the devices for all current lines."
          onConfirm={handleSubmit(onSubmit)}
          onCancel={() => setConfirmModalOpen(false)}
          shouldSubmitOnEnter
        />
      )}
    </div>
  );
};
