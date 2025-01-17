import { FC, useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import styled from "@emotion/styled";
import { useGlobalState } from "../../global-state/context-provider";
import { TUserSettings } from "./types";
import {
  DecorativeLabel,
  FormContainer,
  FormInput,
  FormLabel,
  FormSelect,
  PrimaryButton,
  StyledWarningMessage,
} from "../landing-page/form-elements";
import { DisplayContainerHeader } from "../landing-page/display-container-header";
import { isMobile } from "../../bowser";
import { ReloadDevicesButton } from "../reload-devices-button.tsx/reload-devices-button";
import { useStorage } from "../accessing-local-storage/access-local-storage";

export const ResponsiveFormContainer = styled(FormContainer)`
  padding: 0 2rem;

  &.desktop {
    margin: auto;
    margin-top: 15rem;
    width: 50rem;
  }

  &.calls-page {
    margin: 0;
    padding: 2rem;
  }
`;

export const ButtonWrapper = styled.div`
  margin: 2rem 0 2rem 0;
  display: flex;
  justify-content: flex-end;
`;

interface UserSettingsProps {
  buttonText?: string;
  onSave?: () => void;
}

export const UserSettings: FC<UserSettingsProps> = (props) => {
  const { buttonText, onSave } = props;
  const [{ devices, userSettings }, dispatch] = useGlobalState();
  const { writeToStorage } = useStorage();

  const {
    formState: { errors },
    register,
    getValues,
    setValue,
    handleSubmit,
  } = useForm<TUserSettings>({
    defaultValues: {
      username: userSettings?.username,
      audioinput: userSettings?.audioinput || "default",
      audiooutput: userSettings?.audiooutput || "default",
    },
    resetOptions: {
      keepDirtyValues: true, // user-interacted input will be retained
      keepErrors: true, // input errors will be retained with value update
    },
  });

  // If the device no longer exists set field values to default
  useEffect(() => {
    if (!devices.input?.length) {
      setValue("audioinput", "no-device");
    } else if (
      !devices.input?.find(
        (device) => device.deviceId === getValues("audioinput")
      )
    ) {
      setValue("audioinput", "default");
    }
    if (
      !devices.output?.find(
        (device) => device.deviceId === getValues("audiooutput")
      )
    )
      setValue("audiooutput", "default");
  }, [devices, getValues, setValue]);

  const onSubmit: SubmitHandler<TUserSettings> = (payload) => {
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
      payload,
    });
    if (onSave) onSave();
  };

  return (
    <ResponsiveFormContainer className={isMobile ? "" : "desktop"}>
      <DisplayContainerHeader>User Settings</DisplayContainerHeader>
      {devices && (
        <>
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
          <ButtonWrapper>
            <ReloadDevicesButton />
            <PrimaryButton type="submit" onClick={handleSubmit(onSubmit)}>
              {buttonText || "Save"}
            </PrimaryButton>
          </ButtonWrapper>
        </>
      )}
    </ResponsiveFormContainer>
  );
};
