export const inRange = (value: number, min: number, max: number, exclusive = false) =>
    value >= min && (exclusive ? value < max : value <= max);
