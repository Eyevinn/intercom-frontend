import { useEffect, useState } from "react";

type TUseRefreshAnimationOptions = {
  reloadProductionList: boolean;
};

export const useRefreshAnimation = ({
  reloadProductionList,
}: TUseRefreshAnimationOptions) => {
  const [showRefreshing, setShowRefreshing] = useState(true);

  useEffect(() => {
    let timeout: number | null = null;

    if (showRefreshing) {
      timeout = window.setTimeout(() => {
        setShowRefreshing(false);
      }, 1500);
    }

    return () => {
      if (timeout !== null) {
        window.clearTimeout(timeout);
      }
    };
  }, [showRefreshing]);

  useEffect(() => {
    if (reloadProductionList) {
      setShowRefreshing(true);
    }
  }, [reloadProductionList]);

  return showRefreshing;
};
