export const msToTimeString = (timeMs: number, includeMs: boolean) => {
    const timeS = timeMs / 1000;
    const minutes = Math.floor(timeS / 60)
        .toString()
        .padStart(2, "0");
    const seconds = Math.floor(timeS % 60)
        .toString()
        .padStart(2, "0");

    let timeString = `${minutes}:${seconds}`;
    if (includeMs) {
        const ms = Math.floor((timeS % 1) * 1000)
            .toString()
            .padStart(3, "0");
        timeString += `.${ms}`;
    }
    return timeString;
};
