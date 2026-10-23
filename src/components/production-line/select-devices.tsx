import { SubmitHandler, useForm, useWatch } from "react-hook-form";
import { useParams } from "react-router";
import { isBrowserFirefox, isMobile, isBrowserSafari } from "../../bowser";
import { useGlobalState } from "../../global-state/context-provider";
import {
  DecorativeLabel,
  FormContainer,
  FormLabel,
  FormSelect,
  PrimaryButton,
  StyledWarningMessage,
} from "../form-elements/form-elements";
import { ReloadDevicesButton } from "../reload-devices-button.tsx/reload-devices-button";
import { DeviceButtonWrapper } from "./production-line-components";
import { TJoinProductionOptions, TLine } from "./types";

type FormValues = TJoinProductionOptions & {
  audiooutput: string;
};

export const SelectDevices = ({
  line,
  joinProductionOptions,
  audiooutput,
  id,
  audioElements,
  resetAudioInput,
  muteInput,
  setConnectionActive,
}: {
  line: TLine | null;
  joinProductionOptions: TJoinProductionOptions;
  audiooutput: string | undefined;
  id: string;
  audioElements: HTMLAudioElement[];
  resetAudioInput: () => void;
  muteInput: () => void;
  setConnectionActive: () => void;
}) => {
  const { productionId: paramProductionId, lineId: paramLineId } = useParams();
  const [{ devices }, dispatch] = useGlobalState();
  const {
    formState: { isValid },
    register,
    handleSubmit,
    control,
  } = useForm<FormValues>({
    defaultValues: {
      username: "",
      audioinput: joinProductionOptions.audioinput,
      audiooutput,
      isProgramUser: joinProductionOptions.isProgramUser,
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
    name: ["audioinput", "audiooutput", "videoinput"],
    control,
  });
  const audioInputTheSame =
    joinProductionOptions?.audioinput === watchedValues[0];
  const audioOutputTheSame = audiooutput === watchedValues[1];
  const videoInputTheSame =
    joinProductionOptions?.videoinput === watchedValues[2];
  const audioNotChanged =
    audioInputTheSame && audioOutputTheSame && videoInputTheSame;

  // Reset connection and re-connect to production-line
  const onSubmit: SubmitHandler<FormValues> = async (payload) => {
    if (joinProductionOptions && audioInputTheSame && !audioOutputTheSame) {
      audioElements.forEach((audioElement) => {
        audioElement.setSinkId(payload.audiooutput || "");
      });
      dispatch({
        type: "UPDATE_CALL",
        payload: {
          id,
          updates: {
            audiooutput: payload.audiooutput,
          },
        },
      });
    } else if (joinProductionOptions && !audioNotChanged) {
      setConnectionActive();
      resetAudioInput();
      muteInput();

      const newJoinProductionOptions = {
        ...joinProductionOptions,
        audioinput: payload.audioinput,
        videoinput: payload.videoinput,
      };

      dispatch({
        type: "UPDATE_CALL",
        payload: {
          id,
          updates: {
            joinProductionOptions: newJoinProductionOptions,
            audiooutput: payload.audiooutput,
            mediaStreamInput: null,
            mediaStreamVideoInput: null,
            dominantSpeaker: null,
            audioLevelAboveThreshold: false,
            connectionState: null,
            audioElements: null,
            videoElements: null,
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
              defaultValue={
                joinProductionOptions.audioinput ??
                devices.input?.find((d) => d.deviceId === "default")
                  ?.deviceId ??
                devices.input?.[0]?.deviceId
              }
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
      {!isBrowserSafari &&
        !(line?.programOutputLine && joinProductionOptions.isProgramUser) && (
          <FormLabel>
            <DecorativeLabel>Output</DecorativeLabel>
            {devices.output && devices.output.length > 0 ? (
              <FormSelect
                // eslint-disable-next-line
                {...register(`audiooutput`)}
                defaultValue={audiooutput || ""}
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
      {line?.videoEnabled && !joinProductionOptions.isProgramUser && (
        <FormLabel>
          <DecorativeLabel>Camera</DecorativeLabel>
          <FormSelect
            // eslint-disable-next-line
            {...register(`videoinput`)}
            defaultValue={joinProductionOptions.videoinput ?? "no-device"}
          >
            <option value="no-device">No camera</option>
            {devices.videoInput && devices.videoInput.length > 0
              ? devices.videoInput.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label}
                  </option>
                ))
              : null}
          </FormSelect>
        </FormLabel>
      )}
      <DeviceButtonWrapper>
        {!(isBrowserFirefox && !isMobile) && <ReloadDevicesButton />}
        <PrimaryButton
          type="submit"
          className="save-button"
          disabled={audioNotChanged || !isValid}
          onClick={handleSubmit(onSubmit)}
        >
          Save
        </PrimaryButton>
      </DeviceButtonWrapper>
    </FormContainer>
  );
};
