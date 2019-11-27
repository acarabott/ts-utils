import { canvas as hdomCanvas } from "@thi.ng/hdom-canvas";
import { StreamMerge } from "@thi.ng/rstream/stream-merge";
import { labeled } from "@thi.ng/transducers";

import { widgetGestureStream } from "./widgetGestureStream";

export const gestureCanvasFactory = (eventStream: StreamMerge<any, {}>, gestureId: string) => {
  return {
    ...hdomCanvas,
    init: (canvasEl: HTMLCanvasElement) => {
      const gesture = widgetGestureStream(canvasEl, document.body, { preventScrollOnZoom: false });
      eventStream.add(gesture.transform(labeled(gestureId)));
    },
  };
};

export type GestureCanvas = ReturnType<typeof gestureCanvasFactory>;
