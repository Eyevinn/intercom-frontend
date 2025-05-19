import { useEffect, useRef, useState } from "react";
import { useGlobalState } from "../global-state/context-provider";

type RequestConfig<T, R = void> = {
  params: T | null;
  apiCall: (params: T) => Promise<R>;
  errorMessage: (params: T) => string;
};

export const useRequest = <T, R = void>({
  params,
  apiCall,
  errorMessage,
}: RequestConfig<T, R>) => {
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<R | null>(null);
  const [, dispatch] = useGlobalState();

  const prevParamsRef = useRef<T | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!params || !apiCall) {
      setSuccess(false);
      setLoading(false);
      setData(null);
      return;
    }

    // Shallow equality check to skip unnecessary fetch
    if (JSON.stringify(prevParamsRef.current) === JSON.stringify(params)) {
      return;
    }

    // Cleanup previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    prevParamsRef.current = params;

    setLoading(true);
    setSuccess(false);
    setData(null);

    apiCall(params)
      .then((result) => {
        if (!mountedRef.current) return;
        if (abortControllerRef.current?.signal.aborted) return;

        setSuccess(true);
        setData(result);
      })
      .catch((err) => {
        if (!mountedRef.current) return;
        if (abortControllerRef.current?.signal.aborted) return;

        const error =
          err instanceof Error ? err : new Error(errorMessage(params));
        dispatch({
          type: "ERROR",
          payload: {
            error: {
              ...error,
              message: `${error.message}. ${errorMessage(params)}`,
            },
          },
        });
      })
      .finally(() => {
        if (!mountedRef.current) return;
        if (abortControllerRef.current?.signal.aborted) return;

        setLoading(false);
      });

    // eslint-disable-next-line consistent-return
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [dispatch, params, apiCall, errorMessage]);

  return {
    loading,
    success,
    data,
  };
};
