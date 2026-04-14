import React, { memo, useCallback } from 'react';
import { Handle, Position, NodeProps, Node, useNodeConnections } from '@xyflow/react';
import { nodeContainer, nodeHeaderSolid, execHandleStyle, dataHandleStyle, nodeSelectStyle, inlineInputStyle } from '../../utils/nodeStyles';
import { getTypeColor } from '../../utils/theme';
import type { ScannerNodeData } from '../../utils/nodeTypes';

const ACCENT = '#27ae60';
const PROMPT_COLOR = getTypeColor('String');

const SCANNER_OUTPUT_TYPES: Record<string, string> = {
  nextLine: 'String',
  nextInt: 'int',
  nextFloat: 'float',
  nextDouble: 'double',
  nextLong: 'long',
  nextBoolean: 'boolean',
};

const READ_OPTIONS = [
  { value: 'nextLine', label: 'nextLine → String' },
  { value: 'nextInt', label: 'nextInt → int' },
  { value: 'nextFloat', label: 'nextFloat → float' },
  { value: 'nextDouble', label: 'nextDouble → double' },
  { value: 'nextLong', label: 'nextLong → long' },
  { value: 'nextBoolean', label: 'nextBoolean → boolean' },
];

const ScannerNode = ({ id, data, selected }: NodeProps<Node<ScannerNodeData>>) => {
  const readType = (data.readType as string) || 'nextLine';
  const outputType = SCANNER_OUTPUT_TYPES[readType] || 'String';
  const outputColor = getTypeColor(outputType);

  const promptConnections = useNodeConnections({ handleType: 'target', handleId: 'data-in-prompt' });
  const isPromptConnected = promptConnections.length > 0;

  const onReadTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const update = data.updateNodeData as ((id: string, d: Record<string, unknown>) => void) | undefined;
    if (update) update(id, { readType: e.target.value });
  }, [id, data.updateNodeData]);

  const onPromptChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const update = data.updateNodeData as ((id: string, d: Record<string, unknown>) => void) | undefined;
    if (update) update(id, { inlinePrompt: e.target.value });
  }, [id, data.updateNodeData]);

  return (
    <div style={{ ...nodeContainer(ACCENT, !!selected), minWidth: '180px' }}>
      <div className="devflow-header-shimmer" style={{ ...nodeHeaderSolid(ACCENT), display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', position: 'relative' }}>
          <Handle type="target" position={Position.Left} id="exec-in" title="Execution in" style={execHandleStyle('left')} />
          <span>📥 SCANNER</span>
        </div>
        <div style={{ position: 'relative' }}>
          <Handle type="source" position={Position.Right} id="exec-out" title="Execution out" style={execHandleStyle('right')} />
        </div>
      </div>

      <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <select value={readType} onChange={onReadTypeChange} style={{ ...nodeSelectStyle, color: outputColor }}>
          {READ_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Handle type="target" position={Position.Left} id="data-in-prompt" title="Prompt message (String)" style={{ ...dataHandleStyle(PROMPT_COLOR, 'left'), left: '-16px' }} />
            {isPromptConnected ? (
              <span style={{ fontSize: '10px', color: PROMPT_COLOR }}>Prompt</span>
            ) : (
              <input
                className="nodrag"
                value={(data.inlinePrompt as string) ?? ''}
                onChange={onPromptChange}
                placeholder="prompt..."
                style={{ ...inlineInputStyle, color: PROMPT_COLOR }}
              />
            )}
          </div>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', color: outputColor, fontWeight: 'bold' }}>Value</span>
            <Handle type="source" position={Position.Right} id="data-out" title={`Output (${outputType})`} style={{ ...dataHandleStyle(outputColor, 'right'), right: '-16px' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(ScannerNode);
