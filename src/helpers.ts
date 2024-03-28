export const noop: () => void = () => {};

export const uniqBy = <T, V>(a: T[], key: (arg: T) => V) => {
  return [...new Map(a.map((x) => [key(x), x])).values()];
};
