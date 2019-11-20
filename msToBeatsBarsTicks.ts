import { numPad } from "./numPad";

export const msToBeatsBarsTicks = (timeMs: number, tempo: number, beatsPerBar: number) => {
  const ticksPerBeat = 960;
  const beatsPerMs = tempo / 60 / 1000;
  const ticksPerMs = ticksPerBeat * beatsPerMs;
  const beats = timeMs * beatsPerMs;
  const bar = Math.floor(beats / beatsPerBar) + 1;
  const beat = (Math.floor(beats) % beatsPerBar) + 1;
  const tick = (Math.floor(timeMs * ticksPerMs) % ticksPerBeat) + 1;

  return `${numPad(bar)}.${numPad(beat)}.${numPad(tick, 3)}`;
};
