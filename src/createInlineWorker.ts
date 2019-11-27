export const createInlineWorker = (workerString: string): Worker => {
  const workerBlob = new Blob([workerString], { type: "text/javascript" });
  const timerUrl = window.URL.createObjectURL(workerBlob);
  return new Worker(timerUrl);
};
