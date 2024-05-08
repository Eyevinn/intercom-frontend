import { useEffect, useState } from "react";

type TProps = {
  connectionState: string | null;
};

export const useIsLoading = ({ connectionState }: TProps) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [connectionError, setConnectionError] = useState<boolean>(false);

  useEffect(() => {
    if (connectionState === "connected") {
      setLoading(false);
    } else if (connectionState === "failed") {
      setConnectionError(true);
    }
  }, [connectionState]);

  return {
    loading,
    connectionError,
  };
};
