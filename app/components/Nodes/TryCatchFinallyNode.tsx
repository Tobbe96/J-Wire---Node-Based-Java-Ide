import React, { memo, useCallback, useMemo } from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { nodeContainer, nodeHeaderSolid, execHandleStyle, dataHandleStyle } from '../../utils/nodeStyles';
import { getTypeColor } from '../../utils/theme';
import type { TryCatchFinallyNodeData } from '../../utils/nodeTypes';

const ACCENT = '#9b59b6';

const inputStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  borderBottom: '1px solid #555',
  color: '#e0e0e0',
  fontSize: '10px',
  outline: 'none',
  padding: '1px 2px',
};

const btnStyle = (color: string): React.CSSProperties => ({
  background: `${color}cc`,
  border: '1px solid rgba(255,255,255,0.1)',
  color: '#fff',
  borderRadius: '3px',
  fontSize: '10px',
  cursor: 'pointer',
  padding: '1px 6px',
  lineHeight: '1.4',
});

type CatchEntry = { exceptionType: string; exceptionVarName: string };

const TryCatchFinallyNode = ({ id, data, selected }: NodeProps<Node<TryCatchFinallyNodeData>>) => {
  const updateNodeData = (data as Record<string, unknown>).updateNodeData as ((id: string, d: Record<string, unknown>) => void) | undefined;

  const rawCatches = data.catches as CatchEntry[] | undefined;
  const catches: CatchEntry[] = useMemo(() => rawCatches && rawCatches.length > 0
    ? rawCatches
    : [{ exceptionType: (data.exceptionType as string) || 'Exception', exceptionVarName: (data.exceptionVarName as string) || 'e' }],
  [rawCatches, data.exceptionType, data.exceptionVarName]);

  const syncCatches = useCallback((newCatches: CatchEntry[]) => {
    updateNodeData?.(id, {
      catches: newCatches,
      catchCount: newCatches.length,
      exceptionType: newCatches[0]?.exceptionType,
      exceptionVarName: newCatches[0]?.exceptionVarName,
    });
  }, [id, updateNodeData]);

  const addCatch = useCallback(() => {
    syncCatches([...catches, { exceptionType: 'Exception', exceptionVarName: `e${catches.length}` }]);
  }, [catches, syncCatches]);

  const removeCatch = useCallback((index: number) => {
    if (catches.length <= 1) return;
    syncCatches(catches.filter((_, i) => i !== index));
  }, [catches, syncCatches]);

  const updateCatch = useCallback((index: number, field: keyof CatchEntry, value: string) => {
    const updated = catches.map((c, i) => i === index ? { ...c, [field]: value } : c);
    syncCatches(updated);
  }, [catches, syncCatches]);

  const execHandleId = (i: number) => i === 0 ? 'exec-catch' : `exec-catch-${i}`;
  const exceptionHandleId = (i: number) => i === 0 ? 'data-out-exception' : `data-out-exception-${i}`;

  return (
    <div style={{ ...nodeContainer(ACCENT, !!selected), minWidth: '230px' }}>
      <div className="jwire-header-shimmer" style={nodeHeaderSolid(ACCENT)}>
        TRY / CATCH / FINALLY
      </div>

      <div style={{ padding: '4px 10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {catches.map((c, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: '10px', color: '#888' }}>catch(</span>
            <input
              value={c.exceptionType}
              onChange={(e) => updateCatch(i, 'exceptionType', e.target.value)}
              placeholder="Exception"
              style={{ ...inputStyle, width: '80px', color: '#e74c3c' }}
              className="nodrag"
            />
            <input
              value={c.exceptionVarName}
              onChange={(e) => updateCatch(i, 'exceptionVarName', e.target.value)}
              placeholder="e"
              style={{ ...inputStyle, width: '28px', color: '#f1c40f' }}
              className="nodrag"
            />
            <span style={{ fontSize: '10px', color: '#888' }}>)</span>
            {catches.length > 1 && (
              <button onClick={() => removeCatch(i)} style={btnStyle('#e74c3c')} className="nodrag">−</button>
            )}
          </div>
        ))}
        <button onClick={addCatch} style={{ ...btnStyle('#2ecc71'), alignSelf: 'flex-start', marginTop: '2px' }} className="nodrag">+ catch</button>
      </div>

      <div style={{ padding: '10px', display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Handle type="target" position={Position.Left} id="exec-in" style={{ ...execHandleStyle('left'), left: '-16px' }} />
            <span style={{ fontSize: '11px', color: '#fff', fontWeight: 'bold' }}>Exec</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-end' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#2ecc71', fontWeight: 'bold', marginRight: '5px' }}>Try</span>
            <Handle type="source" position={Position.Right} id="exec-try" style={{ ...execHandleStyle('right'), right: '-16px' }} />
          </div>
          {catches.map((_, i) => (
            <React.Fragment key={i}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: '#e74c3c', fontWeight: 'bold', marginRight: '5px' }}>
                  {catches.length > 1 ? `Catch ${i + 1}` : 'Catch'}
                </span>
                <Handle type="source" position={Position.Right} id={execHandleId(i)} style={{ ...execHandleStyle('right'), right: '-16px' }} />
              </div>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: getTypeColor('String'), marginRight: '5px' }}>
                  {catches.length > 1 ? `Ex msg ${i + 1}` : 'Exception msg'}
                </span>
                <Handle type="source" position={Position.Right} id={exceptionHandleId(i)} style={{ ...dataHandleStyle(getTypeColor('String'), 'right'), right: '-16px' }} />
              </div>
            </React.Fragment>
          ))}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#f39c12', fontWeight: 'bold', marginRight: '5px' }}>Finally</span>
            <Handle type="source" position={Position.Right} id="exec-finally" style={{ ...execHandleStyle('right'), right: '-16px' }} />
          </div>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#ccc', fontWeight: 'bold', marginRight: '5px' }}>Done</span>
            <Handle type="source" position={Position.Right} id="exec-out" style={{ ...execHandleStyle('right'), right: '-16px' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(TryCatchFinallyNode);

