import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { nodeContainer, nodeHeaderSolid, execHandleStyle, dataHandleStyle } from '../../utils/nodeStyles';
import { getTypeColor } from '../../utils/theme';
import { FX_COLOR } from './JavaFXAppNode';

const STR_COLOR = getTypeColor('String');
const NUM_COLOR = getTypeColor('double');

const lbl: React.CSSProperties = { fontSize: '11px', color: '#ccc' };
const bold: React.CSSProperties = { fontSize: '11px', color: '#fff', fontWeight: 'bold' };
const row: React.CSSProperties = { display: 'flex', alignItems: 'center', position: 'relative' };
const between: React.CSSProperties = { display: 'flex', justifyContent: 'space-between' };
const col: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '12px' };
const varInp: React.CSSProperties = { background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#ccc', padding: '2px 5px', fontSize: '10px', outline: 'none', borderRadius: '3px', width: '80px' };
const typeSel: React.CSSProperties = { background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: FX_COLOR, padding: '2px 3px', fontSize: '10px', outline: 'none', cursor: 'pointer', borderRadius: '3px' };
const opSel: React.CSSProperties = { background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#ccc', padding: '2px 3px', fontSize: '10px', outline: 'none', cursor: 'pointer', borderRadius: '3px', marginTop: '3px' };

const LAYOUT_TYPES = ['VBox', 'HBox', 'GridPane', 'BorderPane', 'StackPane', 'FlowPane', 'AnchorPane', 'ScrollPane'];
const OP_LABELS: Record<string, string> = {
  create: 'Create', addChild: 'Add Child', setSpacing: 'Set Spacing',
  setAlignment: 'Set Alignment', setPadding: 'Set Padding',
  setHgap: 'Set HGap', setVgap: 'Set VGap',
  setTop: 'Set Top', setBottom: 'Set Bottom', setLeft: 'Set Left', setRight: 'Set Right', setCenter: 'Set Center',
};
const OPS = Object.keys(OP_LABELS);

const EXEC_OUT = (
  <><span style={{ ...bold, marginRight: '5px' }}>Out</span>
  <Handle type="source" position={Position.Right} id="exec-out" style={{ ...execHandleStyle('right'), right: '-6px' }} /></>
);
const EXEC_IN = (
  <><Handle type="target" position={Position.Left} id="exec-in" style={{ ...execHandleStyle('left'), left: '-6px' }} />
  <span style={bold}>Exec</span></>
);

type Props = { id: string; data: Record<string, unknown>; selected?: boolean };

const JavaFXLayoutOpNode = ({ data, selected, id }: Props) => {
  const op = (data.operation as string) || 'create';
  const layoutType = (data.layoutType as string) || 'VBox';
  const varName = (data.variableName as string) || 'layout';
  const update = data.updateNodeData as ((i: string, d: Record<string, unknown>) => void) | undefined;

  const sub = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        <input className="nodrag" value={varName} onChange={e => update?.(id, { variableName: e.target.value })} style={varInp} placeholder="name" />
        <select className="nodrag" value={layoutType} onChange={e => update?.(id, { layoutType: e.target.value })} style={typeSel}>
          {LAYOUT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <select className="nodrag" value={op} onChange={e => update?.(id, { operation: e.target.value })} style={opSel}>
        {OPS.map(o => <option key={o} value={o}>{OP_LABELS[o]}</option>)}
      </select>
    </div>
  );

  const wrap = (children: React.ReactNode) => (
    <div style={{ ...nodeContainer(FX_COLOR, !!selected), minWidth: '230px' }}>
      <div className="devflow-header-shimmer" style={nodeHeaderSolid(FX_COLOR)}>📐 {layoutType}: {OP_LABELS[op] ?? op}</div>
      <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>{sub}{children}</div>
    </div>
  );

  const withRef = (inputs: React.ReactNode) => wrap(
    <div style={between}>
      <div style={col}>
        <div style={row}>{EXEC_IN}</div>
        {inputs}
      </div>
      <div style={col}>
        <div style={row}>{EXEC_OUT}</div>
        <div style={row}><span style={{ ...lbl, marginRight: '5px' }}>ref</span><Handle type="source" position={Position.Right} id="data-out" style={{ ...dataHandleStyle(FX_COLOR, 'right'), right: '-6px' }} /></div>
      </div>
    </div>
  );

  if (op === 'create') return withRef(null);

  if (op === 'addChild' || op === 'setTop' || op === 'setBottom' || op === 'setLeft' || op === 'setRight' || op === 'setCenter') return wrap(
    <div style={between}>
      <div style={col}>
        <div style={row}>{EXEC_IN}</div>
        <div style={row}><Handle type="target" position={Position.Left} id="data-in-child" style={{ ...dataHandleStyle(FX_COLOR, 'left'), left: '-6px' }} /><span style={lbl}>child: Node</span></div>
      </div>
      <div style={row}>{EXEC_OUT}</div>
    </div>
  );

  if (op === 'setSpacing' || op === 'setPadding' || op === 'setHgap' || op === 'setVgap') return wrap(
    <div style={between}>
      <div style={col}>
        <div style={row}>{EXEC_IN}</div>
        <div style={row}><Handle type="target" position={Position.Left} id="data-in-value" style={{ ...dataHandleStyle(NUM_COLOR, 'left'), left: '-6px' }} /><span style={lbl}>value: double</span></div>
      </div>
      <div style={row}>{EXEC_OUT}</div>
    </div>
  );

  if (op === 'setAlignment') return wrap(
    <div style={between}>
      <div style={col}>
        <div style={row}>{EXEC_IN}</div>
        <div style={row}><Handle type="target" position={Position.Left} id="data-in-value" style={{ ...dataHandleStyle(STR_COLOR, 'left'), left: '-6px' }} /><span style={lbl}>align: Pos</span></div>
      </div>
      <div style={row}>{EXEC_OUT}</div>
    </div>
  );

  return wrap(<div style={between}><div style={row}>{EXEC_IN}</div><div style={row}>{EXEC_OUT}</div></div>);
};

export default memo(JavaFXLayoutOpNode);
