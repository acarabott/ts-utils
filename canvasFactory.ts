export const canvasFactory = (
  width: number,
  height: number,
  contextAttributes?: CanvasRenderingContext2DSettings,
) => {
  return resizeCanvas(document.createElement("canvas"), width, height, contextAttributes);
};

export const resizeCanvas = (
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  contextAttributes?: CanvasRenderingContext2DSettings,
  cachedCtx?: CanvasRenderingContext2D,
) => {
  const newWidth = width * devicePixelRatio;
  const newHeight = height * devicePixelRatio;
  let ctx: CanvasRenderingContext2D;

  const getContext = () => {
    const context =
      cachedCtx === undefined ? canvas.getContext("2d", contextAttributes) : cachedCtx;

    if (context === null) {
      throw Error("canvas context is null!");
    }

    return context;
  };

  if (canvas.width !== newWidth || canvas.height !== newHeight) {
    canvas.width = newWidth;
    canvas.height = newHeight;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.style.transformOrigin = "top left";
    ctx = getContext();

    const transform = ctx.getTransform();
    if (transform.a !== devicePixelRatio || transform.d !== devicePixelRatio) {
      ctx.scale(devicePixelRatio, devicePixelRatio);
    }
  } else {
    ctx = getContext();
  }

  return { canvas, ctx, width, height };
};
