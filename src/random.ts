export const randomInt = (max: number, random = Math.random()) => Math.floor(random * max);

export const randomIndex = <T>(array: T[], random = Math.random()) => randomInt(array.length, random);

export const choose = <T>(collection: T[]) => {
    if (collection.length === 0) {
        throw new RangeError("Collection is empty");
    }
    return collection[randomIndex(collection)];
};

export const shuffleInPlace = <T>(array: T[]): void => {
    for (let i = 0, N = array.length; i < N; i++) {
        const idx = randomIndex(array);
        const temp = array[i];
        array[i] = array[idx];
        array[idx] = temp;
    }
};

export const shuffle = <T>(array: T[]): T[] => {
    const clone = array.slice();
    shuffleInPlace(clone);
    return clone;
};
