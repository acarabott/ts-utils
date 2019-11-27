export const printDom = (text: string, title = false) => {
  const div = document.createElement(title ? "h2" : "div");
  div.textContent = text;
  document.body.appendChild(div);
  return div;
};
