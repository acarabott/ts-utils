export interface IPoint {
  x: number;
  y: number;
}

// tslint:disable-next-line:variable-name
export const Point = {
  isIPoint(data: any): data is IPoint {
    const cast = data as IPoint;
    return typeof cast.x === "number" && typeof cast.y === "number";
  },

  lessThan(pointA: IPoint, pointB: IPoint) {
    return pointA.x < pointB.x && pointA.y < pointB.y;
  },

  lessOrEqualTo(pointA: IPoint, pointB: IPoint) {
    return pointA.x <= pointB.x && pointA.y <= pointB.y;
  },

  greaterOrEqualTo(pointA: IPoint, pointB: IPoint) {
    return pointA.x >= pointB.x && pointA.y >= pointB.y;
  },

  addPoint(pointA: IPoint, pointB: IPoint) {
    return {
      x: pointA.x + pointB.x,
      y: pointA.y + pointB.y,
    };
  },

  subtractPoint(pointA: IPoint, pointB: IPoint) {
    return {
      x: pointA.x - pointB.x,
      y: pointA.y - pointB.y,
    };
  },

  constrain(point: IPoint, minP: IPoint, maxP: IPoint) {
    return {
      x: Math.min(Math.max(point.x, minP.x), maxP.x),
      y: Math.min(Math.max(point.y, minP.y), maxP.y),
    };
  },

  vals(point: IPoint) {
    return [point.x, point.y];
  },

  addVal(point: IPoint, val: number) {
    return {
      x: point.x + val,
      y: point.y + val,
    };
  },

  subtractVal(point: IPoint, val: number) {
    return {
      x: point.x - val,
      y: point.y - val,
    };
  },

  multiplyVal(point: IPoint, val: number) {
    return {
      x: point.x * val,
      y: point.y * val,
    };
  },

  divideVal(point: IPoint, val: number) {
    return {
      x: point.x / val,
      y: point.y / val,
    };
  },

  greaterThan(point: IPoint) {
    return point.x > point.x && point.y > point.y;
  },

  eitherLessThan(point: IPoint) {
    return point.x < point.x || point.y < point.y;
  },

  eitherGreaterThan(point: IPoint) {
    return point.x > point.x || point.y > point.y;
  },

  eitherLessThanOrEqualTo(point: IPoint) {
    return point.x <= point.x || point.y <= point.y;
  },

  eitherGreaterThanOrEqualTo(point: IPoint) {
    return point.x >= point.x || point.y >= point.y;
  },

  manhattanDistanceTo(point: IPoint) {
    return Math.abs(point.x - point.x) + Math.abs(point.y + point.y);
  },

  euclideanDistanceTo(point: IPoint) {
    return Math.sqrt(
      Math.pow(Math.abs(point.x - point.x), 2) +
        Math.pow(Math.abs(point.y - point.y), 2),
    );
  },

  // return whichever point is 'greater' (both vals must be greater)
  minPoint(pointA: IPoint, pointB: IPoint) {
    return Point.lessOrEqualTo(pointA, pointB) ? pointA : pointB;
  },

  // return whichever point is 'less' (both vals must be less)
  maxPoint(pointA: IPoint, pointB: IPoint) {
    return Point.greaterOrEqualTo(pointA, pointB) ? pointA : pointB;
  },

  // return a new point with the min x and y of both points
  min(point: IPoint) {
    return {
      x: Math.min(point.x, point.x),
      y: Math.min(point.y, point.y),
    };
  },

  // return a new point with the max x and y of both points
  max(point: IPoint) {
    return {
      x: Math.max(point.x, point.x),
      y: Math.max(point.y, point.y),
    };
  },

  negative(point: IPoint) {
    return { x: -point.x, y: -point.y };
  },

  rounded(point: IPoint) {
    return {
      x: Math.round(point.x),
      y: Math.round(point.y),
    };
  },
};
