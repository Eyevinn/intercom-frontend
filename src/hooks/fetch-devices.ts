import { Dispatch, useEffect } from "react";
import { TGlobalStateAction } from "../global-state/global-state-actions.ts";

type TUseFetchDevices = {
  permission: boolean;
  dispatch: Dispatch<TGlobalStateAction>;
};

export const useFetchDevices = ({ permission, dispatch }: TUseFetchDevices) => {
  useEffect(() => {
    if (permission) {
      window.navigator.mediaDevices
        .enumerateDevices()
        .then((payload) => {
          dispatch({
            type: "DEVICES_UPDATED",
            payload,
          });
        })
        .catch((payload) => {
          dispatch({
            type: "ERROR",
            payload,
          });
        });
    }

    return () => {};
  }, [dispatch, permission]);
};
