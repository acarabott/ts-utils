export const findIndexThrow = <T>(array: T[], predicate: (x: T) => boolean): number => {
    const index = array.findIndex(predicate);
    if (index === -1) {
        throw new Error("could not find item");
    }
    return index;
};
