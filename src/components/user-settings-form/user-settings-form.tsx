import styled from "@emotion/styled";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { isBrowserFirefox, isBrowserSafari } from "../../bowser";
import { useGlobalState } from "../../global-state/context-provider";
import { useSubmitOnEnter } from "../../hooks/use-submit-form-enter-press";
import { Checkbox } from "../checkbox/checkbox";
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
  isProgramUser,
  setIsProgramUser,
  defaultValues,
  setJoinProductionOptions,
  customGlobalMute,
  closeAddCallView,
  updateUserSettings,
  onSave,
  isFirstConnection,
  needsConfirmation,
}: {
  isJoinProduction?: boolean;
  preSelected?: {
    preSelectedProductionId: string;
    preSelectedLineId: string;
  };
  addAdditionalCallId?: string;
  isProgramUser?: boolean;
  setIsProgramUser?: (isProgramUser: boolean) => void;
  buttonText: string;
  defaultValues: TUserSettings | FormValues;
  setJoinProductionOptions?: React.Dispatch<
    React.SetStateAction<TJoinProductionOptions | null>
  >;
  customGlobalMute?: string;
  closeAddCallView?: () => void;
  updateUserSettings?: boolean;
  onSave?: () => void;
  isFirstConnection?: string;
  needsConfirmation?: boolean;
}) => {
  const [production, setProduction] = useState<TProduction | null>(null);
  const [isProgramOutputLine, setIsProgramOutputLine] =
    useState<boolean>(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
  const [selectedLineName, setSelectedLineName] = useState<string>("");
  const {
    formState: { errors, isValid },
    register,
    handleSubmit,
    reset,
    setValue,
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

  const [{ devices, selectedProductionId }] = useGlobalState();

  const { onSubmit } = useSubmitForm({
    isJoinProduction,
    production,
    isProgramUser,
    setJoinProductionOptions,
    customGlobalMute,
    closeAddCallView,
    updateUserSettings,
    onSave,
    selectedLineName,
  });

  const isSettingsConfig = !isJoinProduction;
  const isSupportedBrowser = isBrowserFirefox && isJoinProduction;

  useEffect(() => {
    if (production && isJoinProduction) {
      const selectedLine = production.lines.find(
        (line) => line.id.toString() === selectedLineId
      );
      setIsProgramOutputLine(!!selectedLine?.programOutputLine);
      setSelectedLineName(selectedLine?.name ?? "");
    }
  }, [production, selectedLineId, isJoinProduction]);

  // Update selected line id when a new production is fetched
  useEffect(() => {
    // Don't run this hook if we have pre-selected values
    if (preSelected || !isJoinProduction) return;

    if (!production) {
      reset({
        lineId: "",
      });

      return;
    }

    const lineId = production.lines[0]?.id?.toString() || undefined;

    reset({
      lineId,
    });
  }, [preSelected, production, reset, isJoinProduction]);

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

  // If the device no longer exists set field values to default
  useEffect(() => {
    if (!devices.input?.length) {
      setValue("audioinput", "no-device", { shouldValidate: true });
    }
  }, [devices, setValue]);

  // If user selects a production from the productionlist
  useEffect(() => {
    if (selectedProductionId && isJoinProduction) {
      reset({
        productionId: `${selectedProductionId}`,
      });
    }
  }, [reset, selectedProductionId, isJoinProduction]);

  useSubmitOnEnter<FormValues | TUserSettings>({
    handleSubmit,
    submitHandler: onSubmit,
    needsConfirmation,
    shouldSubmitOnEnter: true,
    isBrowserFirefox,
    setConfirmModalOpen,
  });

  return (
    <div style={{ minWidth: updateUserSettings ? "40rem" : "" }}>
      {!preSelected && isJoinProduction && (
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
            {productions &&
              productions.productions.map((p) => (
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
      {!preSelected && isJoinProduction && (
        <FormItem label="Line">
          <FormSelect
            // eslint-disable-next-line
            {...register(`lineId`, {
              required: "Line id is required",
              minLength: 1,
              onChange: (e) => {
                const selectedLine = production?.lines.find(
                  (line) => line.id.toString() === e.target.value
                );
                setIsProgramOutputLine(!!selectedLine?.programOutputLine);
              },
            })}
            style={{
              display: production ? "block" : "none",
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
        </FormItem>
      )}
      <FormItem label="Username" fieldName="username" errors={errors}>
        <FormInput
          // eslint-disable-next-line
          {...register(`username`, {
            required: "Username is required",
            minLength: 1,
          })}
          placeholder="Username"
        />
      </FormItem>
      {(isFirstConnection || isSupportedBrowser || isSettingsConfig) && (
        <>
          <DevicesSection>
            <SectionTitle>
              {isBrowserSafari ? "Device" : "Devices"}
            </SectionTitle>
            {isBrowserFirefox && <FirefoxWarning type="firefox-warning" />}
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
        <>
          <p>
            This is a line for audio feed. Do you wish to join the line as the
            audio feed or as a listener?
          </p>
          {setIsProgramUser && (
            <CheckboxWrapper>
              <Checkbox
                label="Listener"
                checked={!isProgramUser}
                onChange={() => setIsProgramUser(false)}
              />
              <Checkbox
                label="Audio feed"
                checked={isProgramUser}
                onChange={() => setIsProgramUser(true)}
              />
            </CheckboxWrapper>
          )}
        </>
      )}
      <ButtonWrapper>
        {(isFirstConnection || isSupportedBrowser || isSettingsConfig) && (
          <ReloadDevicesButton />
        )}
        <SubmitButton
          type="button"
          disabled={isJoinProduction ? !isValid : false}
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
          confirmationText="This will update the devices for all current calls."
          onConfirm={handleSubmit(onSubmit)}
          onCancel={() => setConfirmModalOpen(false)}
          shouldSubmitOnEnter
        />
      )}
    </div>
  );
};
