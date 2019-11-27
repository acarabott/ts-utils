// Buffer downsampling, user-facing code: uses downsample-buffer-lib.ts
// If the buffer has already been downsampled to a size that is greater than the
// requested renderWidth, that is downsampled instead of the buffer
// ------------------------------------------------------------------------------
import { createInlineWorker } from "./createInlineWorker";
import {
  downsampleChannels,
  downsampleRenderData,
  IBufferRenderData,
  isBufferData,
} from "./downsample-buffer-lib";
import { worker as downsampleWorkerString } from "./downsample-buffer.inline-worker";
import { WorkerPool } from "./WorkerPool";

type DownsampleBufferMethod = (
  buffer: AudioBuffer,
  renderWidth: number,
) => Promise<IBufferRenderData>;
type DownsampleRenderDataMethod = (
  data: Promise<IBufferRenderData>,
  renderWidth: number,
) => Promise<IBufferRenderData>;

// Helper functions
// -----------------------------------------------------------------------------

function getChannelsFromBuffer(buffer: AudioBuffer) {
  const numChannels = buffer.numberOfChannels;
  const channels: Float32Array[] = Array(numChannels);
  for (let c = 0; c < numChannels; c++) {
    channels[c] = buffer.getChannelData(c);
  }
  return channels;
}

// Caching function
// -----------------------------------------------------------------------------
// Store whether the Promise is resolved so that unresolved Promises can be
// ignored if needed
// This is important with a pool of Workers doing the downsampling, a new Worker
// will not be available until another worker is finished. A circular dependency
// can exist if a smaller render size is currently rendering, but is waiting on
// a larger render size that is in the queue waiting for a Worker

interface IBufferRenderDataCache {
  data: Promise<IBufferRenderData>;
  resolved: boolean;
}

const bufferCache = new Map<AudioBuffer, Map<number, IBufferRenderDataCache>>();
function downsampleBuffer(
  buffer: AudioBuffer,
  bufferMethod: DownsampleBufferMethod,
  renderDataMethod: DownsampleRenderDataMethod,
  renderWidth: number,
  minDownsampledWidth = renderWidth,
  maxDownsampleWidth = renderWidth,
  closestMustBeResolved: boolean,
): Promise<IBufferRenderData> {
  if (!bufferCache.has(buffer)) {
    bufferCache.set(buffer, new Map<number, IBufferRenderDataCache>());
  }

  const dataCache = bufferCache.get(buffer)!;

  {
    // Exact match in cache
    const cached = dataCache.get(renderWidth);
    if (cached !== undefined) {
      return cached.data;
    }
  }

  {
    // Close enough match in cache
    const closeEnoughWidth = Array.from(dataCache.keys()).find(width => {
      return width >= minDownsampledWidth && width <= maxDownsampleWidth;
    });

    if (closeEnoughWidth !== undefined) {
      const cached = dataCache.get(closeEnoughWidth);
      if (cached !== undefined) {
        return cached.data;
      }
    }
  }

  // No close match, check if larger version is in cache
  let closestWidth = Infinity;
  let useCache = false;
  const keys = dataCache.keys();

  for (const width of keys) {
    const cached = dataCache.get(width)!;
    const isResolvedIfNeeded = closestMustBeResolved && cached.resolved;
    if (width > renderWidth && width < closestWidth && isResolvedIfNeeded) {
      closestWidth = width;
      useCache = true;
    }
  }

  const downsampled = useCache
    ? renderDataMethod(dataCache.get(closestWidth)!.data, renderWidth)
    : bufferMethod(buffer, renderWidth);

  const toCache = { data: downsampled, resolved: false };
  dataCache.set(renderWidth, toCache);
  downsampled.then(() => (toCache.resolved = true));

  return downsampled;
}

// Sync version
// -----------------------------------------------------------------------------

export function downsampleBufferSync(
  buffer: AudioBuffer,
  renderWidth: number,
  minDownsampledWidth = renderWidth,
  maxDownsampleWidth = renderWidth,
): Promise<IBufferRenderData> {
  const bufferMethod = (_buffer: AudioBuffer, _renderWidth: number) => {
    return new Promise<IBufferRenderData>(() => {
      return downsampleChannels(getChannelsFromBuffer(_buffer), _renderWidth);
    });
  };

  const dataMethod = (
    _data: Promise<IBufferRenderData>,
    _renderWidth: number,
  ) => {
    return new Promise<IBufferRenderData>(async () => {
      return downsampleRenderData(await _data, _renderWidth);
    });
  };

  return downsampleBuffer(
    buffer,
    bufferMethod,
    dataMethod,
    renderWidth,
    minDownsampledWidth,
    maxDownsampleWidth,
    false,
  );
}

// Async (Worker) version
// -----------------------------------------------------------------------------
const workerPool = new WorkerPool(
  () => createInlineWorker(downsampleWorkerString),
  navigator.hardwareConcurrency,
);
async function downsampleInWorker(
  workerPostFunction: (worker: Worker) => void,
): Promise<IBufferRenderData> {
  const worker = await workerPool.getWorker();

  workerPostFunction(worker);

  return new Promise<IBufferRenderData>((success, reject) => {
    worker.onmessage = (event: MessageEvent) => {
      if (isBufferData(event.data)) {
        success(event.data as IBufferRenderData);
        workerPool.freeWorker(worker);
      } else {
        workerPool.freeWorker(worker);
        reject("Worker does not match IBufferData interface");
      }
    };

    worker.onerror = (error: ErrorEvent) => {
      workerPool.freeWorker(worker);
      reject(error);
    };
  });
}

interface IWorkerData {
  method: "channels" | "renderData";
  downsampleData: {
    renderWidth: number;
    [key: string]: any;
  };
}

function downsampleBufferInWorker(
  buffer: AudioBuffer,
  renderWidth: number,
): Promise<IBufferRenderData> {
  const postFunction = (worker: Worker) => {
    const channels = getChannelsFromBuffer(buffer);
    const workerData: IWorkerData = {
      method: "channels",
      downsampleData: { channels, renderWidth },
    };
    worker.postMessage(workerData);
  };

  return downsampleInWorker(postFunction);
}

function downsampleRenderDataInWorker(
  renderDataPromise: Promise<IBufferRenderData>,
  renderWidth: number,
): Promise<IBufferRenderData> {
  const postFunction = async (worker: Worker) => {
    const renderData = await renderDataPromise;

    const workerData: IWorkerData = {
      method: "renderData",
      downsampleData: { renderData, renderWidth },
    };
    worker.postMessage(workerData);
  };

  return downsampleInWorker(postFunction);
}

export function downsampleBufferAsync(
  buffer: AudioBuffer,
  renderWidth: number,
  minDownsampledWidth = renderWidth,
  maxDownsampleWidth = renderWidth,
): Promise<IBufferRenderData> {
  return downsampleBuffer(
    buffer,
    downsampleBufferInWorker,
    downsampleRenderDataInWorker,
    renderWidth,
    minDownsampledWidth,
    maxDownsampleWidth,
    true,
  );
}

export function removeBufferFromCache(buffer: AudioBuffer) {
  bufferCache.delete(buffer);
}
