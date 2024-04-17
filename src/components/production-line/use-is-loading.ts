import { useEffect, useState } from "react";

type TProps = {
  connectionState: string | null;
};

export const useIsLoading = ({ connectionState }: TProps) => {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (connectionState === "connected") {
      setLoading(false);
    }
    // TODO add handling for `connectionState === "failed"`
  }, [connectionState]);

  return loading;
};
