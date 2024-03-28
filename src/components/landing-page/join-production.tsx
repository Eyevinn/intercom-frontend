import { useForm } from "react-hook-form";
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
  SubmitButton,
} from "./form-elements.tsx";
import { useGlobalState } from "../../global-state/context-provider.tsx";
import { useFetchProduction } from "../../hooks/fetch-production.ts";
import { darkText, errorColour } from "../../css-helpers/defaults.ts";
import { TJoinProductionOptions } from "../production/types.ts";

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
    //    handleSubmit,
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

  const [{ devices }] = useGlobalState();

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
                setJoinProductionId(parseInt(ev.target.value, 10));
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
          <ErrorMessage errors={errors} name="productionId" />

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
          <ErrorMessage errors={errors} name="username" />

          <FormLabel>
            <DecorativeLabel>Input</DecorativeLabel>
            <FormSelect
              // eslint-disable-next-line
              {...register(`audioinput`)}
            >
              {devices
                .filter((d) => d.kind === "audioinput")
                .map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label}
                  </option>
                ))}
            </FormSelect>
          </FormLabel>

          <FormLabel>
            <DecorativeLabel>Output</DecorativeLabel>
            <FormSelect
              // eslint-disable-next-line
              {...register(`audiooutput`)}
            >
              {devices
                .filter((d) => d.kind === "audiooutput")
                .map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label}
                  </option>
                ))}
            </FormSelect>
          </FormLabel>

          <FormLabel>
            <DecorativeLabel>Line</DecorativeLabel>
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
          </FormLabel>

          <SubmitButton type="submit">Join</SubmitButton>
        </>
      )}
    </FormContainer>
  );
};
