import { SubmitHandler, useForm } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import { useEffect, useState } from "react";
import styled from "@emotion/styled";
import { DisplayContainerHeader } from "./display-container-header.tsx";
import {
  DecorativeLabel,
  FormLabel,
  FormContainer,
  FormInput,
  FormSelect,
  PrimaryButton,
  StyledWarningMessage,
} from "./form-elements.tsx";
import { useGlobalState } from "../../global-state/context-provider.tsx";
import { useFetchProduction } from "./use-fetch-production.ts";
import { darkText, errorColour } from "../../css-helpers/defaults.ts";
import { TJoinProductionOptions } from "../production-line/types.ts";
import { uniqBy } from "../../helpers.ts";
import { FormInputWithLoader } from "./form-input-with-loader.tsx";
import { useStorage } from "../accessing-local-storage/access-local-storage.ts";
import { useNavigateToProduction } from "./use-navigate-to-production.ts";
import { useFetchDevices } from "../../use-fetch-devices.ts";
import { useDevicePermissions } from "../../use-device-permission.ts";
import { Modal } from "../modal/modal.tsx";
import { ReloadDevicesButton } from "../reload-devices-button.tsx/reload-devices-button.tsx";

type FormValues = TJoinProductionOptions;

const FetchErrorMessage = styled.div`
  background: ${errorColour};
  color: ${darkText};
  padding: 0.5rem;
  margin: 0 0 2rem;
  border-radius: 0.5rem;
`;

const ButtonWrapper = styled.div`
  margin: 2rem 0 2rem 0;
`;

const FormWithBtn = styled.div`
  display: flex;
  justify-content: space-between;
`;

type TProps = {
  preSelected?: {
    preSelectedProductionId: string;
    preSelectedLineId: string;
  };
  addAdditionalCallId?: string;
  closeAddCallView?: () => void;
};

export const JoinProduction = ({
  preSelected,
  addAdditionalCallId,
  closeAddCallView,
}: TProps) => {
  const [joinProductionId, setJoinProductionId] = useState<null | number>(null);
  const [joinProductionOptions, setJoinProductionOptions] =
    useState<TJoinProductionOptions | null>(null);
  const { readFromStorage, writeToStorage } = useStorage("username");
  const [refresh, setRefresh] = useState<number>(0);
  const [firefoxWarningModalOpen, setFirefoxWarningModalOpen] = useState(false);

  const {
    formState: { errors, isValid },
    register,
    handleSubmit,
    reset,
    setValue,
  } = useForm<FormValues>({
    defaultValues: {
      productionId:
        preSelected?.preSelectedProductionId || addAdditionalCallId || "",
      lineId: preSelected?.preSelectedLineId || undefined,
      username: readFromStorage() || "",
    },
    resetOptions: {
      keepDirtyValues: true, // user-interacted input will be retained
      keepErrors: true, // input errors will be retained with value update
    },
  });
  const { permission } = useDevicePermissions({
    continueToApp: true,
  });

  const [{ devices, selectedProductionId }, dispatch] = useGlobalState();

  useFetchDevices({
    dispatch,
    permission,
    refresh,
  });

  const {
    error: productionFetchError,
    production,
    loading,
  } = useFetchProduction(joinProductionId);

  useNavigateToProduction(joinProductionOptions);

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

  // Use local cache
  useEffect(() => {
    const cachedUsername = readFromStorage();
    if (cachedUsername) {
      setValue("username", cachedUsername);
    }

    if (addAdditionalCallId) {
      setValue("productionId", addAdditionalCallId);
    }
  }, [addAdditionalCallId, readFromStorage, setValue]);

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

  const onSubmit: SubmitHandler<FormValues> = (payload) => {
    if (payload.username) {
      writeToStorage(payload.username);
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
          devices: null,
          joinProductionOptions: payload,
          mediaStreamInput: null,
          dominantSpeaker: null,
          audioLevelAboveThreshold: false,
          connectionState: null,
          audioElements: null,
          sessionId: null,
        },
      },
    });
    setJoinProductionOptions(payload);
    // TODO remove
    console.log("PAYLOAD: ", payload);
  };

  const outputDevices = devices
    ? uniqBy(
        devices.filter((d) => d.kind === "audiooutput"),
        (item) => item.deviceId
      )
    : [];

  const inputDevices = devices
    ? uniqBy(
        devices.filter((d) => d.kind === "audioinput"),
        (item) => item.deviceId
      )
    : [];

  return (
    <FormContainer>
      <DisplayContainerHeader>Join Production</DisplayContainerHeader>
      {devices && (
        <>
          {!preSelected && (
            <>
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
            <FormWithBtn>
              <FormSelect
                // eslint-disable-next-line
                {...register(`audioinput`)}
              >
                {inputDevices.length > 0 ? (
                  inputDevices.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label}
                    </option>
                  ))
                ) : (
                  <option value="no-device">No device available</option>
                )}
              </FormSelect>
              <ReloadDevicesButton
                handleReloadDevices={() => setRefresh((prev) => prev + 1)}
                devices={devices}
                isDummy
              />
            </FormWithBtn>
          </FormLabel>
          <FormLabel>
            <DecorativeLabel>Output</DecorativeLabel>
            <FormWithBtn>
              {outputDevices.length > 0 ? (
                <FormSelect
                  // eslint-disable-next-line
                  {...register(`audiooutput`)}
                >
                  {outputDevices.map((device) => (
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
              <ReloadDevicesButton
                handleReloadDevices={() => setRefresh((prev) => prev + 1)}
                setFirefoxWarningModalOpen={() =>
                  setFirefoxWarningModalOpen(true)
                }
                devices={devices}
              />
            </FormWithBtn>
            {firefoxWarningModalOpen && (
              <Modal onClose={() => setFirefoxWarningModalOpen(false)}>
                <DisplayContainerHeader>
                  Reset permissions
                </DisplayContainerHeader>
                <p>
                  To reload devices Firefox needs the permission to be manually
                  reset, please remove permission and reload page instead.
                </p>
              </Modal>
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
          <ButtonWrapper>
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
    </FormContainer>
  );
};
