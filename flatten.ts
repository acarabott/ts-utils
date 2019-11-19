export const flatten = <T>(nested: Array<T | T[]>, result: T[] = []) => {
  for (let i = 0, length = nested.length; i < length; i++) {
    const value = nested[i];
    if (Array.isArray(value)) {
      result = flatten(value, result);
    } else {
      result.push(value);
    }
  }
  return result;
};
