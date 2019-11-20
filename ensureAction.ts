import { onReady } from "../utils/onReady";

export const ensureAction = (
  action: () => any,
  events: Array<keyof HTMLElementEventMap> = ["click", "keydown", "touchstart", "touchend"],
) => {
  onReady(() => {
    const wrappedAction = async () => {
      await action();
      for (const event of events) {
        document.body.removeEventListener(event, wrappedAction, false);
      }
    };

    for (const event of events) {
      document.body.addEventListener(event, wrappedAction, false);
    }
  });
};
