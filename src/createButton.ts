export const createButton = (text: string, onclick: () => void) => {
  const button = document.createElement("button");
  button.textContent = text;
  button.onclick = onclick;

  return button;
};
