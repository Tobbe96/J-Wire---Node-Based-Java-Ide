'use client';

import React, { memo } from 'react';
import type { ProjectClassInfo } from '../../utils/nodeTypes';

interface ClassSettingsPanelProps {
  className: string;
  classType?: 'class' | 'interface' | 'enum';
  extendsClass?: string;
  implementsInterfaces?: string[];
  isAbstract?: boolean;
  packageName?: string;
  allClasses: ProjectClassInfo[];
  onRename: (name: string) => void;
  onUpdateMeta: (meta: {
    classType?: 'class' | 'interface' | 'enum';
    extendsClass?: string;
    implementsInterfaces?: string[];
    isAbstract?: boolean;
    packageName?: string;
  }) => void;
}

function ClassSettingsPanel({
  className,
  classType = 'class',
  extendsClass = '',
  implementsInterfaces = [],
  isAbstract = false,
  packageName = '',
  allClasses,
  onRename,
  onUpdateMeta,
}: ClassSettingsPanelProps) {
  const otherClasses = allClasses.filter(c => c.className !== className && c.classType !== 'interface' && c.classType !== 'enum');
  const interfaceClasses = allClasses.filter(c => c.className !== className && c.classType === 'interface');

  const labelStyle: React.CSSProperties = { fontSize: 11, color: '#888', marginBottom: 2, display: 'block' };
  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: '#1a1a1a',
    border: '1px solid #333',
    color: '#fff',
    borderRadius: 4,
    padding: '4px 8px',
    fontSize: 12,
    boxSizing: 'border-box',
  };
  const selectStyle: React.CSSProperties = { ...inputStyle };

  const toggleInterface = (name: string) => {
    const current = implementsInterfaces || [];
    const updated = current.includes(name)
      ? current.filter(i => i !== name)
      : [...current, name];
    onUpdateMeta({ implementsInterfaces: updated });
  };

  return (
    <div style={{ padding: '8px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Class Name */}
      <div>
        <span style={labelStyle}>CLASS NAME</span>
        <input
          value={className}
          onChange={e => onRename(e.target.value)}
          style={inputStyle}
        />
      </div>

      {/* Package Name */}
      <div>
        <span style={labelStyle}>PACKAGE</span>
        <input
          value={packageName}
          placeholder="e.g. com.example.myapp"
          onChange={e => onUpdateMeta({ packageName: e.target.value || undefined })}
          style={inputStyle}
        />
      </div>

      {/* Class Type */}
      <div>
        <span style={labelStyle}>TYPE</span>
        <select
          value={classType}
          onChange={e => onUpdateMeta({ classType: e.target.value as 'class' | 'interface' | 'enum' })}
          style={selectStyle}
        >
          <option value="class">☕ Class</option>
          <option value="interface">🔷 Interface</option>
          <option value="enum">📋 Enum</option>
        </select>
      </div>

      {/* Abstract toggle (classes only) */}
      {classType === 'class' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="checkbox"
            id="abstract-toggle"
            checked={isAbstract}
            onChange={e => onUpdateMeta({ isAbstract: e.target.checked })}
            style={{ accentColor: '#e67e22' }}
          />
          <label htmlFor="abstract-toggle" style={{ fontSize: 12, color: '#aaa', cursor: 'pointer' }}>
            🔶 Abstract class
          </label>
        </div>
      )}

      {/* Extends (classes only) */}
      {classType === 'class' && (
        <div>
          <span style={labelStyle}>EXTENDS</span>
          <select
            value={extendsClass || ''}
            onChange={e => onUpdateMeta({ extendsClass: e.target.value || undefined })}
            style={selectStyle}
          >
            <option value="">— none —</option>
            {otherClasses.map(c => (
              <option key={c.id} value={c.className}>{c.className}</option>
            ))}
          </select>
        </div>
      )}

      {/* Implements (classes only) */}
      {classType === 'class' && interfaceClasses.length > 0 && (
        <div>
          <span style={labelStyle}>IMPLEMENTS</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 120, overflowY: 'auto' }}>
            {interfaceClasses.map(c => (
              <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#aaa', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={(implementsInterfaces || []).includes(c.className)}
                  onChange={() => toggleInterface(c.className)}
                  style={{ accentColor: '#3498db' }}
                />
                {c.className}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Interface extends */}
      {classType === 'interface' && interfaceClasses.length > 0 && (
        <div>
          <span style={labelStyle}>EXTENDS (interfaces)</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 120, overflowY: 'auto' }}>
            {interfaceClasses.map(c => (
              <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#aaa', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={(implementsInterfaces || []).includes(c.className)}
                  onChange={() => toggleInterface(c.className)}
                  style={{ accentColor: '#3498db' }}
                />
                {c.className}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(ClassSettingsPanel);
