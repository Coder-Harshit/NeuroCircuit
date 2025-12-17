import { Handle, type HandleProps } from "@xyflow/react";
import { handleColorEncoding, type HandleType } from "../../themeConfig";

interface TypedHandleProps extends Omit<HandleProps, "id"> {
  id: string;
  dataType: HandleType;
}

export function TypedHandle({
  id,
  dataType,
  style,
  ...props
}: TypedHandleProps) {
  const color = handleColorEncoding[dataType];

  // ID -> TypedID
  // "imgOutput" -> "imgOutput__IMAGE"
  const typedId = `${id}__${dataType}`;

  return (
    <Handle
      id={typedId}
      style={{
        ...style,
        backgroundColor: color,
        // borderColor: color,
        width: "10px",
        height: "10px",
      }}
      {...props}
    />
  );
}
