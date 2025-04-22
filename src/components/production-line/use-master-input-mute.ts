import { useEffect, useRef } from "react";
import { TGlobalStateAction } from "../../global-state/global-state-actions";
import { CallData } from "../../hooks/use-call-list";

interface UseMasterInputMuteProps {
  inputAudioStream: MediaStream | "no-device" | null;
  isProgramOutputLine: boolean | null | undefined;
  masterInputMute: boolean;
  dispatch: React.Dispatch<TGlobalStateAction>;
  id: string;
  muteInput: (mute: boolean) => void;
  registerCallList?: (
    callId: string,
    data: CallData,
    isGlobalMute?: boolean
  ) => void;
  isSettingGlobalMute?: boolean;
  isOutputMuted: boolean;
  value: number;
  lineId?: string;
  lineName?: string;
  productionId?: string;
  productionName?: string;
  isProgramUser?: boolean | null | undefined;
}

export const useMasterInputMute = ({
  inputAudioStream,
  isProgramOutputLine,
  masterInputMute,
  dispatch,
  id,
  muteInput,
  registerCallList,
  isSettingGlobalMute,
  isOutputMuted,
  value,
  lineId,
  lineName,
  productionId,
  productionName,
  isProgramUser,
}: UseMasterInputMuteProps) => {
  const lastMutedRef = useRef<boolean | null>(null);
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    const alreadySet = lastMutedRef.current === masterInputMute;

    if (
      inputAudioStream &&
      inputAudioStream !== "no-device" &&
      !isProgramOutputLine &&
      !alreadySet
    ) {
      lastMutedRef.current = masterInputMute;

      inputAudioStream.getTracks().forEach((t) => {
        // eslint-disable-next-line no-param-reassign
        t.enabled = !masterInputMute;
      });

      muteInput(masterInputMute);

      registerCallList?.(
        id,
        {
          isInputMuted: masterInputMute,
          isOutputMuted,
          volume: value,
          lineId: lineId || "",
          lineName: lineName || "",
          productionId: productionId || "",
          productionName: productionName || "",
          isProgramOutputLine: isProgramOutputLine || false,
          isProgramUser: isProgramUser || false,
        },
        isSettingGlobalMute
      );

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
    }
  }, [
    inputAudioStream,
    isProgramOutputLine,
    masterInputMute,
    muteInput,
    id,
    registerCallList,
    isSettingGlobalMute,
    dispatch,
  ]);
};
