export const constrain = (value: number, min = 0, max = 1) => Math.min(Math.max(value, min), max);
