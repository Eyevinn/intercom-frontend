import { useForm, useWatch } from "react-hook-form";
import { useEffect, useState } from "react";
import {
  FormInput,
  FormSelect,
  StyledWarningMessage,
  PrimaryButton,
} from "../landing-page/form-elements";
import { TUserSettings } from "../user-settings/types";
import { TJoinProductionOptions } from "../production-line/types";
import { Checkbox } from "../checkbox/checkbox";
import { FormInputWithLoader } from "../landing-page/form-input-with-loader";
import {
  CheckboxWrapper,
  FetchErrorMessage,
  NameWrapper,
  ProductionName,
} from "../landing-page/join-production-components";
import { ReloadDevicesButton } from "../reload-devices-button.tsx/reload-devices-button";
import { useFetchProduction } from "../landing-page/use-fetch-production";
import { ButtonWrapper } from "../generic-components";
import { useGlobalState } from "../../global-state/context-provider";
import { useSubmitForm } from "./use-submit-form";
import { FormItem } from "./form-item";
import { isBrowserFirefox } from "../../bowser";
import { ConfirmationModal } from "../verify-decision/confirmation-modal";

type FormValues = TJoinProductionOptions & {
  audiooutput: string;
};

export const UserSettingsForm = ({
  isJoinProduction,
  preSelected,
  buttonText,
  addAdditionalCallId,
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
  const [joinProductionId, setJoinProductionId] = useState<null | number>(null);
  const [isProgramOutputLine, setIsProgramOutputLine] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
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

  const {
    error: productionFetchError,
    production,
    loading,
  } = useFetchProduction(joinProductionId);

  // this will update whenever lineId changes
  const selectedLineId = useWatch({ name: "lineId", control });

  const [{ devices, selectedProductionId }] = useGlobalState();

  const { onChange, onBlur, name, ref } = isJoinProduction
    ? register("productionId", {
        required: "Production ID is required",
        min: 1,
      })
    : register("username", {
        required: "Username is required",
        minLength: 1,
      });

  const { onSubmit } = useSubmitForm({
    isJoinProduction,
    production,
    isProgramUser,
    setJoinProductionOptions,
    customGlobalMute,
    closeAddCallView,
    updateUserSettings,
    onSave,
  });

  const isSettingsConfig = !isJoinProduction;
  const isSupportedBrowser = isBrowserFirefox && isJoinProduction;

  useEffect(() => {
    if (production && isJoinProduction) {
      const selectedLine = production.lines.find(
        (line) => line.id.toString() === selectedLineId
      );
      setIsProgramOutputLine(!!selectedLine?.programOutputLine);
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
    if (addAdditionalCallId && isJoinProduction) {
      setValue("productionId", addAdditionalCallId);
    }
  }, [addAdditionalCallId, setValue, isJoinProduction]);

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
      setJoinProductionId(parseInt(selectedProductionId, 10));
    }
  }, [reset, selectedProductionId, isJoinProduction]);

  return (
    <>
      {!preSelected && isJoinProduction && (
        <FormItem fieldName="productionId" errors={errors}>
          <NameWrapper>
            <ProductionName>Production Name</ProductionName>
            <ProductionName className="name">
              {production?.name || "Enter a production ID"}
            </ProductionName>
          </NameWrapper>
          <FormInputWithLoader
            onChange={(ev) => {
              onChange(ev);

              const pid = parseInt(ev.target.value, 10);

              setJoinProductionId(Number.isNaN(pid) ? null : pid);
            }}
            label="Production ID"
            placeholder="Production ID"
            name={name}
            inputRef={ref}
            onBlur={onBlur}
            type="number"
            loading={loading}
          />
          {productionFetchError && (
            <FetchErrorMessage>
              The production ID could not be fetched.{" "}
              {productionFetchError.name} {productionFetchError.message}.
            </FetchErrorMessage>
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
        </>
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
        <ReloadDevicesButton />
        <PrimaryButton
          type="button"
          disabled={isJoinProduction ? !isValid : false}
          onClick={
            !needsConfirmation || isBrowserFirefox
              ? handleSubmit(onSubmit)
              : () => setConfirmModalOpen(true)
          }
        >
          {buttonText}
        </PrimaryButton>
      </ButtonWrapper>

      {confirmModalOpen && (
        <ConfirmationModal
          title="Confirm"
          description="Are you sure you want to update your settings?"
          confirmationText="This will update the devices for all current calls."
          onConfirm={handleSubmit(onSubmit)}
          onCancel={() => setConfirmModalOpen(false)}
        />
      )}
    </>
  );
};
