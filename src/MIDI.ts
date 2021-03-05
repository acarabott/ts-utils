let access: WebMidi.MIDIAccess | undefined = undefined;

const NUM_BITS = 7;
const MAX_7BIT = Math.pow(2, 7) - 1;
const MAX_14BIT = Math.pow(2, 14) - 1;

const CHANNEL_VOICE_MESSAGE_MIN = 0b10000000;
const CHANNEL_VOICE_MESSAGE_MAX = 0b11100000;

const COMMAND_MASK = 0b11110000;
const CHANNEL_MASK = 0b00001111;

// eslint-disable-next-line no-shadow
const enum Command {
    NoteOff = 0b10000000,
    NoteOn = 0b10010000,
    PolyphonicAftertouch = 0b10100000,
    ControlChange = 0b10110000,
    ProgramChange = 0b11000000,
    ChannelPressure = 0b11010000,
    PitchBend = 0b11100000,
}

export class MIDI {
    public static get ready() {
        return new Promise((success, reject) => {
            if (!MIDI.available) {
                reject();
            }

            navigator
                .requestMIDIAccess()
                .then((midiAccess) => {
                    access = midiAccess;
                    success(this);
                })
                .catch(reject);
        });
    }

    public static get available() {
        return navigator.requestMIDIAccess !== undefined;
    }

    public static get access() {
        return access;
    }

    public static get inputs() {
        return [...(access?.inputs.values() ?? [])];
    }

    public static get outputs() {
        return [...(access?.outputs.values() ?? [])];
    }

    public static findDevice(type: "in" | "out", id: string) {
        // eslint-disable-next-line no-undef
        const ports: Array<WebMidi.MIDIInput | WebMidi.MIDIOutput> =
            MIDI[({ in: "inputs", out: "outputs" } as const)[type]];

        return ports.find((port) => port.id === id);
    }

    /* eslint-disable no-undef */
    protected _inPort?: WebMidi.MIDIInput;
    protected _outPort?: WebMidi.MIDIOutput;
    /* eslint-disable no-undef */

    /* eslint-disable @typescript-eslint/no-empty-function */
    public onMidiMessage: (_event: WebMidi.MIDIMessageEvent) => void = () => {};
    public onNoteOn: (_note: number, _velocityNorm: number, _channel: number) => void = () => {};
    public onNoteOff: (_note: number, _velocityNorm: number, _channel: number) => void = () => {};
    public onControl: (_control: number, _valueNorm: number) => void = () => {};
    public onPitchBend: (_valueNorm: number) => void = () => {};
    /* eslint-disable @typescript-eslint/no-empty-function */

    public setDeviceId(type: "in" | "out", id: string | undefined) {
        return new Promise<void>((success, reject) => {
            MIDI.ready
                .then(async () => {
                    if (type === "in") {
                        await this._inPort?.close();
                        this._inPort = undefined;
                    } else if (type === "out") {
                        await this._outPort?.close();
                        this._outPort = undefined;
                    }

                    if (id === undefined) {
                        success();
                        return;
                    }

                    const port = MIDI.findDevice(type, id);
                    port?.open()
                        .then(() => {
                            if (type === "in") {
                                this._inPort = port as WebMidi.MIDIInput;
                                this._inPort.onmidimessage = (event) => this._onMidiMessage(event);
                                this._inPort.onstatechange = (event) => {
                                    if (event.port.state === "disconnected") {
                                        this._inPort = undefined;
                                        void this.setDeviceId(type, id);
                                    }
                                };
                            } else if (type === "out") {
                                this._outPort = port as WebMidi.MIDIOutput;
                                port.onstatechange = (event) => {
                                    if (event.port.state === "disconnected") {
                                        this._outPort = undefined;
                                        void this.setDeviceId(type, id);
                                    }
                                };
                            }
                        })
                        .catch(() => {
                            reject("Could not open port");
                        });
                })
                .catch(() => {
                    reject("MIDI not available");
                });
        });
    }

    public get inPort() {
        return this._inPort;
    }

    public async close() {
        return Promise.all([this._inPort?.close(), this._outPort?.close()]);
    }

    public noteOn(note: number, velocityNorm: number, channel: number, timestamp?: number) {
        this.send(this.createNoteData(Command.NoteOn, note, velocityNorm, channel), timestamp);
    }

    public noteOff(note: number, velocityNorm: number, channel: number, timestamp?: number) {
        this.send(this.createNoteData(Command.NoteOff, note, velocityNorm, channel), timestamp);
    }

    protected createNoteData(
        type: Command.NoteOn | Command.NoteOff,
        note: number,
        velocityNorm: number,
        channel: number,
    ): [number, number, number] {
        return [type | channel, note & MAX_7BIT, Math.round(velocityNorm * MAX_7BIT)];
    }

    protected send(data: [number, number, number], timestamp?: number) {
        if (this._outPort === undefined) {
            return;
        }

        this._outPort.send(data, timestamp);
    }

    protected _onMidiMessage(event: WebMidi.MIDIMessageEvent) {
        this.onMidiMessage?.(event);

        const command = event.data[0] & (COMMAND_MASK as Command);

        if (command >= CHANNEL_VOICE_MESSAGE_MIN && command <= CHANNEL_VOICE_MESSAGE_MAX) {
            const channel = event.data[0] & CHANNEL_MASK;

            switch (command) {
                case Command.NoteOn:
                    {
                        const note = event.data[1];
                        const velocity = event.data[2] / MAX_7BIT;
                        this.onNoteOn(note, velocity, channel);
                    }
                    break;
                case Command.NoteOff:
                    {
                        const note = event.data[1];
                        const velocity = event.data[2] / MAX_7BIT;
                        this.onNoteOff(note, velocity, channel);
                    }
                    break;
                case Command.ControlChange:
                    {
                        const control = event.data[1];
                        const value = event.data[2] / MAX_7BIT;
                        this.onControl(control, value);
                    }
                    break;
                case Command.PitchBend:
                    {
                        const leastSignificantByte = event.data[1];
                        const mostSignificantByte = event.data[2];
                        const value14bit = (mostSignificantByte << NUM_BITS) | leastSignificantByte;
                        const value = value14bit / MAX_14BIT;
                        this.onPitchBend(value);
                    }
                    break;

                default:
                    break;
            }
        }
    }
}
