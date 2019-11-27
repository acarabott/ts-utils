export const appendInDiv = (...elements: HTMLElement[]) => {
  const div = document.createElement("div");
  elements.forEach(el => div.appendChild(el));
  document.body.appendChild(div);
};
