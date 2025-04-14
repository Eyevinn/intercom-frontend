import { useEffect } from "react";
import { TGlobalStateAction } from "../../global-state/global-state-actions";

interface UseMasterInputMuteProps {
  inputAudioStream: MediaStream | "no-device" | null;
  isProgramOutputLine: boolean | null | undefined;
  masterInputMute: boolean;
  dispatch: React.Dispatch<TGlobalStateAction>;
  id: string;
  muteInput: (mute: boolean) => void;
  registerCallState?: (
    callId: string,
    data: {
      isInputMuted: boolean;
      isOutputMuted: boolean;
      volume: number;
      lineId: string;
      lineName: string;
      productionId: string;
      productionName: string;
    },
    isGlobalMute?: boolean
  ) => void;
  isSettingGlobalMute?: boolean;
  isOutputMuted: boolean;
  value: number;
  lineId?: string;
  lineName?: string;
  productionId?: string;
  productionName?: string;
}

export const useMasterInputMute = ({
  inputAudioStream,
  isProgramOutputLine,
  masterInputMute,
  dispatch,
  id,
  muteInput,
  registerCallState,
  isSettingGlobalMute,
  isOutputMuted,
  value,
  lineId,
  lineName,
  productionId,
  productionName,
}: UseMasterInputMuteProps) => {
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (
      inputAudioStream &&
      inputAudioStream !== "no-device" &&
      !isProgramOutputLine
    ) {
      inputAudioStream.getTracks().forEach((t) => {
        // eslint-disable-next-line no-param-reassign
        t.enabled = !masterInputMute;
      });

      muteInput(masterInputMute);

      registerCallState?.(
        id,
        {
          isInputMuted: masterInputMute,
          isOutputMuted,
          volume: value,
          lineId: lineId || "",
          lineName: lineName || "",
          productionId: productionId || "",
          productionName: productionName || "",
        },
        isSettingGlobalMute
      );
    }
    if (masterInputMute && !isProgramOutputLine) {
      dispatch({
        type: "UPDATE_CALL",
        payload: {
          id,
          updates: {
            isRemotelyMuted: false,
          },
        },
      });
    }
  }, [
    inputAudioStream,
    isProgramOutputLine,
    masterInputMute,
    muteInput,
    id,
    registerCallState,
    isSettingGlobalMute,
    dispatch,
  ]);
};
