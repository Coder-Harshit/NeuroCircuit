import { Handle, useNodeConnections, type HandleProps } from '@xyflow/react';

const SingleConnectionHandle = (props: HandleProps) => {
  const connections = useNodeConnections({
    handleType: props.type,
  });

  return (
    <Handle
      {...props}
      isConnectable={connections.length < 1}
    />
  );
};

export default SingleConnectionHandle;