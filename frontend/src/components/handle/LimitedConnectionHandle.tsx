import { Handle, useNodeConnections } from "@xyflow/react";
import type { LimitedConnectionHandleProps } from "./handleTypes";

const LimitedConnectionHandle = (props: LimitedConnectionHandleProps) => {
  const { connectionCount = 1, ...restProps } = props;
  const connections = useNodeConnections({
    handleType: restProps.type,
  });

  return (
    <Handle
      {...restProps}
      isConnectable={connections.length < connectionCount}
    />
  );
};

export default LimitedConnectionHandle;
