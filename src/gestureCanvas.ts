import { ILifecycle } from "@thi.ng/hdom";
import { canvas } from "@thi.ng/hdom-canvas";
import { StreamMerge, Subscription } from "@thi.ng/rstream";
import { labeled } from "@thi.ng/transducers";

import {
  GestureEvent,
  gestureStream,
  IGestureStreamOptions,
} from "./gestureStream";

// Canvas creation helper
// -----------------------------------------------------------------------------

// adds an init lifecycle method to the hdom-canvas, so that geatureStreams can
// be added once the element is created
export type LabeledGestureStream<T extends string> = [T, GestureEvent[]];
export type GestureStream<T extends string> = StreamMerge<
  any,
  LabeledGestureStream<T>
>;

export const gestureCanvas = <T_ID extends string>(
  parentStream: StreamMerge<any, LabeledGestureStream<T_ID>>,
  gestureId: T_ID,
  options?: Partial<IGestureStreamOptions>,
): ILifecycle => {
  let theStream: Subscription<GestureEvent[], LabeledGestureStream<T_ID>>;

  return {
    ...canvas,
    init(el: HTMLCanvasElement) {
      theStream = gestureStream(el, options).transform(labeled(gestureId));
      parentStream.add(theStream);
    },

    release() {
      parentStream.remove(theStream);
    },
  };
};
