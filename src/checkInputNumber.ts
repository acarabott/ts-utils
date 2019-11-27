export const checkInputNumber = (update: (value: number) => void) => {
  return (event: Event) => {
    const value = (event.target as HTMLInputElement).valueAsNumber;
    if (Number.isFinite) {
      update(value);
    }
  };
};
