export const isArrayWhere = <T>(array: T[], predicate: (value: T) => boolean): boolean => {
  return Array.isArray(array) && array.every(predicate);
};
