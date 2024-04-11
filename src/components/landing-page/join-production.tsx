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
  ActionButton,
  StyledWarningMessage,
} from "./form-elements.tsx";
import { useGlobalState } from "../../global-state/context-provider.tsx";
import { useFetchProduction } from "./use-fetch-production.ts";
import { darkText, errorColour } from "../../css-helpers/defaults.ts";
import { TJoinProductionOptions } from "../production-line/types.ts";

type FormValues = TJoinProductionOptions;

const FetchErrorMessage = styled.div`
  background: ${errorColour};
  color: ${darkText};
  padding: 0.5rem;
  margin: 1rem 0;
`;

export const JoinProduction = () => {
  const [joinProductionId, setJoinProductionId] = useState<null | number>(null);
  const {
    formState: { errors },
    register,
    handleSubmit,
    reset,
  } = useForm<FormValues>({
    defaultValues: {
      productionId: "",
    },
    resetOptions: {
      keepDirtyValues: true, // user-interacted input will be retained
      keepErrors: true, // input errors will be retained with value update
    },
  });

  const [{ devices }, dispatch] = useGlobalState();

  const { error: productionFetchError, production } =
    useFetchProduction(joinProductionId);

  // Update selected line id when a new production is fetched
  useEffect(() => {
    if (!production) return;

    const lineId = production.lines[0]?.id?.toString() || "";

    reset({
      lineId,
    });
  }, [production, reset]);

  const { onChange, onBlur, name, ref } = register("productionId", {
    required: "Production ID is required",
    min: 1,
  });

  const onSubmit: SubmitHandler<FormValues> = (payload) => {
    dispatch({
      type: "UPDATE_JOIN_PRODUCTION_OPTIONS",
      payload,
    });
    // TODO remove
    console.log(payload);
  };

  const outputDevices = devices
    ? devices.filter((d) => d.kind === "audiooutput")
    : [];

  const inputDevices = devices
    ? devices.filter((d) => d.kind === "audioinput")
    : [];

  return (
    <FormContainer>
      <DisplayContainerHeader>Join Production</DisplayContainerHeader>
      {devices && (
        <>
          <FormLabel>
            <DecorativeLabel>Production ID</DecorativeLabel>
            <FormInput
              onChange={(ev) => {
                onChange(ev);

                const pid = parseInt(ev.target.value, 10);

                setJoinProductionId(Number.isNaN(pid) ? null : pid);
              }}
              name={name}
              ref={ref}
              onBlur={onBlur}
              type="number"
              placeholder="Production ID"
            />
          </FormLabel>
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
          </FormLabel>

          <FormLabel>
            <DecorativeLabel>Output</DecorativeLabel>
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
          </FormLabel>

          <FormLabel>
            <DecorativeLabel>Line</DecorativeLabel>
            {production ? (
              <FormSelect
                // eslint-disable-next-line
                {...register(`lineId`)}
              >
                {production &&
                  production.lines.map((line) => (
                    <option key={line.id} value={line.id}>
                      {line.name || line.id}
                    </option>
                  ))}
              </FormSelect>
            ) : (
              <StyledWarningMessage>
                Please enter a production id
              </StyledWarningMessage>
            )}
          </FormLabel>

          <ActionButton type="submit" onClick={handleSubmit(onSubmit)}>
            Join
          </ActionButton>
        </>
      )}
    </FormContainer>
  );
};
