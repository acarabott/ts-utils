import { IObjectOf } from "@thi.ng/api/api";
import { clamp } from "@thi.ng/math";
import { GestureStreamOpts, GestureType } from "@thi.ng/rstream-gestures";
import { fromEvent } from "@thi.ng/rstream/from/event";
import { merge, StreamMerge } from "@thi.ng/rstream/stream-merge";
import { map } from "@thi.ng/transducers";
import { comp } from "@thi.ng/transducers/func/comp";

export interface IWidgetGestureInfo {
  pos: number[];
  click?: number[];
  delta?: number[];
  zoom: number;
  isInsideEl: boolean;
  isTouch: boolean;
}

export interface IWidgetGestureEvent {
  type: GestureType;
  info: IWidgetGestureInfo;
}

export interface IWidgetGestureStreamOpts extends GestureStreamOpts {
  /**
   * If true (default: true), scroll events on the element will prevent the
   * document from scrolling.
   * If false, the scroll event will use the eventOpts.passive argument
   * (default: true) which should be true in most cases for performance reasons:
   * https://www.chromestatus.com/feature/5745543795965952
   */

  preventScrollOnZoom: boolean;
}

function getGestureType(eventType: string, isDown: boolean) {
  return ({
    touchstart: GestureType.START,
    touchmove: GestureType.DRAG,
    touchend: GestureType.END,
    touchcancel: GestureType.END,

    mousedown: GestureType.START,
    mousemove: isDown ? GestureType.DRAG : GestureType.MOVE,
    mouseup: GestureType.END,
    wheel: GestureType.ZOOM,
  } as IObjectOf<GestureType>)[eventType];
}

export function widgetGestureStream(el: HTMLElement, stopEl: HTMLElement,
                                    userOpts?: Partial<IWidgetGestureStreamOpts>):
                                    StreamMerge<any, IWidgetGestureEvent | undefined> {
  const defaultOptions: IWidgetGestureStreamOpts = {
    id: "gestures",
    zoom: 1,
    minZoom: 0.25,
    maxZoom: 4,
    smooth: 1,
    eventOpts: { capture: true, passive: false },
    preventScrollOnZoom: true,
    preventDefault: true,
    local: true,
    scale: false,
  };

  const opts = Object.assign(defaultOptions, userOpts);
  const devicePixelRatio = window.devicePixelRatio || 1;

  let isDown = false;
  let clickPos: number[] = [0, 0];
  let zoom = Math.min(Math.max(opts.zoom, opts.minZoom), opts.maxZoom);

  let touchId = -1;

  return merge({
    id: opts.id,

    src: [
      "mousedown", "mousemove", "mouseup",
      "touchstart", "touchmove", "touchend", "touchcancel",
      "wheel",
    ].map((e) => {
      const eventOpts = typeof opts.eventOpts === "boolean"
        ? { passive: opts.eventOpts }
        : Object.assign({}, opts.eventOpts);

      if (e === "wheel") { eventOpts.passive = eventOpts.passive && !opts.preventScrollOnZoom; }
      return fromEvent(stopEl, e, eventOpts);
    }),

    xform: comp(
      map((e: MouseEvent | TouchEvent | WheelEvent): IWidgetGestureEvent | undefined => {
        const type = getGestureType(e.type, isDown);
        const isTouchEvent = (e as TouchEvent).touches !== undefined;

        let evt: MouseEvent | Touch | WheelEvent;
        if (isTouchEvent) {
          const touchEvent = (e as TouchEvent);

          if (type === GestureType.START) {
            if (isDown) { return; }

            const touch = touchEvent.changedTouches[0];
            touchId = touch.identifier;
            evt = touch;
          }
          else {
            const found = Array.from(touchEvent.changedTouches).find(touch => touch.identifier === touchId);
            if (found === undefined) { return; }
            evt = found;
          }
        }
        else {
          evt = (e as MouseEvent | WheelEvent);
        }

        if (type === GestureType.START) {
          if (evt.target !== el) {
            return;
          }
          else {
            isDown = true;
          }
        }
        else if (type === GestureType.ZOOM) {
          if (evt.target !== el) {
            return;
          }
        }
        else {
          if (!isDown) {
            return;
          }
        }

        const pos = [evt.clientX, evt.clientY];
        const rect = el.getBoundingClientRect();
        const isInsideEl = pos[0] >= rect.left && pos[0] <= rect.right &&
                           pos[1] >= rect.top  && pos[1] <= rect.bottom;

        if (opts.local) {
          pos[0] -= rect.left;
          pos[1] -= rect.top;
        }

        if (opts.scale) {
          pos[0] *= devicePixelRatio;
          pos[1] *= devicePixelRatio;
        }

        const info: IWidgetGestureInfo = { pos, zoom, isInsideEl, isTouch: isTouchEvent };

        if (type === GestureType.START) {
          if (!isInsideEl) { return undefined; }
          if (opts.preventDefault) { e.preventDefault(); }
          isDown = true;
          clickPos = [...pos];
        }
        else if (type === GestureType.END) {
          if (opts.preventDefault) { e.preventDefault(); }
          isDown = false;
        }
        else if (type === GestureType.DRAG) {
          if (opts.preventDefault) { e.preventDefault(); }
          info.click = clickPos;
          info.delta = [pos[0] - clickPos[0], pos[1] - clickPos[1]];
        }
        else if (type === GestureType.ZOOM) {
          if (opts.preventDefault && opts.preventScrollOnZoom) { e.preventDefault(); }
          zoom = clamp(zoom + (e as WheelEvent).deltaY * opts.smooth, opts.minZoom, opts.maxZoom);
          info.zoom = zoom;
        }

        return { type, info };
      }),
    ),
  });
}
