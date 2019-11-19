export const parseSvgSrc = (src: string): SVGSVGElement => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(src, "image/svg+xml");
  const svg = doc.firstChild as SVGSVGElement;
  if (svg === null) {
    throw new Error("svg is null!");
  }

  return svg;
};
