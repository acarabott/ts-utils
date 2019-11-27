export const createRadioButtons = <T_Enum>(id: string,
                                           options: T_Enum[],
                                           checked: T_Enum,
                                           onChange: (value: T_Enum) => void) => {
  const wrap = document.createElement("div");

  options.forEach(option => {
    const div = document.createElement("span");

    const input = (document.createElement("input") as HTMLInputElement);
    input.id = `${id}-${option}`;
    input.name = id;
    input.type = "radio";
    input.value = `${option}`;
    input.checked = checked === option;

    input.addEventListener("change", () => onChange(option));

    const label = document.createElement("label");
    label.htmlFor = input.id;
    label.textContent = `${option}`;

    div.appendChild(label);
    div.appendChild(input);
    wrap.appendChild(div);
  });

  return wrap;
};
