import { Dispatch, useEffect, useState } from "react";
import { TGlobalStateAction } from "../global-state/global-state-actions";
import { uniqBy } from "../helpers";

type TUseFetchDevices = {
  permission: boolean;
  dispatch: Dispatch<TGlobalStateAction>;
};

export const useFetchDevices = ({ permission, dispatch }: TUseFetchDevices) => {
  const [refreshState, setRefreshState] = useState<boolean>(false);

  const refresh = () => setRefreshState(!refreshState);

  useEffect(() => {
    if (permission) {
      window.navigator.mediaDevices
        .enumerateDevices()
        .then((payload) => {
          const outputDevices = payload
            ? uniqBy(
                payload.filter((d) => d.kind === "audiooutput"),
                (item) => item.deviceId
              )
            : [];

          const inputDevices = payload
            ? uniqBy(
                payload.filter((d) => d.kind === "audioinput"),
                (item) => item.deviceId
              )
            : [];
          dispatch({
            type: "DEVICES_UPDATED",
            payload: {
              input: inputDevices,
              output: outputDevices,
            },
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
  }, [dispatch, permission, refreshState]);

  return [refresh];
};
