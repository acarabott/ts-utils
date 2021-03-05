export const isPointOnLine = (testPoint: number[], linePointA: number[], linePointB: number[]) => {
    const dxc = testPoint[0] - linePointA[0];
    const dyc = testPoint[1] - linePointA[1];
    const dxl = linePointB[0] - linePointA[0];
    const dyl = linePointB[1] - linePointA[1];
    const cross = dxc * dyl - dyc * dxl;

    const lineThreshold = 400; // WARNING: magic number
    const isOnLine = Math.abs(cross) <= lineThreshold;
    if (!isOnLine) {
        return false;
    }

    const isBetweenPoints =
        Math.abs(dxl) >= Math.abs(dyl)
            ? dxl > 0
                ? linePointA[0] <= testPoint[0] && testPoint[0] <= linePointB[0]
                : linePointB[0] <= testPoint[0] && testPoint[0] <= linePointA[0]
            : dyl > 0
            ? linePointA[1] <= testPoint[1] && testPoint[1] <= linePointB[1]
            : linePointB[1] <= testPoint[1] && testPoint[1] <= linePointA[1];

    return isBetweenPoints;
};
