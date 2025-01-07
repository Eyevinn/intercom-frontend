import { createStorage, StorageType } from "@martinstark/storage-ts";

type Schema = {
  username: string;
  audioinput?: string;
  audiooutput?: string;
};

// Create a store of the desired type. If it is not available,
// in-memory storage will be used as a fallback.
const store = createStorage<Schema>({
  type: StorageType.LOCAL,
  prefix: "id",
  silent: true,
});

export function useStorage() {
  type Key = keyof Schema;
  const readFromStorage = (key: keyof Schema): Schema[Key] | null => {
    return store.read(key);
  };

  const writeToStorage = (key: keyof Schema, value: Schema[Key]): void => {
    store.write(key, value);
  };

  const clearStorage = (key: keyof Schema) => {
    store.delete(key);
  };

  return { readFromStorage, writeToStorage, clearStorage };
}
