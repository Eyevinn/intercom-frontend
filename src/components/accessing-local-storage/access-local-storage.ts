import { createStorage, StorageTS, StorageType } from "@martinstark/storage-ts";
import { useCallback, useEffect, useState } from "react";

type Schema = {
  username: string;
  audioinput?: string;
  audiooutput?: string;
};

export function useStorage() {
  const [store, setStore] = useState<StorageTS<Schema>>();

  useEffect(() => {
    // Create a store of the desired type. If it is not available,
    // in-memory storage will be used as a fallback.
    setStore(
      createStorage<Schema>({
        type: StorageType.LOCAL,
        prefix: "id",
        silent: true,
      })
    );
  }, []);

  type Key = keyof Schema;
  const readFromStorage = useCallback(
    (key: keyof Schema): Schema[Key] | null => {
      return store?.read(key);
    },
    [store]
  );

  const writeToStorage = useCallback(
    (key: keyof Schema, value: Schema[Key]): void => {
      store?.write(key, value);
    },
    [store]
  );

  const removeFromStorage = useCallback(
    (key: keyof Schema) => {
      store?.delete(key);
    },
    [store]
  );

  return { readFromStorage, writeToStorage, removeFromStorage };
}
