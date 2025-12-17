// todo: change the COLOR NAME -> to CSS VARIABLES

export const handleColorEncoding = {
  DATAFRAME: "BLUE",
  IMAGE: "CYAN",
  NUMBER: "GREEN",
  STRING: "PINK",
  ANY: "GREY",
};

export type HandleType = keyof typeof handleColorEncoding;
