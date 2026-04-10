import React, { memo, useState, useMemo } from 'react';
import { Node, Edge } from '@xyflow/react';
import DetailsPanel from './DetailsPanel';
import ValidationPanel from './ValidationPanel';
import TemplateGallery from './TemplateGallery';
import FileTree, { type ProjectFile } from '../FileTree';
import { getTypeColor } from '../../utils/theme';

interface LeftSidebarProps {
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
  onSave: () => void;
  onLoad: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  updateNodeModifier: (id: string, modifier: string) => void;
  updateNodeData: (id: string, data: object | ((node: Node) => object)) => void;
  onAddGetter: (variableNode: Node) => void;
  className: string;
  onClassNameChange: (name: string) => void;
  files: ProjectFile[];
  activeFileId: string;
  onSwitchFile: (fileId: string) => void;
  onAddFile: () => void;
  onRemoveFile: (fileId: string) => void;
  onRenameFile: (fileId: string, newName: string) => void;
  onLoadTemplate: (nodes: Node[], edges: Edge[]) => void;
  width?: number;
}

const LeftSidebar = ({
  nodes,
  edges,
  selectedNodeId,
  onSelectNode,
  onSave,
  onLoad,
  onExport,
  onImport,
  updateNodeModifier,
  updateNodeData,
  onAddGetter,
  className,
  onClassNameChange,
  files,
  activeFileId,
  onSwitchFile,
  onAddFile,
  onRemoveFile,
  onRenameFile,
  onLoadTemplate,
  width,
}: LeftSidebarProps) => {
  const selectedNode = nodes.find(n => n.id === selectedNodeId);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVars = useMemo(() => {
    const vars = nodes.filter(n => n.type === 'java');
    if (!searchQuery) return vars;
    const q = searchQuery.toLowerCase();
    return vars.filter(n => (n.data.label as string).toLowerCase().includes(q));
  }, [nodes, searchQuery]);

  const filteredMethods = useMemo(() => {
    const methods = nodes.filter(n => n.type === 'method');
    if (!searchQuery) return methods;
    const q = searchQuery.toLowerCase();
    return methods.filter(n => (n.data.label as string).toLowerCase().includes(q));
  }, [nodes, searchQuery]);

  return (
    <div style={{ ...sidebarStyle, ...(width != null ? { width } : {}) }}>
      <div style={headerStyle}>
        <span style={headerTitleStyle}>PROJECT EXPLORER</span>
        <div style={toolbarStyle}>
          <button
            onClick={onSave}
            style={btnSaveStyle}
            title="Save project"
            onMouseEnter={(e) => { e.currentTarget.style.background = '#1a2a3a'; e.currentTarget.style.borderTopColor = '#3b82f6'; e.currentTarget.style.borderRightColor = '#3b82f6'; e.currentTarget.style.borderBottomColor = '#3b82f6'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#1e1e1e'; e.currentTarget.style.borderTopColor = '#2a3a5a'; e.currentTarget.style.borderRightColor = '#2a3a5a'; e.currentTarget.style.borderBottomColor = '#2a3a5a'; }}
          >
            Save
          </button>
          <button
            onClick={onLoad}
            style={btnNeutralStyle}
            title="Load project"
            onMouseEnter={(e) => { e.currentTarget.style.background = '#2a2a2a'; e.currentTarget.style.borderColor = '#555'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#1e1e1e'; e.currentTarget.style.borderColor = '#333'; }}
          >
            Load
          </button>
          <button
            onClick={onExport}
            style={btnIconStyle}
            title="Export"
            onMouseEnter={(e) => { e.currentTarget.style.background = '#2a2a2a'; e.currentTarget.style.borderColor = '#555'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#1e1e1e'; e.currentTarget.style.borderColor = '#333'; }}
          >
            ↗
          </button>
          <label
            style={btnIconLabelStyle}
            title="Import"
            onMouseEnter={(e) => { e.currentTarget.style.background = '#2a2a2a'; e.currentTarget.style.borderColor = '#555'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#1e1e1e'; e.currentTarget.style.borderColor = '#333'; }}
          >
            ↙
            <input type="file" accept=".json" onChange={(e) => { if (e.target.files?.[0]) onImport(e.target.files[0]); e.target.value = ''; }} style={{ display: 'none' }} />
          </label>
          <TemplateGallery onLoadTemplate={onLoadTemplate} />
        </div>
      </div>

      <div style={{ padding: '10px', overflowY: 'auto', flex: 1 }}>
        <FileTree
          files={files}
          activeFileId={activeFileId}
          onSwitch={onSwitchFile}
          onAdd={onAddFile}
          onRemove={onRemoveFile}
          onRename={onRenameFile}
        />

        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search nodes..."
          style={{ background: '#111', border: '1px solid #333', color: '#ccc', padding: '6px 8px', fontSize: '11px', borderRadius: '3px', outline: 'none', width: '100%', marginBottom: '12px', boxSizing: 'border-box' }}
        />

        <div style={{ fontSize: '10px', color: '#555', marginBottom: '6px', fontWeight: 'bold' }}>CLASS NAME</div>
        <input
          value={className}
          onChange={(e) => onClassNameChange(e.target.value)}
          style={{ background: '#111', border: '1px solid #333', color: '#89ddff', padding: '6px', fontSize: '11px', borderRadius: '3px', outline: 'none', width: '100%', marginBottom: '15px', boxSizing: 'border-box' }}
        />

        <div style={{ fontSize: '10px', color: '#555', marginBottom: '10px', fontWeight: 'bold' }}>VARIABLES</div>
        {filteredVars.map((node) => (
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
            <button
              onClick={(e) => { e.stopPropagation(); onAddGetter(node); }}
              style={addBtnStyle}
              title="Add getter"
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#22c55e'; e.currentTarget.style.color = '#22c55e'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#444'; e.currentTarget.style.color = '#999'; }}
            >
              +
            </button>
          </div>
        ))}

        <div style={{ fontSize: '10px', color: '#555', marginTop: '20px', marginBottom: '10px', fontWeight: 'bold' }}>METHODS</div>
        {filteredMethods.map((node) => (
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
      <ValidationPanel nodes={nodes} edges={edges} onSelectNode={onSelectNode} />
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

const headerStyle: React.CSSProperties = {
  padding: '12px',
  borderBottom: '1px solid #333',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
};

const headerTitleStyle: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: 'bold',
  letterSpacing: '1px',
  color: '#888',
};

const toolbarStyle: React.CSSProperties = {
  display: 'flex',
  gap: '4px',
  alignItems: 'center',
};

const btnBase: React.CSSProperties = {
  height: '26px',
  background: '#1e1e1e',
  border: '1px solid #333',
  borderRadius: '4px',
  fontSize: '10px',
  fontWeight: 700,
  letterSpacing: '0.5px',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.15s ease',
};

const btnSaveStyle: React.CSSProperties = {
  ...btnBase,
  color: '#3b82f6',
  border: '1px solid #2a3a5a',
  borderLeft: '2px solid #3b82f6',
  padding: '0 10px',
};

const btnNeutralStyle: React.CSSProperties = {
  ...btnBase,
  color: '#999',
  padding: '0 10px',
};

const btnIconStyle: React.CSSProperties = {
  ...btnBase,
  color: '#999',
  width: '26px',
  padding: '0',
  fontSize: '12px',
};

const btnIconLabelStyle: React.CSSProperties = {
  ...btnIconStyle,
  cursor: 'pointer',
};

const addBtnStyle: React.CSSProperties = {
  background: '#1e1e1e',
  color: '#999',
  border: '1px solid #444',
  borderRadius: '4px',
  width: '20px',
  height: '20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '13px',
  cursor: 'pointer',
  lineHeight: 0,
  transition: 'all 0.15s ease',
};