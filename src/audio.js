import { ensureAction } from "./ensureAction";

// oh Apple...

export function audioPolyfill() {
    const AudioContext = window.hasOwnProperty("AudioContext")
        ? window.AudioContext
        : window.hasOwnProperty("webkitAudioContext")
        ? window.webkitAudioContext
        : undefined;
    window.AudioContext = AudioContext;

    const OfflineAudioContext = window.hasOwnProperty("OfflineAudioContext")
        ? window.OfflineAudioContext
        : window.hasOwnProperty("webkitOfflineAudioContext")
        ? window.webkitOfflineAudioContext
        : undefined;

    window.OfflineAudioContext = OfflineAudioContext;

    if (window.OfflineAudioContext === undefined || window.AudioContext === undefined) {
        throw Error("This browser does not support the Web Audio API");
    }

    // copyToChannel polyfill
    // https://github.com/mohayonao/web-audio-api-shim

    if (!AudioBuffer.prototype.hasOwnProperty("copyToChannel")) {
        AudioBuffer.prototype.copyToChannel = function (source, channelNumber = 0, startInChannel = 0) {
            const end = Math.min(source.length, this.length - startInChannel);
            const clipped = source.subarray(0, end);
            this.getChannelData(channelNumber).set(clipped, startInChannel);
        };
    }

    if (!AudioBuffer.prototype.hasOwnProperty("copyFromChannel")) {
        AudioBuffer.prototype.copyFromChannel = function (destination, channelNumber = 0, startInChannel = 0) {
            const source = this.getChannelData(channelNumber).subarray(startInChannel);
            const end = Math.min(source.length, destination.length);
            const clipped = source.subarray(0, end);
            destination.set(clipped);
        };
    }

    // StereoPannerNode polyfill
    // https://github.com/mohayonao/stereo-panner-node
    function createCurve(func) {
        const N = 4096;
        return new Float32Array(N).map((v, i) => func((i / N) * Math.PI * 0.5));
    }
    const curveL = createCurve(Math.cos);
    const curveR = createCurve(Math.sin);
    const curveFix = new Float32Array([0, 0]);
    const curveDC = new Float32Array([1, 1]);

    function StereoPannerNode(audioContext, opts) {
        opts = opts || {};

        const splitter = audioContext.createChannelSplitter(2);
        const wsDC = audioContext.createWaveShaper();
        const wsFix = audioContext.createWaveShaper();
        const pan = audioContext.createGain();
        const wsL = audioContext.createWaveShaper();
        const wsR = audioContext.createWaveShaper();
        const gainL = audioContext.createGain();
        const gainR = audioContext.createGain();
        const merger = audioContext.createChannelMerger(2);
        const panValue = typeof opts.pan === "number" ? opts.pan : 0;

        splitter.channelCount = 2;
        splitter.channelCountMode = "explicit";
        splitter.channelInterpretation = "speakers";
        splitter.connect(gainL, 0);
        splitter.connect(gainR, 1);
        splitter.connect(wsDC, 1);
        splitter.connect(wsFix, 1);

        wsDC.channelCount = 1;
        wsDC.channelCountMode = "explicit";
        wsDC.channelInterpretation = "discrete";
        wsDC.curve = curveDC;
        wsDC.connect(pan);

        // GainNode mute sound when gain value is 0.
        // This node avoid to mute of GainNode for pan attribute. (#13)
        wsFix.channelCount = 1;
        wsFix.channelCountMode = "explicit";
        wsFix.channelInterpretation = "discrete";
        wsFix.curve = curveFix;
        wsFix.connect(pan.gain);

        pan.channelCount = 1;
        pan.channelCountMode = "explicit";
        pan.channelInterpretation = "discrete";
        pan.gain.setValueAtTime(panValue, audioContext.currentTime);
        pan.connect(wsL);
        pan.connect(wsR);

        wsL.channelCount = 1;
        wsL.channelCountMode = "explicit";
        wsL.channelInterpretation = "discrete";
        wsL.curve = curveL;
        wsL.connect(gainL.gain);

        wsR.channelCount = 1;
        wsR.channelCountMode = "explicit";
        wsR.channelInterpretation = "discrete";
        wsR.curve = curveR;
        wsR.connect(gainR.gain);

        gainL.channelCount = 1;
        gainL.channelCountMode = "explicit";
        gainL.channelInterpretation = "discrete";
        gainL.gain.setValueAtTime(0, audioContext.currentTime);
        gainL.connect(merger, 0, 0);

        gainR.channelCount = 1;
        gainR.channelCountMode = "explicit";
        gainR.channelInterpretation = "discrete";
        gainR.gain.setValueAtTime(0, audioContext.currentTime);
        gainR.connect(merger, 0, 1);

        merger.channelCount = 1;
        merger.channelCountMode = "explicit";
        merger.channelInterpretation = "discrete";

        Object.defineProperties(splitter, {
            connect: {
                configurable: true,
                enumerable: false,
                value: AudioNode.prototype.connect.bind(merger),
                writable: false,
            },
            disconnect: {
                configurable: true,
                enumerable: false,
                value: AudioNode.prototype.disconnect.bind(merger),
                writable: false,
            },
            pan: {
                configurable: true,
                enumerable: true,
                value: pan.gain,
                writable: false,
            },
        });

        return splitter;
    }

    if (AudioContext !== undefined && !("createStereoPanner" in AudioContext.prototype)) {
        Object.defineProperty(AudioContext.prototype, "createStereoPanner", {
            configurable: true,
            enumerable: false,
            value() {
                return new StereoPannerNode(this);
            },
            writable: false,
        });
    }

    if (typeof Symbol === "function" && typeof Symbol.hasInstance === "symbol") {
        Object.defineProperty(StereoPannerNode, Symbol.hasInstance, {
            value(value) {
                return value instanceof AudioNode && value.pan instanceof AudioParam;
            },
        });
    }
}

export const ensureMuteSwitchIsBypassed = () => {
    ensureAction(() => {
        // Play silent audio using an Audio Element to bypass iOS mute switch
        const audioEl = document.createElement("audio");
        audioEl.controls = false;
        audioEl.preload = "auto";
        audioEl.loop = false;
        // tslint:disable:max-line-length
        audioEl.src =
            "data:audio/mp3;base64,//MkxAAHiAICWABElBeKPL/RANb2w+yiT1g/gTok//lP/W/l3h8QO/OCdCqCW2Cw//MkxAQHkAIWUAhEmAQXWUOFW2dxPu//9mr60ElY5sseQ+xxesmHKtZr7bsqqX2L//MkxAgFwAYiQAhEAC2hq22d3///9FTV6tA36JdgBJoOGgc+7qvqej5Zu7/7uI9l//MkxBQHAAYi8AhEAO193vt9KGOq+6qcT7hhfN5FTInmwk8RkqKImTM55pRQHQSq//MkxBsGkgoIAABHhTACIJLf99nVI///yuW1uBqWfEu7CgNPWGpUadBmZ////4sL//MkxCMHMAH9iABEmAsKioqKigsLCwtVTEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVV//MkxCkECAUYCAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV";
        // tslint:enable:max-line-length
        audioEl.play();
    });
};

export const ensureAudioContextIsResumed = (audioContext) => {
    ensureAction(() => {
        return new Promise(async (resolve, reject) => {
            if (audioContext.state !== "suspended") {
                resolve();
            }

            await audioContext.resume();

            if (audioContext.state === "running") {
                resolve();
            } else {
                reject("Cannot resume AudioContext, as it has been closed");
            }
        });
    });
};
