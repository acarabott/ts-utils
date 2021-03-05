export enum TimerMessageType {
  Start = "start",
  Stop = "stop",
  IntervalMs = "intervalMs",
}

export interface ITimerMessage {
  type: TimerMessageType;
  intervalMs?: number;
}

export const TICK_MESSAGE = "tick";
