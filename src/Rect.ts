import { IPoint, Point } from "./Point";

export interface IRect {
    x: number;
    y: number;
    w: number;
    h: number;
}

// tslint:disable-next-line:variable-name
export const Rect = {
    equal: (rectA: IRect, rectB: IRect) =>
        rectA.x === rectB.x && rectA.y === rectB.y && rectA.w === rectB.w && rectA.h === rectB.h,

    r: (rect: IRect) => rect.x + rect.w,
    b: (rect: IRect) => rect.y + rect.h,

    tl: (rect: IRect) => ({ x: rect.x, y: rect.y }),
    tr: (rect: IRect) => ({ x: rect.x + rect.w, y: rect.y }),
    bl: (rect: IRect) => ({ x: rect.x, y: rect.y + rect.h }),
    br: (rect: IRect) => ({ x: Rect.r(rect), y: Rect.b(rect) }),

    lerpX: (rect: IRect, pos: number) => rect.x + rect.w * pos,
    lerpY: (rect: IRect, pos: number) => rect.y + rect.h * pos,

    midX: (rect: IRect) => Rect.lerpX(rect, 0.5),
    midY: (rect: IRect) => Rect.lerpY(rect, 0.5),

    shape: (rectangle: IRect) => [rectangle.w, rectangle.h] as const,

    vals: (rect: IRect) => [rect.x, rect.y, rect.w, rect.h] as const,

    hdom: (rect: IRect) => [[rect.x, rect.y], rect.w, rect.h],

    isPointInBoundsX: (rect: IRect, point: IPoint, threshold = 0) =>
        point.x >= rect.x - threshold && point.x <= Rect.r(rect) + threshold,

    isPointInBoundsY: (rect: IRect, point: IPoint, threshold = 0) =>
        point.y >= rect.y - threshold && point.y <= Rect.b(rect) + threshold,

    containsPoint: (rect: IRect, point: IPoint, isBrExclusive = true, horzThresh = 0, vertThresh = 0): boolean => {
        const tl = { x: rect.x, y: rect.y };
        const br = { x: rect.x + rect.w, y: rect.y + rect.h };

        if (horzThresh === 0 && vertThresh === 0) {
            const brMethod = isBrExclusive ? Point.lessThan : Point.lessOrEqualTo;
            return Point.greaterOrEqualTo(point, tl) && brMethod(point, br);
        }

        const threshRect = {
            x: rect.x - horzThresh,
            y: rect.y - vertThresh,
            w: rect.w + horzThresh,
            h: rect.h + vertThresh,
        };

        return Rect.containsPoint(threshRect, point, isBrExclusive);
    },

    overlapsRect: (rectA: IRect, rectB: IRect) =>
        rectA.x < Rect.r(rectB) && Rect.r(rectA) > rectB.x && rectA.y < Rect.b(rectB) && Rect.b(rectA) > rectB.y,

    offsetBy: (rect: IRect, point: IPoint) => ({
        ...rect,
        ...Point.addPoint(Rect.tl(rect), point),
    }),

    center: (rect: IRect) => ({
        x: rect.x + rect.w / 2,
        y: rect.y + rect.h / 2,
    }),

    containsRect: (rect: IRect, point: IPoint) => Rect.containsPoint(rect, point) && Rect.containsPoint(rect, point),

    // returns a new rectangle which is the overlapping of the two rectangles
    // returns the overlapping rectangle
    getRectOverlap: (rect: IRect, rectB: IRect) => {
        if (!Rect.overlapsRect(rect, rectB)) {
            return undefined;
        }

        const newX = Math.max(rect.y, rectB.y);
        const newY = Math.max(rect.x, rectB.x);
        const newB = Math.min(Rect.b(rect), Rect.b(rectB));
        const newR = Math.min(Rect.r(rect), Rect.r(rectB));

        return { x: newY, y: newX, w: newR - newY, h: newB - newX };
    },

    isPointOnTopLine: (rect: IRect, point: IPoint, threshold = 0) =>
        Rect.isPointInBoundsX(rect, point, threshold) &&
        point.y >= Rect.tl(rect).y - threshold &&
        point.y <= Rect.tl(rect).y + threshold,

    isPointOnBottomLine: (rect: IRect, point: IPoint, threshold = 0) =>
        Rect.isPointInBoundsX(rect, point, threshold) &&
        point.y >= Rect.br(rect).y - threshold &&
        point.y <= Rect.br(rect).y + threshold,

    isPointOnLeftLine: (rect: IRect, point: IPoint, threshold = 0) =>
        Rect.isPointInBoundsY(rect, point, threshold) &&
        point.x >= Rect.tl(rect).x - threshold &&
        point.x <= Rect.tl(rect).x + threshold,

    isPointOnRightLine: (rect: IRect, point: IPoint, threshold = 0) =>
        Rect.isPointInBoundsY(rect, point, threshold) &&
        point.x >= Rect.br(rect).x - threshold &&
        point.x <= Rect.br(rect).x + threshold,

    isPointOnLine: (rect: IRect, point: IPoint, threshold = 0) =>
        Rect.isPointOnTopLine(rect, point, threshold) ||
        Rect.isPointOnBottomLine(rect, point, threshold) ||
        Rect.isPointOnLeftLine(rect, point, threshold) ||
        Rect.isPointOnRightLine(rect, point, threshold),

    isPointOnTopLeft: (rect: IRect, point: IPoint, threshold = 0) =>
        Rect.isPointOnTopLine(rect, point, threshold) && Rect.isPointOnLeftLine(rect, point, threshold),

    isPointOnTopRight: (rect: IRect, point: IPoint, threshold = 0) =>
        Rect.isPointOnTopLine(rect, point, threshold) && Rect.isPointOnRightLine(rect, point, threshold),

    isPointOnBottomLeft: (rect: IRect, point: IPoint, threshold = 0) =>
        Rect.isPointOnBottomLine(rect, point, threshold) && Rect.isPointOnLeftLine(rect, point, threshold),

    isPointOnBottomRight: (rect: IRect, point: IPoint, threshold = 0) =>
        Rect.isPointOnBottomLine(rect, point, threshold) && Rect.isPointOnRightLine(rect, point, threshold),
};
