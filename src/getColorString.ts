export const getColorString = (
  color: [number, number, number],
  alpha: number,
) => `rgba(${color.join(",")}, ${alpha} )`;
