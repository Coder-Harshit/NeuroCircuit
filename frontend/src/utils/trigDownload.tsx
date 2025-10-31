export const triggerBrowserDownload = (filename: string) => {
  const url = `http://127.0.0.1:8000/files/download?filepath=${encodeURIComponent(filename)}`;

  // Create a temporary link element to trigger the download
  const link = document.createElement("a");
  link.href = url;

  // The 'download' attribute suggests a filename to the browser
  link.setAttribute("download", filename);

  // Append to the document, click, and then remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const triggerJSONDownload = (data: object, filename: string) => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);

  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
