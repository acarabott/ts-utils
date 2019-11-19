// adapted from https://github.com/mattdiamond/Recorderjs/blob/master/src/recorder.js

function floatTo16BitPCM(output: DataView, offset: number, input: Float32Array) {
  for (let i = 0; i < input.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
}

function writeString(view: DataView, offset: number, input: string) {
  for (let i = 0; i < input.length; i++) {
    view.setUint8(offset + i, input.charCodeAt(i));
  }
}

function encodeWAV(samples: Float32Array, numChannels: number, sampleRate: number) {
  const numHeaderBytes = 44;
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const buffer = new ArrayBuffer(numHeaderBytes + samples.length * bytesPerSample);
  const view = new DataView(buffer);

  /* RIFF identifier */
  writeString(view, 0, "RIFF");
  /* RIFF chunk length */
  view.setUint32(4, 36 + samples.length * bytesPerSample, true);
  /* RIFF type */
  writeString(view, 8, "WAVE");
  /* format chunk identifier */
  writeString(view, 12, "fmt ");
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw) */
  view.setUint16(20, 1, true);
  /* channel count */
  view.setUint16(22, numChannels, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * blockAlign, true);
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, blockAlign, true);
  /* bits per sample */
  view.setUint16(34, bitDepth, true);
  /* data chunk identifier */
  writeString(view, 36, "data");
  /* data chunk length */
  view.setUint32(40, samples.length * bytesPerSample, true);

  floatTo16BitPCM(view, numHeaderBytes, samples);

  return view;
}

function interleave(inputL: Float32Array, inputR: Float32Array) {
  const length = inputL.length + inputR.length;
  const result = new Float32Array(length);

  let index = 0;
  let inputIndex = 0;

  while (index < length) {
    result[index++] = inputL[inputIndex];
    result[index++] = inputR[inputIndex];
    inputIndex++;
  }
  return result;
}

export function audioBufferToWAV(audioBuffer: AudioBuffer) {
  const numChannels = audioBuffer.numberOfChannels;
  if (numChannels > 2) {
    throw new RangeError("only supports 1 - 2 channel audio");
  }

  const buffers = Array(...Array(numChannels)).map((_, i) => audioBuffer.getChannelData(i));

  const interleaved = numChannels === 2 ? interleave(buffers[0], buffers[1]) : buffers[0];
  const dataview = encodeWAV(interleaved, numChannels, audioBuffer.sampleRate);
  const audioBlob = new Blob([dataview], { type: "audio/wav" });

  return audioBlob;
}

function forceDownload(blob: Blob, filename = "output.wav") {
  const url = window.URL.createObjectURL(blob);
  const link = window.document.createElement("a");
  link.href = url;
  link.download = filename;
  link.textContent = filename;
  document.body.appendChild(link);

  link.click();
}

export function downloadAudioBufferAsWAV(audioBuffer: AudioBuffer, filename?: string) {
  const audioBlob = audioBufferToWAV(audioBuffer);
  forceDownload(audioBlob, filename);
}
