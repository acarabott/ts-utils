const joinChunks = (chunks: number[]): string => {
    return chunks.reduce((accum, cur) => {
        return (accum += cur.toString().padStart(2, "0"));
    }, "");
};

export const reverseDateTime = (date = new Date()) => {
    const dateChunks = [date.getFullYear(), date.getMonth() + 1, date.getDate()];
    const timeChunks = [date.getHours(), date.getMinutes(), date.getSeconds()];
    const result = `${joinChunks(dateChunks)}-${joinChunks(timeChunks)}`;
    return result;
};
