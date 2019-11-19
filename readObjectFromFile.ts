export const readObjectFromFile = async <T>(
  file: File,
  typeGuard: (data: any) => data is T,
): Promise<T> => {
  return new Promise(async (success, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const data = reader.result;
      if (typeof data === "string") {
        const parsed = JSON.parse(data);
        if (typeGuard(parsed)) {
          success(parsed);
        } else {
          reject("did not pass type guard");
        }
      } else {
        reject("is not stored as string");
      }
    };
    reader.onerror = () => reject("could not read file");

    reader.readAsText(file);
  });
};
