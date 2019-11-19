export function randomInt(max: number, random = Math.random()) {
  return Math.floor(random * max);
}

export function randomIndex<T>(array: T[], random = Math.random()) {
  return randomInt(array.length, random);
}

export function choose<T>(collection: T[]) {
  if (collection.length === 0) {
    throw new RangeError("Collection is empty");
  }
  return collection[randomIndex(collection)];
}

export function shuffleInPlace<T>(array: T[]): void {
  for (let i = 0, N = array.length; i < N; i++) {
    const idx = randomIndex(array);
    const temp = array[i];
    array[i] = array[idx];
    array[idx] = temp;
  }
}

export function shuffle<T>(array: T[]): T[] {
  const clone = array.slice();
  shuffleInPlace(clone);
  return clone;
}

export interface IProbability {
  probability: number;
}

export function isIProbability(value: any): value is IProbability {
  const cast = value as IProbability;
  return cast !== undefined && typeof cast.probability === "number";
}

export function chooseIProbability<T extends IProbability>(
  probabilities: T[],
  chance = Math.random() * 100,
) {
  let chosen = false;
  let chosenIndex = 0;

  while (!chosen && chosenIndex < probabilities.length) {
    chosen = chance < probabilities[chosenIndex].probability;
    if (!chosen) {
      chance -= probabilities[chosenIndex].probability;
      chosenIndex++;
    }
  }

  if (!chosen) {
    chosenIndex = randomIndex(probabilities);
  }

  return probabilities[chosenIndex];
}

export const sumProbabilities = <T extends IProbability>(probabilities: T[]): number =>
  probabilities.reduce((accum, val) => accum + val.probability, 0);

export const normalizeProbabilities = <T extends IProbability>(probabilities: T[]): T[] => {
  if (probabilities.length === 0) {
    return probabilities;
  }

  let sum = sumProbabilities(probabilities);
  if (sum <= 0) {
    sum = 100;
  }

  const newProbabilities = probabilities.map(prob => ({
    ...prob,
    probability: Math.round((prob.probability / sum) * 100),
  }));

  const error = 100 - sumProbabilities(newProbabilities);
  chooseIProbability(newProbabilities).probability += error;

  return newProbabilities;
};

export const areProbabilitiesBalanced = <T extends IProbability>(probabilities: T[]): boolean => {
  return sumProbabilities(probabilities) === 100;
};

export const testProbability = (
  probability: number,
  scalar = 1.0,
  random = Math.random() * 100,
): boolean => {
  return random < probability * scalar;
};
