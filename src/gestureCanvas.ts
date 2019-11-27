import { canvas } from "@thi.ng/hdom-canvas";
import { StreamMerge } from "@thi.ng/rstream";
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
) => ({
  ...canvas,
  init: (el: HTMLCanvasElement) => {
    parentStream.add(gestureStream(el, options).transform(labeled(gestureId)));
  },
});
