export const createNumberBox = (
  id: string,
  min: number,
  max: number,
  step: number,
  value: number,
  label: string,
  actions: { oninput?: (value: number) => void, onchange?: (value: number) => void },
) => {
  const inputEl = document.createElement("input");
  inputEl.id = id;
  inputEl.type = "number";
  inputEl.min = min.toString();
  inputEl.max = max.toString();
  inputEl.step = step.toString();
  inputEl.value = value.toString();

  if (actions.oninput !== undefined) {
    inputEl.oninput = () => {
      const newValue = inputEl.valueAsNumber;
      if (!Number.isFinite(newValue)) { return; }
      if (actions.oninput !== undefined) { actions.oninput(newValue); }
    };
  }

  if (actions.onchange !== undefined) {
    inputEl.onchange = () => {
      const newValue = inputEl.valueAsNumber;
      if (!Number.isFinite(newValue)) { return; }
      if (actions.onchange !== undefined) { actions.onchange(newValue); }
    };
  }

  const labelEL = document.createElement("label");
  labelEL.htmlFor = inputEl.id;
  labelEL.textContent = label;

  const parentEl = document.createElement("div");
  parentEl.appendChild(labelEL);
  parentEl.appendChild(inputEl);

  return parentEl;
};
