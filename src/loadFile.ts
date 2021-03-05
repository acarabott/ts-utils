export const loadFile = (url: string) => {
    return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest();
        request.open("GET", url, true);
        request.addEventListener("load", () => {
            if (request.status === 200) {
                resolve(request.response);
            } else {
                reject(`failed to load ${url}`);
            }
        });
        request.addEventListener("error", () => reject(`failed to load ${url}`));
        request.send();
    });
};
