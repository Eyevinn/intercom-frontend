import { arrayMove } from "@dnd-kit/sortable";

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

export const getSavedOrder = (storageKey: string): string[] => {
  try {
    const saved = localStorage.getItem(storageKey);
    if (!saved) return [];

    const parsed: unknown = JSON.parse(saved);
    return isStringArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveOrder = (storageKey: string, ids: string[]): boolean => {
  try {
    localStorage.setItem(storageKey, JSON.stringify(ids));
    return true;
  } catch {
    return false;
  }
};

export const applyStoredOrder = <T>(
  items: T[],
  getId: (item: T) => string,
  storageKey: string
): T[] => {
  const savedOrder = getSavedOrder(storageKey);
  if (!savedOrder.length) return items;

  const itemMap = new Map(items.map((item) => [getId(item), item]));

  const ordered = savedOrder.reduce<T[]>((acc, id) => {
    const item = itemMap.get(id);
    if (item) {
      acc.push(item);
      itemMap.delete(id);
    }
    return acc;
  }, []);

  return [...ordered, ...itemMap.values()];
};

export const reorderByIds = <T>(
  items: T[],
  getId: (item: T) => string,
  activeId: string,
  overId: string,
  storageKey: string
): T[] => {
  const oldIndex = items.findIndex((item) => getId(item) === activeId);
  const newIndex = items.findIndex((item) => getId(item) === overId);
  if (oldIndex === -1 || newIndex === -1) return items;

  const reordered = arrayMove(items, oldIndex, newIndex);
  saveOrder(storageKey, reordered.map(getId));

  return reordered;
};
