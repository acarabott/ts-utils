export const mapGetThrow = <K, V>(
  map: Map<K, V>,
  key: K,
  errorMessage = `no value in map for key ${key}`,
): V => {
  const result = map.get(key);
  if (result === undefined) {
    throw new Error(errorMessage);
  }
  return result;
};
