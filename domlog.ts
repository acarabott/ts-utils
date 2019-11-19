export const domlog = (value: any, elType = "div") => {
  const el = document.createElement(elType);
  el.textContent = value.toString();
  document.body.appendChild(el);
};
