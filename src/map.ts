export enum Clip {
  None,
  Min,
  Max,
  Both,
}

export const map = (
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
  clipMode = Clip.Both,
) => {
  if ([Clip.Min, Clip.Both].includes(clipMode) && value <= inMin) {
    return outMin;
  }
  if ([Clip.Max, Clip.Both].includes(clipMode) && value >= inMax) {
    return outMax;
  }

  const offset = value - inMin;
  const inputRange = inMax - inMin;
  const norm = offset / inputRange;
  const outputRange = outMax - outMin;
  const scaled = norm * outputRange;
  return outMin + scaled;
};
