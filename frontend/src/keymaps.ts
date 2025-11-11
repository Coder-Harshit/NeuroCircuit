// To change a shortcut, you only have to edit it here.
export const KEYMAPS = {
  SELECT_ALL: "ctrl+a, meta+a",
  COPY: "ctrl+c, meta+c",
  PASTE: "ctrl+v, meta+v",
  DUPLICATE: "ctrl+d, meta+d",
  DELETE: "Delete, Backspace",
  FIT_VIEW: "f",
};

/**
 * Formats a keymap string for display in the UI.
 * Example: "ctrl+a, meta+a" -> "Ctrl + A"
 */
export const formatKeymap = (keyString: string) => {
  const firstKey = keyString.split(",")[0]; // Take the first combo
  return firstKey
    .replace("meta", "Cmd")
    .replace("ctrl", "Ctrl")
    .replace("+", " + ")
    .split(" ")
    .map((k) => k.charAt(0).toUpperCase() + k.slice(1)) // Capitalize
    .join(" ");
};
