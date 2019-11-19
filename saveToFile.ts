export const saveToFile = (filename: string, data: string, mimeType: string) => {
  const blob = new Blob([data], { type: mimeType });
  const link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};

export const saveToJson = (filename: string, data: any) => {
  saveToFile(filename, JSON.stringify(data), "application/json");
};
