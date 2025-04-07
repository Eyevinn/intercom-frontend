import { SubmitHandler } from "react-hook-form";
import { useGlobalState } from "../../global-state/context-provider";
import { useStartConnect } from "../../hooks/use-start-connect";
import { useStorage } from "../accessing-local-storage/access-local-storage";
import { TUserSettings } from "../user-settings/types";
import { TJoinProductionOptions, TProduction } from "../production-line/types";

type FormValues = TJoinProductionOptions & {
  audiooutput: string;
};

export const useSubmitForm = ({
  isJoinProduction,
  production,
  isProgramUser,
  setJoinProductionOptions,
  customGlobalMute,
  closeAddCallView,
  updateUserSettings,
  onSave,
}: {
  isJoinProduction?: boolean;
  production: TProduction | null;
  isProgramUser?: boolean;
  setJoinProductionOptions?: React.Dispatch<
    React.SetStateAction<TJoinProductionOptions | null>
  >;
  customGlobalMute?: string;
  closeAddCallView?: () => void;
  updateUserSettings?: boolean;
  onSave?: () => void;
}) => {
  const [, dispatch] = useGlobalState();
  const { writeToStorage } = useStorage();
  const { startConnect } = useStartConnect({
    dispatch,
  });

  const onSubmit: SubmitHandler<FormValues | TUserSettings> = (payload) => {
    if (isJoinProduction && "lineId" in payload) {
      const selectedLine = production?.lines.find(
        (line) => line.id === payload.lineId
      );

      const options: TJoinProductionOptions = {
        ...payload,
        lineUsedForProgramOutput: selectedLine?.programOutputLine || false,
        isProgramUser: isProgramUser || false,
      };

      const callPayload = {
        joinProductionOptions: options,
        audiooutput: payload.audiooutput,
      };

      startConnect({
        payload: callPayload,
        customGlobalMute,
      });

      if (closeAddCallView) {
        closeAddCallView();
      }

      setJoinProductionOptions?.(options);
    }

    if (updateUserSettings || !isJoinProduction) {
      const newUserSettings: TUserSettings = {
        username: payload.username,
        audioinput: payload.audioinput,
        audiooutput: payload.audiooutput,
      };

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
        payload: isJoinProduction ? newUserSettings : payload,
      });
    }

    if (onSave) onSave();
  };

  return { onSubmit };
};
