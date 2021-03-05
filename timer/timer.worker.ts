const ctx: Worker = self as any;

// can't easily share these as Workers don't yet support modules (import/export)
// and using importScripts doesn't work as interfaces are compile typescript
// could do some bash appending stuff, but they are minimal enough to maintain

// timer.types.ts
// --------------------------------------------------------------------
enum TimerMessageType {
  Start = "start",
  Stop = "stop",
  IntervalMs = "intervalMs",
}

interface ITimerMessage {
  type: TimerMessageType;
  intervalMs?: number;
}

const TICK_MESSAGE = "tick";
// --------------------------------------------------------------------

function isTimerMessage(message: any): message is ITimerMessage {
  return Object.values(TimerMessageType).includes(message.type);
}

const DEAD_TIMER_ID = -1;
let timerId = DEAD_TIMER_ID;
let intervalMs = 25;

function tick() {
  timerId = self.setInterval(() => ctx.postMessage(TICK_MESSAGE), intervalMs);
}

ctx.addEventListener("message", event => {
  const message: ITimerMessage = event.data;
  if (!isTimerMessage(message)) {
    throw new Error("Message is not an ITimerMessage");
  }

  if (message.type === TimerMessageType.Start) {
    tick();
  } else if (message.type === TimerMessageType.Stop) {
    clearInterval(timerId);
    timerId = DEAD_TIMER_ID;
  } else if (message.type === TimerMessageType.IntervalMs) {
    if (message.intervalMs === undefined) {
      throw new Error("intervalMs missing from ITimerMessage");
    }

    intervalMs = message.intervalMs;
    if (timerId !== DEAD_TIMER_ID) {
      clearInterval(timerId);
      tick();
    }
  }
});
