export const loadAudioFile = (audioContext: BaseAudioContext, url: string) => {
    const request = new XMLHttpRequest();
    const promise = new Promise<AudioBuffer>((resolve, reject) => {
        request.open("GET", url, true);
        request.responseType = "arraybuffer";

        request.onload = () => {
            if (request.status >= 200 && request.status < 400) {
                const onSuccess = (buffer: AudioBuffer) => resolve(buffer);
                audioContext.decodeAudioData(request.response, onSuccess, reject);
            } else {
                reject(`failed to load ${url}`);
            }
        };

        request.onerror = () => reject(`failed to load ${url}`);

        request.send();
    });

    return { request, promise };
};
