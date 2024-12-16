import { Dispatch, useEffect } from "react";
import { TGlobalStateAction } from "../global-state/global-state-actions";

type TUseLocalUserSettings = {
  dispatch: Dispatch<TGlobalStateAction>;
};

export const useLocalUserSettings = ({ dispatch }: TUseLocalUserSettings) => {
  // TODO check if device still exists
  useEffect(() => {
    const payload = {
      username: window.localStorage.getItem("username") || "",
      audioinput: window.localStorage.getItem("audioinput") || undefined,
      audiooutput: window.localStorage.getItem("audiooutput") || undefined,
    };
    dispatch({
      type: "UPDATE_USER_SETTINGS",
      payload,
    });
  }, [dispatch]);
};
