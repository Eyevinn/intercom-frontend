import { FC } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import styled from "@emotion/styled";
import { useGlobalState } from "../../global-state/context-provider";
import { uniqBy } from "../../helpers";
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

type FormValues = TUserSettings;

export const ResponsiveFormContainer = styled(FormContainer)`
  padding: 0 2rem;

  &.desktop {
    margin: auto;
    margin-top: 15rem;
    width: 50rem;
  }
`;

const ButtonWrapper = styled.div`
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

  const {
    formState: { errors },
    register,
    handleSubmit,
  } = useForm<FormValues>({
    defaultValues: {
      username: userSettings?.username,
      audioinput: userSettings?.audioinput,
      audiooutput: userSettings?.audiooutput,
    },
    resetOptions: {
      keepDirtyValues: true, // user-interacted input will be retained
      keepErrors: true, // input errors will be retained with value update
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (payload) => {
    if (payload.username) {
      window.localStorage?.setItem("username", payload.username);
    }

    if (payload.audioinput) {
      window.localStorage?.setItem("audioinput", payload.audioinput);
    }

    if (payload.audiooutput) {
      window.localStorage?.setItem("audiooutput", payload.audiooutput);
    }

    dispatch({
      type: "UPDATE_USER_SETTINGS",
      payload,
    });
    if (onSave) onSave();
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
          <ButtonWrapper>
            <PrimaryButton type="submit" onClick={handleSubmit(onSubmit)}>
              {buttonText || "Save"}
            </PrimaryButton>
          </ButtonWrapper>
        </>
      )}
    </ResponsiveFormContainer>
  );
};
