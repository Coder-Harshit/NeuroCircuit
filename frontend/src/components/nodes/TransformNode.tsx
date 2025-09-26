// import { Handle, Position } from '@xyflow/react';

// // The 'data' prop is passed from your node definition.
// // It contains the label and any other custom data.
// function TransformNode({ data }: { data: { label: string } }) {
//   return (
//     <div style={{
//       background: '#f0f0f0',
//       border: '1px solid #ddd',
//       padding: '10px 15px',
//       borderRadius: '5px',
//       width: '180px',
//       textAlign: 'center',
//       fontSize: '14px',
//     }}>
//       <div>{data.label}</div>
//       {/* This is the connection point (the handle) */}
//       <Handle type="source" position={Position.Right} />
//       <Handle type="target" position={Position.Left} />
//     </div>
//   );
// }

// export default TransformNode;

import { Handle, Position } from '@xyflow/react';
import styles from './TransformNode.module.css'; // Import the CSS module

function TransformNode({ data }: { data: { label: string } }) {
  return (
    // Use the class name from our CSS module
    <div className={styles.transformNode}>
      {/* A distinct header for the node title */}
      <div className={styles.header}>
        {data.label}
      </div>

      {/* A body for any future content or controls */}
      <div className={styles.body}>
        Transform Data
      </div>

      {/* Handles with unique IDs */}
      <Handle id="a" type="source" position={Position.Right} />
      <Handle id="b" type="target" position={Position.Left} />
    </div>
  );
}

export default TransformNode;