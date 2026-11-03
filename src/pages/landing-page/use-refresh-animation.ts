import { useEffect, useState } from "react";

type TUseRefreshAnimationOptions = {
  reloadProductionList?: boolean;
  doInitialLoad: boolean;
};

export const useRefreshAnimation = ({
  reloadProductionList,
  doInitialLoad,
}: TUseRefreshAnimationOptions) => {
  const [showRefreshing, setShowRefreshing] = useState(true);

  useEffect(() => {
    let timeout: number | null = null;

    if (showRefreshing || doInitialLoad) {
      timeout = window.setTimeout(() => {
        setShowRefreshing(false);
      }, 1500);
    }

    return () => {
      if (timeout !== null) {
        window.clearTimeout(timeout);
      }
    };
  }, [showRefreshing, doInitialLoad]);

  useEffect(() => {
    if (reloadProductionList) {
      setShowRefreshing(true);
    }
  }, [reloadProductionList, doInitialLoad]);

  return showRefreshing;
};
