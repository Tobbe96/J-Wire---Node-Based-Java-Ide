import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { nodeContainer, nodeHeaderSolid, execHandleStyle } from '../../utils/nodeStyles';
import { SWING_COLOR } from './SwingAppNode';

const bold: React.CSSProperties = { fontSize: '11px', color: '#fff', fontWeight: 'bold' };
const row: React.CSSProperties = { display: 'flex', alignItems: 'center', position: 'relative' };
const between: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' };
const col: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '12px' };
const varInp: React.CSSProperties = { background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#ccc', padding: '2px 5px', fontSize: '10px', outline: 'none', borderRadius: '3px', width: '75px' };
const opSel: React.CSSProperties = { background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#ccc', padding: '2px 3px', fontSize: '10px', outline: 'none', cursor: 'pointer', borderRadius: '3px', marginTop: '3px' };

const OP_LABELS: Record<string, string> = {
  addActionListener: 'Action Listener', addMouseListener: 'Mouse Listener',
  addKeyListener: 'Key Listener', addChangeListener: 'Change Listener',
  addItemListener: 'Item Listener',
};
const OPS = Object.keys(OP_LABELS);

type Props = { id: string; data: Record<string, unknown>; selected?: boolean };

const SwingEventOpNode = ({ data, selected, id }: Props) => {
  const op = (data.operation as string) || 'addActionListener';
  const varName = (data.variableName as string) || 'control';
  const update = data.updateNodeData as ((i: string, d: Record<string, unknown>) => void) | undefined;

  return (
    <div style={{ ...nodeContainer(SWING_COLOR, !!selected), minWidth: '230px' }}>
      <div className="jflow-header-shimmer" style={nodeHeaderSolid(SWING_COLOR)}>⚡ Event: {OP_LABELS[op] ?? op}</div>
      <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
          <input className="nodrag" value={varName} onChange={e => update?.(id, { variableName: e.target.value })} style={varInp} placeholder="controlName" />
          <select className="nodrag" value={op} onChange={e => update?.(id, { operation: e.target.value })} style={{ ...opSel, marginTop: 0, color: SWING_COLOR }}>
            {OPS.map(o => <option key={o} value={o}>{OP_LABELS[o]}</option>)}
          </select>
        </div>
        <div style={between}>
          <div style={row}>
            <Handle type="target" position={Position.Left} id="exec-in" style={{ ...execHandleStyle('left'), left: '-6px' }} />
            <span style={bold}>Exec</span>
          </div>
          <div style={col}>
            <div style={row}><span style={{ ...bold, marginRight: '5px' }}>Out</span><Handle type="source" position={Position.Right} id="exec-out" style={{ ...execHandleStyle('right'), right: '-6px' }} /></div>
            <div style={row}><span style={{ fontSize: '10px', color: '#fbbf24', marginRight: '5px' }}>body →</span><Handle type="source" position={Position.Right} id="event-body" style={{ ...execHandleStyle('right'), right: '-6px', background: '#fbbf24' }} /></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(SwingEventOpNode);
