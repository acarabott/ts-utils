// Converts a value in semitones into a multiplier
// e.g. 0st = 1.0, 7st = 1.583, 12st = 2.0, -5st = 0.583
// Used for detuning
export const semitonesToDetune = (semitones: number) =>
  1.0 + (1 / 12) * semitones;
