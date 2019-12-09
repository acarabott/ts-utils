export interface IPoint {
  x: number;
  y: number;
}

export interface IClientPoint {
  clientX: number;
  clientY: number;
}

// tslint:disable-next-line:variable-name
export const Point = {
  isIPoint(data: any): data is IPoint {
    const cast = data as IPoint;
    return typeof cast.x === "number" && typeof cast.y === "number";
  },

  vals(point: IPoint) {
    return [point.x, point.y];
  },

  addPoint(a: IPoint, b: IPoint) {
    return {
      x: a.x + b.x,
      y: a.y + b.y,
    };
  },

  subtractPoint(a: IPoint, b: IPoint): IPoint {
    return {
      x: a.x - b.x,
      y: a.y - b.y,
    };
  },

  multiplyScalar(point: IPoint, scalar: number) {
    return {
      x: point.x * scalar,
      y: point.y * scalar,
    };
  },

  divideScalar(point: IPoint, scalar: number) {
    return {
      x: point.x / scalar,
      y: point.y / scalar,
    };
  },

  addScalar(point: IPoint, scalar: number) {
    return {
      x: point.x + scalar,
      y: point.y + scalar,
    };
  },

  subtractScalar(point: IPoint, scalar: number) {
    return {
      x: point.x - scalar,
      y: point.y - scalar,
    };
  },

  constrain(point: IPoint, min: IPoint, max: IPoint) {
    return {
      x: Math.min(Math.max(point.x, min.x), max.x),
      y: Math.min(Math.max(point.y, min.y), max.y),
    };
  },

  lessThan(a: IPoint, b: IPoint) {
    return a.x < b.x && a.y < b.y;
  },

  lessOrEqualTo(a: IPoint, b: IPoint) {
    return a.x <= b.x && a.y <= b.y;
  },

  greaterOrEqualTo(a: IPoint, b: IPoint) {
    return a.x >= b.x && a.y >= b.y;
  },

  greaterThan(a: IPoint, b: IPoint) {
    return a.x > b.x && a.y > b.y;
  },

  eitherLessThan(a: IPoint, b: IPoint) {
    return a.x < b.x || a.y < b.y;
  },

  eitherGreaterThan(a: IPoint, b: IPoint) {
    return a.x > b.x || a.y > b.y;
  },

  eitherLessThanOrEqualTo(a: IPoint, b: IPoint) {
    return a.x <= b.x || a.y <= b.y;
  },

  eitherGreaterThanOrEqualTo(a: IPoint, b: IPoint) {
    return a.x >= b.x || a.y >= b.y;
  },

  manhattanDistanceTo(a: IPoint, b: IPoint) {
    return Math.abs(a.x - b.x) + Math.abs(a.y + b.y);
  },

  euclideanDistanceTo(a: IPoint, b: IPoint) {
    return Math.sqrt(
      Math.pow(Math.abs(a.x - b.x), 2) + Math.pow(Math.abs(a.y - b.y), 2),
    );
  },

  // return whichever point is 'greater' (both vals must be greater)
  minPoint(a: IPoint, b: IPoint) {
    return Point.lessOrEqualTo(a, b) ? a : b;
  },

  // return whichever point is 'less' (both vals must be less)
  maxPoint(a: IPoint, b: IPoint) {
    return Point.greaterOrEqualTo(a, b) ? a : b;
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

  getPointFromClient(el: HTMLElement, point: IClientPoint): IPoint {
    const bounds = el.getBoundingClientRect();
    const x = point.clientX - bounds.left;
    const y = point.clientY - bounds.top;
    return { x, y };
  },

  getPointFromTouchEvent(event: TouchEvent, el: HTMLElement) {
    return event.touches.length > 0
      ? Point.getPointFromClient(el, event.touches[0])
      : undefined;
  },
};
