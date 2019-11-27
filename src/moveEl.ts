export const moveEl = (parent: HTMLElement, oldIndex: number, newIndex: number) => {
  if (oldIndex === newIndex) {
    return;
  }
  if (oldIndex < 0 || oldIndex >= parent.children.length) {
    throw new RangeError(`No child element at oldIndex ${oldIndex}`);
  }
  if (newIndex < 0 || newIndex >= parent.children.length) {
    throw new RangeError(`No child element at newIndex ${newIndex}`);
  }

  const toMove = parent.children[oldIndex];
  const target =
    newIndex > oldIndex ? parent.children[newIndex].nextElementSibling : parent.children[newIndex];

  parent.insertBefore(toMove, target);
};
