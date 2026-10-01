import { useCallback, useEffect, useState } from "react";
import { applyStoredOrder, reorderByIds } from "../utils/list-order";
import { sortByName } from "../utils/sort-by-name";

type TOrderedList<T> = {
  ordered: T[];
  reorder: (activeId: string, overId: string) => void;
};

export const useOrderedList = <T extends { name: string }>(
  items: T[],
  getId: (item: T) => string,
  storageKey: string
): TOrderedList<T> => {
  const [ordered, setOrdered] = useState<T[]>([]);

  useEffect(() => {
    setOrdered(
      items.length ? applyStoredOrder(sortByName(items), getId, storageKey) : []
    );
  }, [items, getId, storageKey]);

  const reorder = useCallback(
    (activeId: string, overId: string) => {
      setOrdered((prev) =>
        reorderByIds(prev, getId, activeId, overId, storageKey)
      );
    },
    [getId, storageKey]
  );

  return { ordered, reorder };
};
