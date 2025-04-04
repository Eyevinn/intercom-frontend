import { SubmitHandler, useForm, useWatch } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import { useEffect, useState } from "react";
import styled from "@emotion/styled";
import {
  DecorativeLabel,
  FormLabel,
  FormInput,
  FormSelect,
  PrimaryButton,
  StyledWarningMessage,
} from "./form-elements.tsx";
import { useGlobalState } from "../../global-state/context-provider.tsx";
import { useFetchProduction } from "./use-fetch-production.ts";
import { darkText, errorColour } from "../../css-helpers/defaults.ts";
import { TJoinProductionOptions } from "../production-line/types.ts";
import { FormInputWithLoader } from "./form-input-with-loader.tsx";
import { useStorage } from "../accessing-local-storage/access-local-storage.ts";
import { useNavigateToProduction } from "./use-navigate-to-production.ts";
import { ReloadDevicesButton } from "../reload-devices-button.tsx/reload-devices-button.tsx";
import {
  ButtonWrapper,
  ResponsiveFormContainer,
} from "../user-settings/user-settings.tsx";
import { isBrowserSafari, isMobile } from "../../bowser.ts";
import { Checkbox } from "../checkbox/checkbox.tsx";
import { TUserSettings } from "../user-settings/types.ts";
import { RemoveIcon } from "../../assets/icons/icon.tsx";
import { useFetchDevices } from "../../hooks/use-fetch-devices.ts";
import { useDevicePermissions } from "../../hooks/use-device-permission.ts";

type FormValues = TJoinProductionOptions & {
  audiooutput: string;
};

const NameWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 2rem;
`;

const ProductionName = styled.p`
  margin-bottom: 1rem;

  &.name {
    font-weight: bold;
    min-height: 1.5rem;
    margin: 0 0 0 0.5rem;
  }
`;

const FetchErrorMessage = styled.div`
  background: ${errorColour};
  color: ${darkText};
  padding: 0.5rem;
  margin: 0 0 2rem;
  border-radius: 0.5rem;
`;

const CheckboxWrapper = styled.div`
  display: flex;
  flex-direction: row;
  margin-bottom: 3rem;
  margin-top: 1rem;
`;

const HeaderWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
`;

const HeaderText = styled.div`
  font-size: 3rem;
  font-weight: bold;
  line-height: 1;
`;

const HeaderExitButton = styled.div`
  &:hover {
    cursor: pointer;
  }

  svg {
    fill: #f96c6c;
    width: 3rem;
    height: 3rem;
  }
`;

type TProps = {
  preSelected?: {
    preSelectedProductionId: string;
    preSelectedLineId: string;
  };
  customGlobalMute: string;
  addAdditionalCallId?: string;
  closeAddCallView?: () => void;
  className?: string;
  updateUserSettings?: boolean;
};

export const JoinProduction = ({
  preSelected,
  customGlobalMute,
  addAdditionalCallId,
  closeAddCallView,
  className,
  updateUserSettings = false,
}: TProps) => {
  const [joinProductionId, setJoinProductionId] = useState<null | number>(null);
  const [joinProductionOptions, setJoinProductionOptions] =
    useState<TJoinProductionOptions | null>(null);
  const [isProgramUser, setIsProgramUser] = useState(false);
  const [isProgramOutputLine, setIsProgramOutputLine] = useState(false);
  const [{ devices, userSettings, selectedProductionId }, dispatch] =
    useGlobalState();
  const { writeToStorage } = useStorage();

  const {
    formState: { errors, isValid },
    register,
    handleSubmit,
    reset,
    setValue,
    control,
  } = useForm<FormValues>({
    defaultValues: {
      productionId:
        preSelected?.preSelectedProductionId || addAdditionalCallId || "",
      lineId: preSelected?.preSelectedLineId || undefined,
      username: userSettings?.username,
      audioinput: userSettings?.audioinput,
      audiooutput: userSettings?.audiooutput,
      lineUsedForProgramOutput: false,
    },
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

  useNavigateToProduction(joinProductionOptions);

  const { permission } = useDevicePermissions({
    continueToApp: true,
  });

  const [getUpdatedDevices] = useFetchDevices({
    dispatch,
    permission,
  });

  // this will update whenever lineId changes
  const selectedLineId = useWatch({ name: "lineId", control });

  useEffect(() => {
    if (production) {
      const selectedLine = production.lines.find(
        (line) => line.id.toString() === selectedLineId
      );
      setIsProgramOutputLine(!!selectedLine?.programOutputLine);
    }
  }, [production, selectedLineId]);

  // Update selected line id when a new production is fetched
  useEffect(() => {
    // Don't run this hook if we have pre-selected values
    if (preSelected) return;

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
  }, [preSelected, production, reset]);

  useEffect(() => {
    if (addAdditionalCallId) {
      setValue("productionId", addAdditionalCallId);
    }
  }, [addAdditionalCallId, setValue]);

  // If the device no longer exists set field values to default
  useEffect(() => {
    if (!devices.input?.length) {
      setValue("audioinput", "no-device", { shouldValidate: true });
    }
  }, [devices, setValue]);

  // If user selects a production from the productionlist
  useEffect(() => {
    if (selectedProductionId) {
      reset({
        productionId: `${selectedProductionId}`,
      });
      setJoinProductionId(parseInt(selectedProductionId, 10));
    }
  }, [reset, selectedProductionId]);

  const { onChange, onBlur, name, ref } = register("productionId", {
    required: "Production ID is required",
    min: 1,
  });

  const onSubmit: SubmitHandler<FormValues> = async (payload) => {
    // Wait for devices to refresh and get the updated devices
    const updatedDevices = await getUpdatedDevices();

    const inputDeviceExists = updatedDevices.input.some(
      (device) => device.deviceId === payload.audioinput
    );

    const outputDeviceExists = updatedDevices.output.some(
      (device) => device.deviceId === payload.audiooutput
    );

    if (!inputDeviceExists || (!outputDeviceExists && !isBrowserSafari)) {
      dispatch({
        type: "ERROR",
        payload: {
          error: new Error("Selected devices are not available"),
        },
      });
    } else {
      const selectedLine = production?.lines.find(
        (line) => line.id === payload.lineId
      );

      const options: TJoinProductionOptions = {
        ...payload,
        lineUsedForProgramOutput: selectedLine?.programOutputLine || false,
        isProgramUser,
      };

      if (updateUserSettings) {
        const newUserSettings: TUserSettings = {
          username: payload.username,
          audioinput: payload.audioinput,
          audiooutput: payload.audiooutput,
        };

        if (payload.username) {
          writeToStorage("username", payload.username);
        }

        if (payload.audioinput) {
          writeToStorage("audioinput", payload.audioinput);
        }

        if (payload.audiooutput) {
          writeToStorage("audiooutput", payload.audiooutput);
        }

        dispatch({
          type: "UPDATE_USER_SETTINGS",
          payload: newUserSettings,
        });
      }

      if (closeAddCallView) {
        closeAddCallView();
      }

      dispatch({
        type: "SELECT_PRODUCTION_ID",
        payload: payload.productionId,
      });

      const uuid = globalThis.crypto.randomUUID();

      dispatch({
        type: "ADD_CALL",
        payload: {
          id: uuid,
          callState: {
            joinProductionOptions: {
              productionId: options.productionId,
              lineId: options.lineId,
              username: options.username,
              audioinput: options.audioinput,
              lineUsedForProgramOutput: options.lineUsedForProgramOutput,
              isProgramUser: options.isProgramUser,
            },
            audiooutput: payload.audiooutput,
            mediaStreamInput: null,
            dominantSpeaker: null,
            audioLevelAboveThreshold: false,
            connectionState: null,
            audioElements: null,
            sessionId: null,
            dataChannel: null,
            isRemotelyMuted: false,
            hotkeys: {
              muteHotkey: "m",
              speakerHotkey: "n",
              pushToTalkHotkey: "t",
              increaseVolumeHotkey: "u",
              decreaseVolumeHotkey: "d",
              globalMuteHotkey: customGlobalMute,
            },
          },
        },
      });
      setJoinProductionOptions(options);
    }
  };

  return (
    <ResponsiveFormContainer
      className={`${isMobile ? "" : "desktop"} ${className}`}
    >
      <HeaderWrapper>
        <HeaderText>Join Production</HeaderText>
        {closeAddCallView && (
          <HeaderExitButton onClick={() => closeAddCallView()}>
            <RemoveIcon />
          </HeaderExitButton>
        )}
      </HeaderWrapper>
      {devices && (
        <>
          {!preSelected && (
            <>
              <NameWrapper>
                <ProductionName>Production name</ProductionName>
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
              <ErrorMessage
                errors={errors}
                name="productionId"
                as={StyledWarningMessage}
              />
            </>
          )}
          <FormLabel>
            <DecorativeLabel>Username</DecorativeLabel>
            <FormInput
              // eslint-disable-next-line
              {...register(`username`, {
                required: "Username is required",
                minLength: 1,
              })}
              placeholder="Username"
            />
          </FormLabel>
          <ErrorMessage
            errors={errors}
            name="username"
            as={StyledWarningMessage}
          />
          <FormLabel>
            <DecorativeLabel>Input</DecorativeLabel>
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
          </FormLabel>
          <FormLabel>
            <DecorativeLabel>Output</DecorativeLabel>
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
          </FormLabel>
          {!preSelected && (
            <FormLabel>
              <DecorativeLabel>Line</DecorativeLabel>

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
            </FormLabel>
          )}
          {isProgramOutputLine && (
            <>
              <p>
                This is a line for audio feed. Do you wish to join the line as
                the audio feed or as a listener?
              </p>
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
            </>
          )}
          <ButtonWrapper>
            <ReloadDevicesButton />
            <PrimaryButton
              type="submit"
              disabled={!isValid}
              onClick={handleSubmit(onSubmit)}
            >
              Join
            </PrimaryButton>
          </ButtonWrapper>
        </>
      )}
    </ResponsiveFormContainer>
  );
};
