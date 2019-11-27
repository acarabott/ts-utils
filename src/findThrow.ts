export const findThrow = <T>(array: T[], predicate: (x: T) => boolean): T => {
  const found = array.find(predicate);
  if (found === undefined) {
    throw new Error("could not find item");
  }
  return found;
};
