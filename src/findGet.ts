export const findGet = <T, R>(
  array: T[],
  predicate: (item: T) => boolean,
  get: (item: T) => R,
  or: () => R,
) => {
  const found = array.find(predicate);
  return found !== undefined ? get(found) : or();
};
