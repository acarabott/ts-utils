export const objectGetThrow = <K extends string | number | symbol, V>(
  obj: Record<K, V>,
  key: K,
  message = "could not find item",
): V => {
  const found = obj[key];
  if (found === undefined) {
    throw new Error(message);
  }
  return found;
};
