export const createSlider = (
  id: string,
  label: string,
  action: (value: number) => void,
  min = 0,
  max = 1,
  value = 1,
  step = 0.001,
  event: "input" | "change" = "input",
) => {
  const wrap = document.createElement("div");
  const slider = document.createElement("input");
  slider.id = id;
  slider.type = "range";
  slider.min = min.toString();
  slider.max = max.toString();
  slider.value = value.toString();
  slider.step = step.toString();
  slider.addEventListener(event, () => action(slider.valueAsNumber));
  const zoomLabel = document.createElement("label");
  zoomLabel.htmlFor = id;
  zoomLabel.textContent = label;

  wrap.appendChild(zoomLabel);
  wrap.appendChild(slider);

  return wrap;
};
