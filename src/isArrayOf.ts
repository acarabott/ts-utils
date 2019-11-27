export const isArrayOf = (data: any, type: string): boolean => {
  return Array.isArray(data) && data.every((n: any) => typeof n === type);
};
