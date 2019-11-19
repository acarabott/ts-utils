export const findDo = <T>(
  array: T[],
  predicate: (item: T) => boolean,
  action: (item: T) => void,
) => {
  const found = array.find(predicate);
  if (found !== undefined) {
    action(found);
  }
  return found;
};
