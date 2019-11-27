export const findOr = <T>(array: T[], predicate: (item: T) => boolean, or: () => T) => {
  const found = array.find(predicate);
  return found !== undefined ? found : or();
};
