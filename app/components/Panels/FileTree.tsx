'use client';
import React, { memo, useState } from 'react';

export interface ProjectFile {
  id: string;
  className: string;
  classType?: 'class' | 'interface' | 'enum';
  isAbstract?: boolean;
}

interface FileTreeProps {
  files: ProjectFile[];
  activeFileId: string;
  onSwitch: (fileId: string) => void;
  onAdd: () => void;
  onRemove: (fileId: string) => void;
  onRename: (fileId: string, newName: string) => void;
}

function getFileIcon(file: ProjectFile): string {
  if (file.classType === 'interface') return '🔷';
  if (file.classType === 'enum') return '📋';
  if (file.isAbstract) return '🔶';
  return '☕';
}

const FileTree = ({ files, activeFileId, onSwitch, onAdd, onRemove, onRename }: FileTreeProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleStartRename = (file: ProjectFile) => {
    setEditingId(file.id);
    setEditValue(file.className);
  };

  const handleFinishRename = () => {
    if (editingId && editValue.trim()) {
      onRename(editingId, editValue.trim());
    }
    setEditingId(null);
  };

  return (
    <div style={{ borderBottom: '1px solid #333', padding: '8px 10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#555', letterSpacing: 1 }}>FILES</span>
        <button onClick={() => onAdd()} style={addBtnStyle} title="Add new class file">+</button>
      </div>
      {files.map(file => (
        <div
          key={file.id}
          onClick={() => onSwitch(file.id)}
          style={{
            ...fileItemStyle,
            background: file.id === activeFileId ? '#2563eb22' : '#1e1e1e',
            border: file.id === activeFileId ? '1px solid #2563eb' : '1px solid transparent',
          }}
        >
          {editingId === file.id ? (
            <input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleFinishRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleFinishRename();
                if (e.key === 'Escape') setEditingId(null);
              }}
              autoFocus
              onClick={(e) => e.stopPropagation()}
              style={editInputStyle}
            />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: 11 }}>{getFileIcon(file)}</span>
              <span style={{ fontSize: 11, color: '#ccc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {file.className}.java
              </span>
            </div>
          )}
          <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
            <button
              onClick={(e) => { e.stopPropagation(); handleStartRename(file); }}
              style={smallBtnStyle}
              title="Rename"
            >
              ✏
            </button>
            {files.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); onRemove(file.id); }}
                style={{ ...smallBtnStyle, color: '#ef4444' }}
                title="Delete"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default memo(FileTree);

const fileItemStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '5px 8px',
  borderRadius: 4,
  cursor: 'pointer',
  marginBottom: 2,
  transition: 'all 0.15s',
};

const addBtnStyle: React.CSSProperties = {
  background: '#333',
  color: '#fff',
  border: 'none',
  borderRadius: 3,
  width: 18,
  height: 18,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 14,
  cursor: 'pointer',
  lineHeight: 0,
};

const smallBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#666',
  cursor: 'pointer',
  fontSize: 10,
  padding: '2px 4px',
  borderRadius: 2,
};

const editInputStyle: React.CSSProperties = {
  background: '#111',
  border: '1px solid #2563eb',
  color: '#89ddff',
  padding: '2px 6px',
  fontSize: 11,
  borderRadius: 3,
  outline: 'none',
  width: '100%',
};
