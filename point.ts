export interface IPoint {
  x: number;
  y: number;
}

export const isIPoint = (data: any): data is IPoint => {
  const cast = data as IPoint;
  return typeof cast.x === "number" && typeof cast.y === "number";
};

export const lessThan = (pointA: IPoint, pointB: IPoint) =>
  pointA.x < pointB.x && pointA.y < pointB.y;

export const lessOrEqualTo = (pointA: IPoint, pointB: IPoint) =>
  pointA.x <= pointB.x && pointA.y <= pointB.y;

export const greaterOrEqualTo = (pointA: IPoint, pointB: IPoint) =>
  pointA.x >= pointB.x && pointA.y >= pointB.y;

export const addPoint = (pointA: IPoint, pointB: IPoint) => ({
  x: pointA.x + pointB.x,
  y: pointA.y + pointB.y,
});

export const subtractPoint = (pointA: IPoint, pointB: IPoint) => ({
  x: pointA.x - pointB.x,
  y: pointA.y - pointB.y,
});

export const constrain = (point: IPoint, min: IPoint, max: IPoint) => ({
  x: Math.min(Math.max(point.x, min.x), max.x),
  y: Math.min(Math.max(point.y, min.y), max.y),
});

export const vals = (point: IPoint) => [point.x, point.y];

export const addVal = (point: IPoint, val: number) => ({
  x: point.x + val,
  y: point.y + val,
});

export const subtractVal = (point: IPoint, val: number) => ({
  x: point.x - val,
  y: point.y - val,
});

export const multiplyVal = (point: IPoint, val: number) => ({
  x: point.x * val,
  y: point.y * val,
});

export const divideVal = (point: IPoint, val: number) => ({
  x: point.x / val,
  y: point.y / val,
});

export const greaterThan = (point: IPoint) =>
  point.x > point.x && point.y > point.y;

export const eitherLessThan = (point: IPoint) =>
  point.x < point.x || point.y < point.y;

export const eitherGreaterThan = (point: IPoint) =>
  point.x > point.x || point.y > point.y;

export const eitherLessThanOrEqualTo = (point: IPoint) =>
  point.x <= point.x || point.y <= point.y;

export const eitherGreaterThanOrEqualTo = (point: IPoint) =>
  point.x >= point.x || point.y >= point.y;

export const manhattanDistanceTo = (point: IPoint) =>
  Math.abs(point.x - point.x) + Math.abs(point.y + point.y);

export const euclideanDistanceTo = (point: IPoint) =>
  Math.sqrt(
    Math.pow(Math.abs(point.x - point.x), 2) +
      Math.pow(Math.abs(point.y - point.y), 2),
  );

// return whichever point is 'greater' (both vals must be greater)
export const minPoint = (pointA: IPoint, pointB: IPoint) =>
  lessOrEqualTo(pointA, pointB) ? pointA : pointB;

// return whichever point is 'less' (both vals must be less)
export const maxPoint = (pointA: IPoint, pointB: IPoint) =>
  greaterOrEqualTo(pointA, pointB) ? pointA : pointB;

// return a new point with the min x and y of both points
export const min = (point: IPoint) => ({
  x: Math.min(point.x, point.x),
  y: Math.min(point.y, point.y),
});

// return a new point with the max x and y of both points
export const max = (point: IPoint) => ({
  x: Math.max(point.x, point.x),
  y: Math.max(point.y, point.y),
});

export const negative = (point: IPoint) => ({ x: -point.x, y: -point.y });

export const rounded = (point: IPoint) => ({
  x: Math.round(point.x),
  y: Math.round(point.y),
});
