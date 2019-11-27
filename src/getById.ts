export const getById = (id: string) => {
  const el = document.getElementById(id);
  if (el === null) {
    throw new Error(`could not find element with id: ${id}`);
  }
  return el;
};
