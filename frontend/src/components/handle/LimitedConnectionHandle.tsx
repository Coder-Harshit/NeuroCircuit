import { Handle, useNodeConnections } from '@xyflow/react';
import type { LimitedConnectionHandleProps } from './handleTypes';

const LimitedConnectionHandle = (props: LimitedConnectionHandleProps) => {
  const connections = useNodeConnections({
    handleType: props.type,
  });

  return (
    <Handle
      {...props}
      isConnectable={connections.length < props.connectionCount}
    />
  );
};

export default LimitedConnectionHandle;