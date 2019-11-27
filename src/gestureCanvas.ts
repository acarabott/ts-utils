import { canvas } from "@thi.ng/hdom-canvas";
import { StreamMerge } from "@thi.ng/rstream";
import { labeled } from "@thi.ng/transducers";

import { gestureStream, IGestureStreamOptions } from "./gestureStream";

// Canvas creation helper
// -----------------------------------------------------------------------------

// adds an init lifecycle method to the hdom-canvas, so that geatureStreams can
// be added once the element is created
export const gestureCanvas = <T>(
  parentStream: StreamMerge<any, T>,
  gestureId: string,
  options?: Partial<IGestureStreamOptions>,
) => ({
  ...canvas,
  init: (el: HTMLCanvasElement) => {
    parentStream.add(gestureStream(el, options).transform(labeled(gestureId)));
  },
});
