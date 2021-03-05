export class LFONode {
  public readonly context: BaseAudioContext;
  public readonly outputNode: GainNode;

  protected _min: number;
  protected _max: number;

  protected oscNode: OscillatorNode;
  protected mulNode: GainNode;
  protected addNode: ConstantSourceNode;
  protected minNode: ConstantSourceNode;

  constructor(context: BaseAudioContext) {
    this.context = context;

    this._min = 0.0;
    this._max = 1.0;

    this.oscNode = context.createOscillator();
    this.oscNode.type = "sine";
    this.oscNode.frequency.value = 4;

    this.addNode = context.createConstantSource();
    this.addNode.offset.value = 1;

    this.mulNode = context.createGain();
    this.minNode = context.createConstantSource();

    this.outputNode = context.createGain();

    this.oscNode.connect(this.mulNode);
    this.addNode.connect(this.mulNode); // signal is 0.0 to 2.0
    this.mulNode.connect(this.outputNode);
    this.minNode.connect(this.outputNode); // signal is min to min + 2.0 * mulNode.gain

    this.update();

    this.oscNode.start();
    this.addNode.start();
    this.minNode.start();
  }

  get frequency() {
    return this.oscNode.frequency;
  }

  get min() {
    return this._min;
  }
  set min(_) {
    throw new Error("use setRange");
  }

  get max() {
    return this._max;
  }
  set max(_) {
    throw new Error("use setRange");
  }

  public setRange(
    min: number,
    max: number,
    whenS = this.context.currentTime + 0.002,
  ) {
    if (min === this.min && max === this.max) {
      return;
    }

    this._min = min;
    this._max = max;
    this.update(whenS);
  }

  public connect(
    destination: AudioNode | AudioParam,
    output?: number,
    input?: number,
  ) {
    if (destination instanceof AudioNode) {
      this.outputNode.connect(destination, output, input);
      return destination;
    }

    this.outputNode.connect(destination, output);
    return undefined;
  }

  public disconnect(
    outputOrDestination?: number | AudioNode | AudioParam,
    output?: number,
    input?: number,
  ): void {
    this.oscNode.stop();
    this.oscNode.disconnect();
    this.mulNode.disconnect();
    this.addNode.stop();
    this.addNode.disconnect();
    this.minNode.stop();
    this.minNode.disconnect();

    if (outputOrDestination === undefined) {
      this.outputNode.disconnect();
    } else if (typeof outputOrDestination === "number") {
      this.outputNode.disconnect(outputOrDestination);
    } else if (outputOrDestination instanceof AudioParam) {
      this.outputNode.disconnect(outputOrDestination);
    } else if (outputOrDestination instanceof AudioNode) {
      if (output !== undefined && input !== undefined) {
        this.outputNode.disconnect(outputOrDestination, output, input);
      } else if (output !== undefined && input === undefined) {
        this.outputNode.disconnect(outputOrDestination, output);
      } else {
        this.outputNode.disconnect(outputOrDestination);
      }
    }
  }

  protected get range() {
    return this.max - this.min;
  }

  protected update(endTimeS = this.context.currentTime + 0.02) {
    this.mulNode.gain.linearRampToValueAtTime(this.range / 2, endTimeS);
    this.minNode.offset.linearRampToValueAtTime(this.min, endTimeS);
  }
}
