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
      // A successful (re)connection clears any earlier failure so the call UI
      // is shown again after an auto-rejoin instead of staying blank.
      setConnectionError(false);
    } else if (connectionState === null) {
      // Null marks the start of a rejoin (the connection is being torn down and
      // remounted); clear the stale error so the fresh attempt is not treated
      // as permanently failed.
      setConnectionError(false);
    } else if (connectionState === "failed") {
      setConnectionError(true);
    }
  }, [connectionState]);

  return {
    loading,
    connectionError,
  };
};
