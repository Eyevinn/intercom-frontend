import { useForm, SubmitHandler, useWatch } from "react-hook-form";
import { useParams } from "react-router-dom";
import { isBrowserFirefox, isMobile } from "../../bowser";
import {
  FormContainer,
  FormLabel,
  DecorativeLabel,
  FormSelect,
  StyledWarningMessage,
  PrimaryButton,
} from "../landing-page/form-elements";
import { ReloadDevicesButton } from "../reload-devices-button.tsx/reload-devices-button";
import { DeviceButtonWrapper } from "./production-line-components";
import { TLine, TJoinProductionOptions } from "./types";
import { useGlobalState } from "../../global-state/context-provider";

type FormValues = TJoinProductionOptions;

export const SelectDevices = ({
  line,
  joinProductionOptions,
  id,
  resetAudioInput,
  muteInput,
  setConnectionActive,
}: {
  line: TLine | null;
  joinProductionOptions: TJoinProductionOptions;
  id: string;
  resetAudioInput: () => void;
  muteInput: () => void;
  setConnectionActive: () => void;
}) => {
  const { productionId: paramProductionId, lineId: paramLineId } = useParams();
  const [{ devices, userSettings }, dispatch] = useGlobalState();
  const {
    formState: { isValid, isDirty },
    register,
    handleSubmit,
    control,
  } = useForm<FormValues>({
    defaultValues: {
      username: "",
      audioinput: userSettings?.audioinput,
      audiooutput: userSettings?.audiooutput,
      productionId: paramProductionId || "",
      lineId: paramLineId || undefined,
    },
    resetOptions: {
      keepDirtyValues: true, // user-interacted input will be retained
      keepErrors: true, // input errors will be retained with value update
    },
  });

  // Watch all form values
  const watchedValues = useWatch({
    name: ["audioinput", "audiooutput"],
    control,
  });
  const audioInputTheSame =
    joinProductionOptions?.audioinput === watchedValues[0];
  const audioOutputTheSame =
    joinProductionOptions?.audiooutput === watchedValues[1];
  const audioNotChanged = audioInputTheSame && audioOutputTheSame;

  // Reset connection and re-connect to production-line
  const onSubmit: SubmitHandler<FormValues> = async (payload) => {
    if (joinProductionOptions && !audioNotChanged) {
      setConnectionActive();
      resetAudioInput();
      muteInput();

      const newJoinProductionOptions = {
        ...payload,
        productionId: joinProductionOptions.productionId,
        lineId: joinProductionOptions.lineId,
        username: joinProductionOptions.username,
      };

      dispatch({
        type: "UPDATE_CALL",
        payload: {
          id,
          updates: {
            joinProductionOptions: newJoinProductionOptions,
            mediaStreamInput: null,
            dominantSpeaker: null,
            audioLevelAboveThreshold: false,
            connectionState: null,
            audioElements: null,
            sessionId: null,
          },
        },
      });
    }
  };
  return (
    <FormContainer>
      {devices &&
        (line?.programOutputLine
          ? joinProductionOptions.isProgramUser
          : !joinProductionOptions.isProgramUser) && (
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
        )}
      {!(line?.programOutputLine && joinProductionOptions.isProgramUser) && (
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
      )}
      {isBrowserFirefox && !isMobile && (
        <StyledWarningMessage>
          If a new device has been added Firefox needs the permission to be
          manually reset. If your device is missing, please remove the
          permission and reload page.
        </StyledWarningMessage>
      )}
      <DeviceButtonWrapper>
        {!(isBrowserFirefox && !isMobile) && <ReloadDevicesButton />}
        <PrimaryButton
          type="submit"
          className="save-button"
          disabled={audioNotChanged || !isValid || !isDirty}
          onClick={handleSubmit(onSubmit)}
        >
          Save
        </PrimaryButton>
      </DeviceButtonWrapper>
    </FormContainer>
  );
};
