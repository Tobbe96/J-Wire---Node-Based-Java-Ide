import React, { memo } from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { nodeContainer, nodeHeaderSolid } from '../../utils/nodeStyles';
import { getTypeColor } from '../../utils/theme';
import type { MathFuncNodeData } from '../../utils/nodeTypes';

const ACCENT = '#2980b9';
const INT_COLOR = getTypeColor('int');

const MathFuncNode = ({ data, selected }: NodeProps<Node<MathFuncNodeData>>) => {
  const op = data.operation as string;
  const isSingleInput = op === 'abs';

  return (
    <div style={{ ...nodeContainer(ACCENT, !!selected), minWidth: '150px' }}>
      <div className="jflow-header-shimmer" style={nodeHeaderSolid(ACCENT)}>
        Math.{op}()
      </div>

      <div style={{ padding: '10px', display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {isSingleInput ? (
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Handle type="target" position={Position.Left} id="data-in" style={{ background: INT_COLOR, width: '10px', height: '10px', left: '-16px' }} />
              <span style={{ fontSize: '11px', color: '#ccc' }}>Value</span>
            </div>
          ) : (
            <>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Handle type="target" position={Position.Left} id="data-in-a" style={{ background: INT_COLOR, width: '10px', height: '10px', left: '-16px' }} />
                <span style={{ fontSize: '11px', color: '#ccc' }}>A</span>
              </div>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Handle type="target" position={Position.Left} id="data-in-b" style={{ background: INT_COLOR, width: '10px', height: '10px', left: '-16px' }} />
                <span style={{ fontSize: '11px', color: '#ccc' }}>B</span>
              </div>
            </>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
          <span style={{ fontSize: '11px', color: '#fff', fontWeight: 'bold' }}>Result</span>
          <Handle type="source" position={Position.Right} id="data-out" style={{ background: INT_COLOR, width: '10px', height: '10px', right: '-16px' }} />
        </div>
      </div>
    </div>
  );
};

export default memo(MathFuncNode);
