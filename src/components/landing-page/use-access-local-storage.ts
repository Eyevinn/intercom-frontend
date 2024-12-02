import { useEffect, useState } from "react";

type TLocalStorage = {
  localStorageType: string | null;
  localStorageData: string | null;
};

export const useLocalStorage = ({
  localStorageType,
  localStorageData,
}: TLocalStorage) => {
  const [cachedData, setCachedData] = useState<string | null>(null);

  useEffect(() => {
    if (localStorageType) {
      setCachedData(window.localStorage.getItem(localStorageType));
    }
  }, [localStorageType]);

  useEffect(() => {
    if (localStorageType && localStorageData) {
      window.localStorage.setItem(localStorageType, localStorageData);
      setCachedData(localStorageData);
    }
  }, [localStorageData, localStorageType]);

  return cachedData;
};
