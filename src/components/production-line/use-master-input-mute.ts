import { useEffect, useRef } from "react";
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
  const lastMutedRef = useRef<boolean | null>(null);

  useEffect(() => {
    const shouldMute = masterInputMute;
    const alreadySet = lastMutedRef.current === shouldMute;

    if (
      inputAudioStream &&
      inputAudioStream !== "no-device" &&
      !isProgramOutputLine &&
      !alreadySet
    ) {
      lastMutedRef.current = shouldMute;

      inputAudioStream.getTracks().forEach((t) => {
        // eslint-disable-next-line no-param-reassign
        t.enabled = !shouldMute;
      });

      muteInput(shouldMute);

      registerCallState?.(
        id,
        {
          isInputMuted: shouldMute,
          isOutputMuted,
          volume: value,
          lineId: lineId || "",
          lineName: lineName || "",
          productionId: productionId || "",
          productionName: productionName || "",
        },
        isSettingGlobalMute
      );

      if (shouldMute) {
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
    isOutputMuted,
    value,
    lineId,
    lineName,
    productionId,
    productionName,
  ]);
};
