import React, { memo, useState, useCallback } from 'react';
import type { Node, Edge } from '@xyflow/react';
import { TEMPLATES } from '../../utils/templates';

interface TemplateGalleryProps {
  onLoadTemplate: (nodes: Node[], edges: Edge[]) => void;
}

const TemplateGallery = ({ onLoadTemplate }: TemplateGalleryProps) => {
  const [open, setOpen] = useState(false);

  const handleSelect = useCallback(
    (nodes: Node[], edges: Edge[]) => {
      if (window.confirm('This will replace your current graph. Continue?')) {
        onLoadTemplate(nodes, edges);
        setOpen(false);
      }
    },
    [onLoadTemplate],
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={triggerBtnStyle}
        title="Templates"
        onMouseEnter={(e) => { e.currentTarget.style.background = '#2a2a2a'; e.currentTarget.style.borderColor = '#555'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = '#1e1e1e'; e.currentTarget.style.borderColor = '#333'; }}
      >
        ◧
      </button>

      {open && (
        <div style={overlayStyle} onClick={() => setOpen(false)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <span style={{ fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px', color: '#ccc' }}>
                STARTER TEMPLATES
              </span>
              <button
                onClick={() => setOpen(false)}
                style={closeBtnStyle}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = '#333'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#888'; e.currentTarget.style.background = 'transparent'; }}
              >
                ✕
              </button>
            </div>

            <div style={gridStyle}>
              {TEMPLATES.map((t, i) => {
                const accent = CARD_ACCENTS[i % CARD_ACCENTS.length];
                return (
                  <div
                    key={t.id}
                    onClick={() => handleSelect(t.nodes, t.edges)}
                    style={{ ...cardStyle, borderLeft: `3px solid ${accent}` }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderTopColor = '#555';
                      e.currentTarget.style.borderRightColor = '#555';
                      e.currentTarget.style.borderBottomColor = '#555';
                      e.currentTarget.style.background = '#1e1e1e';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderTopColor = '#333';
                      e.currentTarget.style.borderRightColor = '#333';
                      e.currentTarget.style.borderBottomColor = '#333';
                      e.currentTarget.style.background = '#161616';
                    }}
                  >
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#ccc', marginBottom: '4px' }}>
                      {t.name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#777', lineHeight: '1.4' }}>
                      {t.description}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default memo(TemplateGallery);

// ─── Constants ─────────────────────────────────────────────────

const CARD_ACCENTS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

// ─── Styles ────────────────────────────────────────────────────

const triggerBtnStyle: React.CSSProperties = {
  height: '26px',
  width: '26px',
  background: '#1e1e1e',
  border: '1px solid #333',
  borderRadius: '4px',
  fontSize: '12px',
  fontWeight: 700,
  letterSpacing: '0.5px',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#999',
  padding: '0',
  transition: 'all 0.15s ease',
};

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modalStyle: React.CSSProperties = {
  background: '#1a1a1a',
  border: '1px solid #333',
  borderRadius: '8px',
  width: '480px',
  maxHeight: '80vh',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
};

const modalHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '14px 16px',
  borderBottom: '1px solid #333',
};

const closeBtnStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  color: '#888',
  fontSize: '14px',
  cursor: 'pointer',
  width: '26px',
  height: '26px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '4px',
  transition: 'all 0.15s ease',
};

const gridStyle: React.CSSProperties = {
  padding: '12px',
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const cardStyle: React.CSSProperties = {
  padding: '12px',
  background: '#161616',
  border: '1px solid #333',
  borderRadius: '6px',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
};
