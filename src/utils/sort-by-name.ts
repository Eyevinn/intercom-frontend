const collator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: "base",
});

export const sortByName = <T extends { name: string }>(items: T[]): T[] =>
  [...items].sort((a, b) => collator.compare(a.name, b.name));
