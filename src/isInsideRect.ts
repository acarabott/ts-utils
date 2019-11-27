import { IRect, Point } from "../api";

export const isInsideRect = (pos: Point, rect: IRect) => {
  return pos[0] >= rect.x &&
         pos[0] <= rect.x + rect.w &&
         pos[1] >= rect.y &&
         pos[1] <= rect.y + rect.h;
};
