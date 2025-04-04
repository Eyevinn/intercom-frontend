import { Dispatch, useEffect, useCallback } from "react";
import { TGlobalStateAction } from "../global-state/global-state-actions";
import { uniqBy } from "../helpers";
import logger from "../utils/logger";

type TUseFetchDevices = {
  permission: boolean;
  dispatch: Dispatch<TGlobalStateAction>;
};

export const useFetchDevices = ({ permission, dispatch }: TUseFetchDevices) => {
  // Create a function that returns a promise
  const getUpdatedDevices = useCallback(async () => {
    if (!permission) {
      return { input: [], output: [] };
    }

    try {
      const devices = await window.navigator.mediaDevices.enumerateDevices();

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

      const result = {
        input: inputDevices,
        output: outputDevices,
      };

      dispatch({
        type: "DEVICES_UPDATED",
        payload: result,
      });

      return result;
    } catch (error) {
      dispatch({
        type: "ERROR",
        payload: {
          error: error as Error,
        },
      });
      throw error;
    }
  }, [dispatch, permission]);

  // Initial fetch on mount or when permission changes
  useEffect(() => {
    getUpdatedDevices().catch(logger.red);
  }, [permission, getUpdatedDevices]);

  return [getUpdatedDevices];
};
