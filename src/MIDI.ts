// tslint:disable:no-bitwise

let inputs: WebMidi.MIDIInput[] = [];
let outputs: WebMidi.MIDIOutput[] = [];

const NOTE_OFF = 0x80;
const NOTE_ON = 0x90;
const CONTROL_CHANGE = 0xb0;
const PITCHBEND = 0xe0;

export class MIDI {
  public static get ready(): Promise<boolean> {
    return new Promise(async success => {
      if (navigator.requestMIDIAccess === undefined) {
        success(false);
        return;
      }

      const access = await navigator.requestMIDIAccess();
      inputs = Array.from(access.inputs.values());
      outputs = Array.from(access.outputs.values());

      access.onstatechange = _event => {
        // TODO subscription to events
      };

      success(true);
    });
  }

  public static get inputs() {
    return inputs;
  }

  public static get outputs() {
    return outputs;
  }

  protected _inPort?: WebMidi.MIDIInput;
  protected _outPort?: WebMidi.MIDIOutput;

  constructor() {
    if (navigator.requestMIDIAccess === undefined) {
      throw new Error("WebMIDI not available");
    }
  }

  public get inPort() {
    return this._inPort;
  }

  public get inId() {
    return this._inPort === undefined ? undefined : this._inPort.id;
  }

  public set inId(inId: string | undefined) {
    MIDI.ready.then(() => {
      if (this._inPort !== undefined) {
        this._inPort.close();
      }

      if (inId !== undefined) {
        const port = this.findDevice(inId, "inputs") as WebMidi.MIDIInput;
        port.open().then(() => {
          this._inPort = port;
          port.onmidimessage = event => this._onMidiMessage(event);
          port.onstatechange = event => {
            if (event.port.state === "disconnected") {
              this._inPort = undefined;
              this.inId = inId;
            }
          };
        });
      }
    });
  }

  public get outPort() {
    return this._outPort;
  }

  public get outId() {
    return this._outPort === undefined ? undefined : this._outPort.id;
  }

  public set outId(outId: string | undefined) {
    MIDI.ready.then(() => {
      if (this._outPort !== undefined) {
        this._outPort.close();
      }

      if (outId !== undefined) {
        const port = this.findDevice(outId, "outputs") as WebMidi.MIDIOutput;
        port.open().then(() => {
          this._outPort = port;
          port.onstatechange = event => {
            if (event.port.state === "disconnected") {
              this._outPort = undefined;
              this.outId = outId;
            }
          };
        });
      }
    });
  }

  // tslint:disable:no-empty
  public onMidiMessage(_event: WebMidi.MIDIMessageEvent) {}
  public onNoteOn(_note: number, _velocityNorm: number, _channel: number) {}
  public onNoteOff(_note: number, _velocityNorm: number, _channel: number) {}
  public onControl(_control: number, _valueNorm: number) {}
  public onPitchBend(_valueNorm: number) {}
  // tslint:enable:no-empty

  public close() {
    if (this._inPort !== undefined) {
      this._inPort.close();
    }
  }

  public noteOn(note: number, velocityNorm: number, channel: number) {
    this.send([
      this.setChannel(NOTE_ON, channel),
      this.setNoteNumber(note),
      this.setVelocity(velocityNorm),
    ]);
  }

  public noteOff(note: number, velocityNorm: number, channel: number) {
    this.send([
      this.setChannel(NOTE_OFF, channel),
      this.setNoteNumber(note),
      this.setVelocity(velocityNorm),
    ]);
  }

  protected findDevice(id: string, type: "inputs" | "outputs") {
    const ports: Array<WebMidi.MIDIInput | WebMidi.MIDIOutput> = MIDI[type];
    const foundPort = ports.find(port => port.id === id);

    if (foundPort === undefined) {
      throw new Error(`Could not find MIDI port with id ${id}
Available IDs are: ${ports.map(port => port.id).join(", ")}`);
    }

    return foundPort;
  }

  protected send(data: [number, number, number]) {
    if (this._outPort === undefined) {
      return;
    }

    this._outPort.send(data);
  }

  protected setChannel(value: number, channel: number) {
    if (channel < 0 || channel > 15) {
      throw new RangeError("Channel should be between 1 and 15");
    }

    return value | channel;
  }

  protected setNoteNumber(noteNumber: number) {
    return noteNumber & 127;
  }

  protected setVelocity(velocityNorm: number) {
    return Math.round(velocityNorm * 127);
  }

  protected _onMidiMessage(event: WebMidi.MIDIMessageEvent) {
    this.onMidiMessage(event);

    const type = event.data[0] & 0xf0;
    const channel = event.data[0] & 0x0f;

    // TODO gain should be logarithmic...

    if (type === NOTE_OFF) {
      const note = event.data[1];
      const velocity = event.data[2] / 127;
      this.onNoteOff(note, velocity, channel);
    } else if (type === NOTE_ON) {
      const note = event.data[1];
      const velocity = event.data[2] / 127;
      this.onNoteOn(note, velocity, channel);
    } else if (type === CONTROL_CHANGE) {
      const control = event.data[1];
      const value = event.data[2] / 127;
      this.onControl(control, value);
    } else if (type === PITCHBEND) {
      const leastSignificantByte = event.data[1];
      const mostSignificantByte = event.data[2];
      const value14bit = (mostSignificantByte << 7) | leastSignificantByte;
      const value = value14bit / 16383;
      this.onPitchBend(value);
    }
  }
}
