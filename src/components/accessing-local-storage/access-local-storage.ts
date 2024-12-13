import { useCallback } from "react";
import { createStorage, StorageType } from "@martinstark/storage-ts";

type Schema = {
  username: string;
};

// Create a store of the desired type. If it is not available,
// in-memory storage will be used as a fallback.
const store = createStorage<Schema>({
  type: StorageType.LOCAL,
  prefix: "id",
  silent: true,
});

export function useStorage<Key extends keyof Schema>(key: Key) {
  const readFromStorage = useCallback((): Schema[Key] | null => {
    return store.read(key);
  }, [key]);

  const writeToStorage = useCallback(
    (value: Schema[Key]): void => {
      store.write(key, value);
    },
    [key]
  );

  return { readFromStorage, writeToStorage };
}
