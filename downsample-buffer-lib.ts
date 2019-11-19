// important! imports must be single lines, as they are removed by sed when compiling
// important! don't use unescaped single quotes, these are used to wrap in the compilation

// Buffer sampling lib
// Downsamples an audio buffer to an array of floats for a given renderWidth
// The downsampled version stores two values (min and max) for each pixel to be
// rendered.

// This is not really user facing code, instead `downsampleBuffer` should be used
// from downsample-buffer.ts which does useful caching

export interface IBufferRenderData {
  data: Float32Array[];
  numValuesPerSample: number;
}

export function isBufferData(data: any): data is IBufferRenderData {
  const hasData = (data as IBufferRenderData).data !== undefined;
  const hasNumValuesPerSample = Number.isFinite((data as IBufferRenderData).numValuesPerSample);
  return hasData && hasNumValuesPerSample;
}

export function downsampleChannels(
  channels: Float32Array[],
  renderWidth: number,
): IBufferRenderData {
  const numChannels = channels.length;
  const numValuesPerSample = 2; // store the min and max for each window
  const numSamplesPerPixel = Math.max(Math.floor(channels[0].length / renderWidth), 1);
  const downsampled = Array(numChannels);

  for (let c = 0; c < numChannels; c++) {
    const channel = channels[c];
    let min = 0;
    let max = 0;

    const channelLength = channel.length;
    const numSamples = Math.floor(channelLength / numSamplesPerPixel) * numValuesPerSample;
    const samples = new Float32Array(numSamples);
    let sampleIdx = 0;
    let windowIdx = 0;

    for (let i = 0; i < channelLength; i++) {
      const sample = channel[i];
      if (sample < min) {
        min = sample;
      }
      if (sample > max) {
        max = sample;
      }

      windowIdx++;
      if (windowIdx === numSamplesPerPixel) {
        samples[sampleIdx] = min;
        samples[sampleIdx + 1] = max;
        sampleIdx += 2;
        min = 0;
        max = 0;
        windowIdx = 0;
      }
    }
    downsampled[c] = samples;
  }

  return { data: downsampled, numValuesPerSample };
}

// downsample already downsample data, interleaved min and max values
export function downsampleRenderData(
  input: IBufferRenderData,
  renderWidth: number,
): IBufferRenderData {
  const numChannels = input.data.length;
  const downsampled: Float32Array[] = Array(numChannels);
  const numValuesPerSample = input.numValuesPerSample;
  const numOutSamples = renderWidth * numValuesPerSample;
  const numInputSamples = input.data[0].length;
  const inputStep = numOutSamples / numInputSamples;

  for (let c = 0; c < numChannels; c++) {
    const inChannel = input.data[c];
    const downsampledChannel = new Float32Array(numOutSamples);

    let min = 0;
    let max = 0;
    let inIdx = 0;
    let outIdx = 0;
    for (let i = 0; i < numInputSamples; i += numValuesPerSample) {
      const inMin = inChannel[i];
      const inMax = inChannel[i + 1];
      if (inMin < min) {
        min = inMin;
      }
      if (inMax > max) {
        max = inMax;
      }

      inIdx += inputStep;
      if (inIdx >= 1) {
        downsampledChannel[outIdx] = min;
        downsampledChannel[outIdx + 1] = max;
        outIdx += numValuesPerSample;
        inIdx %= 1;
        min = 0;
        max = 0;
      }
    }

    downsampled[c] = downsampledChannel;
  }

  return { data: downsampled, numValuesPerSample };
}
