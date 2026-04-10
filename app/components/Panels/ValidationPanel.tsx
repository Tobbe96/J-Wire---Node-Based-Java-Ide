import React, { memo, useMemo, useState } from 'react';
import type { Node, Edge } from '@xyflow/react';
import { validateGraph, type GraphIssue } from '../../utils/graphValidator';

interface ValidationPanelProps {
  nodes: Node[];
  edges: Edge[];
  onSelectNode: (id: string) => void;
}

const ValidationPanel = ({ nodes, edges, onSelectNode }: ValidationPanelProps) => {
  const [collapsed, setCollapsed] = useState(true);

  const issues = useMemo(() => validateGraph(nodes, edges), [nodes, edges]);

  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;

  return (
    <div style={panelStyle}>
      <button onClick={() => setCollapsed(!collapsed)} style={headerStyle}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ display: 'inline-block', transition: 'transform 0.15s', transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)', fontSize: '10px' }}>
            ▼
          </span>
          <span style={{ fontSize: '10px', fontWeight: 'bold', letterSpacing: '1px' }}>VALIDATION</span>
        </span>
        <span style={{ display: 'flex', gap: '6px', fontSize: '10px' }}>
          {errorCount > 0 && <span style={{ color: '#ef4444' }}>✕ {errorCount}</span>}
          {warningCount > 0 && <span style={{ color: '#fbbf24' }}>⚠ {warningCount}</span>}
          {issues.length === 0 && <span style={{ color: '#22c55e' }}>✓</span>}
        </span>
      </button>

      {!collapsed && (
        <div style={bodyStyle}>
          {issues.length === 0 ? (
            <div style={{ padding: '10px', fontSize: '11px', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>✓</span> No issues found
            </div>
          ) : (
            issues.map((issue, idx) => (
              <IssueRow key={idx} issue={issue} onSelectNode={onSelectNode} />
            ))
          )}
        </div>
      )}
    </div>
  );
};

const IssueRow = ({ issue, onSelectNode }: { issue: GraphIssue; onSelectNode: (id: string) => void }) => {
  const isClickable = !!issue.nodeId;
  const color = issue.severity === 'error' ? '#ef4444' : '#fbbf24';
  const icon = issue.severity === 'error' ? '✕' : '⚠';

  return (
    <div
      onClick={isClickable ? () => onSelectNode(issue.nodeId!) : undefined}
      style={{
        ...issueStyle,
        cursor: isClickable ? 'pointer' : 'default',
      }}
    >
      <span style={{ color, flexShrink: 0, fontSize: '10px', width: '14px', textAlign: 'center' }}>{icon}</span>
      <span style={{ fontSize: '11px', color: '#a6accd' }}>{issue.message}</span>
    </div>
  );
};

export default memo(ValidationPanel);

// ─── Styles ────────────────────────────────────────────────────

const panelStyle: React.CSSProperties = {
  borderTop: '1px solid #333',
  background: '#141414',
};

const headerStyle: React.CSSProperties = {
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '10px 15px',
  background: 'transparent',
  border: 'none',
  color: '#888',
  cursor: 'pointer',
};

const bodyStyle: React.CSSProperties = {
  maxHeight: '200px',
  overflowY: 'auto',
};

const issueStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '6px',
  padding: '6px 15px',
  borderBottom: '1px solid #1e1e1e',
  transition: 'background 0.1s',
};
