// tslint:disable:no-bitwise

let inputs: WebMidi.MIDIInput[] = [];

const NOTE_OFF = 0x80;
const NOTE_ON = 0x90;
const CONTROL_CHANGE = 0xB0;
const PITCHBEND = 0xE0;

export class MIDIIn {
  public static get ready(): Promise<boolean> {
    return new Promise(async success => {
      if (navigator.requestMIDIAccess === undefined) {
        success(false);
        return;
      }

      const access = await navigator.requestMIDIAccess();
      inputs = Array.from(access.inputs.values());

      success(true);
    });
  }

  public static get inputs() { return inputs; }

  public readonly manufacturer: string;
  public readonly name: string;

  protected _device?: WebMidi.MIDIInput;

  constructor(manufacturer: string, name: string) {
    if (navigator.requestMIDIAccess === undefined) {
      throw new Error("WebMIDI not available");
    }

    this.manufacturer = manufacturer;
    this.name = name;
    this.findDevice();
  }

  get device() { return this._device; }

  // tslint:disable:no-empty
  public onMidiMessage(_event: WebMidi.MIDIMessageEvent) {}
  public onNoteOn(_note: number, _velocityNorm: number, _channel: number) {}
  public onNoteOff(_note: number, _velocityNorm: number, _channel: number) {}
  public onControl(_control: number, _valueNorm: number) {}
  public onPitchBend(_valueNorm: number) {}
  // tslint:enable:no-empty


  protected findDevice() {
    this._device = MIDIIn.inputs.find(device => {
      return device.manufacturer === this.manufacturer &&
             device.name === this.name;
    });

    if (this._device === undefined) {
      throw new Error(`Could not find MIDI device ${this.manufacturer} ${this.name}`);
    }

    this._device.onstatechange = event => {
      if (event.port.state === "disconnected") {
        this.findDevice();
      }
    };

    this._device.onmidimessage = event => this._onMidiMessage(event);
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
    }
    else if (type === NOTE_ON) {
      const note = event.data[1];
      const velocity = event.data[2] / 127;
      this.onNoteOn(note, velocity, channel);
    }
    else if (type === CONTROL_CHANGE) {
      const control = event.data[1];
      const value = event.data[2] / 127;
      this.onControl(control, value);
    }
    else if (type === PITCHBEND) {
      const leastSignificantByte = event.data[1];
      const mostSignificantByte = event.data[2];
      const value14bit = (mostSignificantByte << 7) | leastSignificantByte;
      const value = value14bit / 16383;
      this.onPitchBend(value);
    }
  }
}
