import * as p from "./point";
import { IPoint } from "./point";

export interface IRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const equal = (rectA: IRect, rectB: IRect) =>
  rectA.x === rectB.x &&
  rectA.y === rectB.y &&
  rectA.w === rectB.w &&
  rectA.h === rectB.h;

export const r = (rect: IRect) => rect.x + rect.w;
export const b = (rect: IRect) => rect.y + rect.h;

export const tl = (rect: IRect) => ({ x: rect.x, y: rect.y });
export const tr = (rect: IRect) => ({ x: rect.x + rect.w, y: rect.y });
export const bl = (rect: IRect) => ({ x: rect.x, y: rect.y + rect.h });
export const br = (rect: IRect) => ({ x: r(rect), y: b(rect) });

export const lerpX = (rect: IRect, pos: number) => rect.x + rect.w * pos;
export const lerpY = (rect: IRect, pos: number) => rect.y + rect.h * pos;

export const midX = (rect: IRect) => lerpX(rect, 0.5);
export const midY = (rect: IRect) => lerpY(rect, 0.5);

export const shape = (rectangle: IRect) =>
  [rectangle.w, rectangle.h] as const;

export const vals = (rect: IRect) =>
  [rect.x, rect.y, rect.w, rect.h] as const;

export const hdom = (rect: IRect) => [[rect.x, rect.y], rect.w, rect.h];

export const isPointInBoundsX = (
  rect: IRect,
  point: IPoint,
  threshold = 0,
) => point.x >= rect.x - threshold && point.x <= r(rect) + threshold;

export const isPointInBoundsY = (
  rect: IRect,
  point: IPoint,
  threshold = 0,
) => {
  return point.y >= rect.y - threshold && point.y <= b(rect) + threshold;
};

export const containsPoint = (
  rect: IRect,
  point: IPoint,
  isBrExclusive = true,
  horzThresh = 0,
  vertThresh = 0,
): boolean => {
  const tl = { x: rect.x, y: rect.y };
  const br = { x: rect.x + rect.w, y: rect.y + rect.h };

  if (horzThresh === 0 && vertThresh === 0) {
    const brMethod = isBrExclusive ? p.lessThan : p.lessOrEqualTo;
    return p.greaterOrEqualTo(point, tl) && brMethod(point, br);
  }

  const threshRect = {
    x: rect.x - horzThresh,
    y: rect.y - vertThresh,
    w: rect.w + horzThresh,
    h: rect.h + vertThresh,
  };

  return containsPoint(threshRect, point, isBrExclusive);
};

export const overlapsRect = (rectA: IRect, rectB: IRect) =>
  rectA.x < r(rectB) &&
  r(rectA) > rectB.x &&
  rectA.y < b(rectB) &&
  b(rectA) > rectB.y;

export const offsetBy = (rect: IRect, point: IPoint) => ({
  ...rect,
  ...p.addPoint(tl(rect), point),
});

export const center = (rect: IRect) => ({
  x: rect.x + rect.w / 2,
  y: rect.y + rect.h / 2,
});

export const containsRect = (rect: IRect, point: IPoint) =>
  containsPoint(rect, point) && containsPoint(rect, point);

// returns a new rectangle which is the overlapping of the two rectangles
// returns the overlapping rectangle
export const getRectOverlap = (rect: IRect, rectB: IRect) => {
  if (!overlapsRect(rect, rectB)) {
    return undefined;
  }

  const newX = Math.max(rect.y, rectB.y);
  const newY = Math.max(rect.x, rectB.x);
  const newB = Math.min(b(rect), b(rectB));
  const newR = Math.min(r(rect), r(rectB));

  return { x: newY, y: newX, w: newR - newY, h: newB - newX };
};

export const isPointOnTopLine = (
  rect: IRect,
  point: IPoint,
  threshold = 0,
) =>
  isPointInBoundsX(rect, point, threshold) &&
  point.y >= tl(rect).y - threshold &&
  point.y <= tl(rect).y + threshold;

export const isPointOnBottomLine = (
  rect: IRect,
  point: IPoint,
  threshold = 0,
) =>
  isPointInBoundsX(rect, point, threshold) &&
  point.y >= br(rect).y - threshold &&
  point.y <= br(rect).y + threshold;

export const isPointOnLeftLine = (
  rect: IRect,
  point: IPoint,
  threshold = 0,
) =>
  isPointInBoundsY(rect, point, threshold) &&
  point.x >= tl(rect).x - threshold &&
  point.x <= tl(rect).x + threshold;

export const isPointOnRightLine = (
  rect: IRect,
  point: IPoint,
  threshold = 0,
) =>
  isPointInBoundsY(rect, point, threshold) &&
  point.x >= br(rect).x - threshold &&
  point.x <= br(rect).x + threshold;

export const isPointOnLine = (rect: IRect, point: IPoint, threshold = 0) =>
  isPointOnTopLine(rect, point, threshold) ||
  isPointOnBottomLine(rect, point, threshold) ||
  isPointOnLeftLine(rect, point, threshold) ||
  isPointOnRightLine(rect, point, threshold);

export const isPointOnTopLeft = (
  rect: IRect,
  point: IPoint,
  threshold = 0,
) =>
  isPointOnTopLine(rect, point, threshold) &&
  isPointOnLeftLine(rect, point, threshold);

export const isPointOnTopRight = (
  rect: IRect,
  point: IPoint,
  threshold = 0,
) =>
  isPointOnTopLine(rect, point, threshold) &&
  isPointOnRightLine(rect, point, threshold);

export const isPointOnBottomLeft = (
  rect: IRect,
  point: IPoint,
  threshold = 0,
) =>
  isPointOnBottomLine(rect, point, threshold) &&
  isPointOnLeftLine(rect, point, threshold);

export const isPointOnBottomRight = (
  rect: IRect,
  point: IPoint,
  threshold = 0,
) =>
  isPointOnBottomLine(rect, point, threshold) &&
  isPointOnRightLine(rect, point, threshold);
