import type { HandleProps } from "@xyflow/react";

export type LimitedConnectionHandleProps = HandleProps & {
  connectionCount: number;
};