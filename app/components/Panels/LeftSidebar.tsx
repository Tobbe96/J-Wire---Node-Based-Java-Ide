import React, { memo } from 'react';
import { Node } from '@xyflow/react';
import DetailsPanel from './DetailsPanel';
import { getTypeColor } from '../../utils/theme';

interface LeftSidebarProps {
  nodes: Node[];
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
  onSave: () => void;
  onLoad: () => void;
  updateNodeModifier: (id: string, modifier: string) => void;
  updateNodeData: (id: string, data: object | ((node: Node) => object)) => void;
  onAddGetter: (variableNode: Node) => void;
}

const LeftSidebar = ({
  nodes,
  selectedNodeId,
  onSelectNode,
  onSave,
  onLoad,
  updateNodeModifier,
  updateNodeData,
  onAddGetter,
}: LeftSidebarProps) => {
  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  return (
    <div style={sidebarStyle}>
      <div style={{ padding: '15px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '10px', fontWeight: 'bold', letterSpacing: '1px', color: '#888' }}>PROJECT EXPLORER</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={onSave} style={btnStyleSave}>SAVE</button>
          <button onClick={onLoad} style={btnStyleLoad}>LOAD</button>
        </div>
      </div>

      <div style={{ padding: '10px', overflowY: 'auto', flex: 1 }}>
        <div style={{ fontSize: '10px', color: '#555', marginBottom: '10px', fontWeight: 'bold' }}>VARIABLES</div>
        {nodes.filter(n => n.type === 'java').map((node) => (
          <div
            key={node.id}
            onClick={() => onSelectNode(node.id)}
            style={{
              ...sidebarItemStyle,
              border: selectedNodeId === node.id ? '1px solid #fff' : 'none',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: getTypeColor(node.data.type as string) }} />
              <span>{node.data.label as string}</span>
            </div>
            <button onClick={(e) => { e.stopPropagation(); onAddGetter(node); }} style={addBtnStyle} title="Add getter">+</button>
          </div>
        ))}

        <div style={{ fontSize: '10px', color: '#555', marginTop: '20px', marginBottom: '10px', fontWeight: 'bold' }}>METHODS</div>
        {nodes.filter(n => n.type === 'method').map((node) => (
          <div
            key={node.id}
            onClick={() => onSelectNode(node.id)}
            style={{ ...sidebarItemStyle, border: selectedNodeId === node.id ? '1px solid #fff' : 'none' }}
          >
            <span>{node.data.label as string}</span>
          </div>
        ))}
      </div>

      <DetailsPanel selectedNode={selectedNode} updateNodeModifier={updateNodeModifier} updateNodeData={updateNodeData} />
    </div>
  );
};

export default memo(LeftSidebar);

// ─── Styles ────────────────────────────────────────────────────

const sidebarStyle: React.CSSProperties = {
  width: '240px',
  background: '#141414',
  borderRight: '1px solid #000',
  color: '#ccc',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
};

const sidebarItemStyle: React.CSSProperties = {
  padding: '8px 10px',
  fontSize: '11px',
  background: '#1e1e1e',
  marginBottom: '4px',
  cursor: 'pointer',
  borderRadius: '4px',
  transition: 'all 0.15s ease',
};

const addBtnStyle: React.CSSProperties = {
  background: '#333',
  color: '#fff',
  border: 'none',
  borderRadius: '3px',
  width: '18px',
  height: '18px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '14px',
  cursor: 'pointer',
  lineHeight: 0,
};

const btnStyleSave = { background: '#2563eb', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', cursor: 'pointer', fontWeight: 700 };
const btnStyleLoad = { background: '#3f3f46', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', cursor: 'pointer', fontWeight: 700 };