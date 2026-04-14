import React, { useState, useMemo, useEffect, useRef } from 'react';
import { NODE_CATEGORIES, NODE_CONFIGS, CATEGORY_META, isGrouped } from '../utils/nodeRegistry';

interface NodeBrowserProps {
  position: { x: number; y: number };
  onAddNode: (nodeKind: string) => void;
  onClose: () => void;
  /** When provided (drag-from-handle), dims incompatible nodes. */
  compatibleKinds?: Set<string>;
}

const PANEL_W = 184;

function clampPos(x: number, y: number): { x: number; y: number } {
  const ww = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const wh = typeof window !== 'undefined' ? window.innerHeight : 900;
  return {
    x: Math.min(x, ww - PANEL_W - 4),
    y: Math.min(y, wh - 60),
  };
}

function subPos(rect: DOMRect, panelH: number = 320): { x: number; y: number } {
  const ww = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const wh = typeof window !== 'undefined' ? window.innerHeight : 900;
  const x = rect.right + PANEL_W + 4 <= ww ? rect.right + 2 : rect.left - PANEL_W - 2;
  const y = Math.min(rect.top, wh - panelH - 8);
  return { x, y };
}

export default function NodeBrowser({ position, onAddNode, onClose, compatibleKinds }: NodeBrowserProps) {
  const [hoveredCat, setHoveredCat] = useState<string | null>(null);
  const [hoveredSub, setHoveredSub] = useState<string | null>(null);
  const [l2, setL2] = useState<{ x: number; y: number } | null>(null);
  const [l3, setL3] = useState<{ x: number; y: number } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const cancel = () => { if (closeTimer.current) clearTimeout(closeTimer.current); };
  const scheduleClose = (all = true) => {
    closeTimer.current = setTimeout(() => {
      if (all) { setHoveredCat(null); setL2(null); }
      setHoveredSub(null); setL3(null);
    }, 130);
  };

  const filteredNodes = useMemo(() => {
    if (!searchTerm) return [];
    return Object.keys(NODE_CONFIGS).filter((key) => {
      const label = (NODE_CONFIGS[key].data.label as string) || '';
      return key.toLowerCase().includes(searchTerm.toLowerCase()) || label.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [searchTerm]);

  /** Whether a node kind is compatible given drag context. If no context, all are compatible. */
  const isCompat = (kind: string) => !compatibleKinds || compatibleKinds.has(kind);

  /** Whether a category has at least one compatible node. */
  const catHasCompat = (cat: string) => {
    if (!compatibleKinds) return true;
    const content = NODE_CATEGORIES[cat];
    if (!content) return false;
    if (isGrouped(content)) {
      return Object.values(content as Record<string, string[]>).some((arr) => arr.some((k) => compatibleKinds.has(k)));
    }
    return (content as string[]).some((k) => compatibleKinds.has(k));
  };

  const catContent = hoveredCat ? NODE_CATEGORIES[hoveredCat] : null;
  const catGrouped = catContent ? isGrouped(catContent) : false;
  const catMeta = hoveredCat ? (CATEGORY_META[hoveredCat] ?? { icon: '◆', color: '#888' }) : null;

  const l1pos = clampPos(position.x, position.y);

  return (
    <>
      {/* ── LEVEL 1: Category list ── */}
      <div
        style={{ ...browserStyle, left: l1pos.x, top: l1pos.y }}
        onMouseEnter={cancel}
        onMouseLeave={() => scheduleClose(true)}
      >
        <div style={{ padding: '8px', borderBottom: '1px solid #333' }}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search nodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && onClose()}
            style={searchInputStyle}
          />
        </div>

        <div style={{ padding: '4px' }}>
          {searchTerm !== '' ? (
            <div style={{ maxHeight: '340px', overflowY: 'auto', scrollbarWidth: 'thin', scrollbarColor: '#555 #1a1a1a' }}>
              {filteredNodes.length > 0 ? filteredNodes.map((k) => (
                <NodeButton key={k} nodeKind={k} onAddNode={onAddNode} onClose={onClose} compatible={isCompat(k)} />
              )) : (
                <div style={{ padding: '10px', fontSize: '11px', color: '#666', textAlign: 'center' }}>
                  No nodes match &quot;{searchTerm}&quot;
                </div>
              )}
            </div>
          ) : (
            Object.keys(NODE_CATEGORIES).map((cat) => {
              const meta = CATEGORY_META[cat] ?? { icon: '◆', color: '#888' };
              const isActive = hoveredCat === cat;
              const catCompat = catHasCompat(cat);
              return (
                <div
                  key={cat}
                  style={{ opacity: catCompat ? 1 : 0.35, pointerEvents: catCompat ? 'auto' : 'none' }}
                  onMouseEnter={(e) => {
                    cancel();
                    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                    setL2(subPos(rect));
                    setHoveredCat(cat);
                    setHoveredSub(null);
                    setL3(null);
                  }}
                >
                  <div style={{
                    ...catRowStyle,
                    background: isActive ? `${meta.color}22` : 'transparent',
                    borderLeft: isActive ? `2px solid ${meta.color}` : '2px solid transparent',
                  }}>
                    <span style={{ color: meta.color, fontSize: '13px', width: '18px', textAlign: 'center' }}>{meta.icon}</span>
                    <span style={{ color: isActive ? '#fff' : '#ccc', flex: 1 }}>{cat}</span>
                    <span style={{ fontSize: '9px', color: '#555' }}>▶</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── LEVEL 2: Sub-groups or nodes ── */}
      {hoveredCat && l2 && catContent && (
        <div
          style={{ ...subPanelBase, left: l2.x, top: l2.y }}
          onMouseEnter={cancel}
          onMouseLeave={() => scheduleClose(true)}
        >
          {catGrouped ? (
            Object.keys(catContent as Record<string, string[]>).map((sub) => {
              const isSubActive = hoveredSub === sub;
              const subCompat = !compatibleKinds || ((catContent as Record<string, string[]>)[sub] || []).some((k) => compatibleKinds.has(k));
              return (
                <div
                  key={sub}
                  onMouseEnter={(e) => {
                    cancel();
                    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                    setL3(subPos(rect));
                    setHoveredSub(sub);
                  }}
                  style={{
                    ...subCatRowStyle,
                    opacity: subCompat ? 1 : 0.35,
                    pointerEvents: subCompat ? 'auto' : 'none',
                    background: isSubActive ? `${catMeta!.color}22` : 'transparent',
                    borderLeft: isSubActive ? `2px solid ${catMeta!.color}` : '2px solid transparent',
                  }}
                >
                  <span style={{ color: isSubActive ? '#fff' : '#ccc', flex: 1 }}>{sub}</span>
                  <span style={{ fontSize: '9px', color: '#555' }}>▶</span>
                </div>
              );
            })
          ) : (
            (catContent as string[]).map((k) => (
              <NodeButton key={k} nodeKind={k} onAddNode={onAddNode} onClose={onClose} accentColor={catMeta!.color} compatible={isCompat(k)} />
            ))
          )}
        </div>
      )}

      {/* ── LEVEL 3: Nodes ── */}
      {hoveredSub && l3 && catContent && catGrouped && (
        <div
          style={{ ...subPanelBase, left: l3.x, top: l3.y, zIndex: 10001 }}
          onMouseEnter={cancel}
          onMouseLeave={() => scheduleClose(true)}
        >
          {((catContent as Record<string, string[]>)[hoveredSub] || []).map((k) => (
            <NodeButton key={k} nodeKind={k} onAddNode={onAddNode} onClose={onClose} accentColor={catMeta!.color} compatible={isCompat(k)} />
          ))}
        </div>
      )}
    </>
  );
}

function NodeButton({ nodeKind, onAddNode, onClose, accentColor = '#3498db', compatible = true }: {
  nodeKind: string;
  onAddNode: (k: string) => void;
  onClose: () => void;
  accentColor?: string;
  compatible?: boolean;
}) {
  const label = (NODE_CONFIGS[nodeKind]?.data.label as string) || nodeKind;
  return (
    <button
      onClick={() => { if (compatible) { onAddNode(nodeKind); onClose(); } }}
      style={{ ...nodeButtonStyle, opacity: compatible ? 1 : 0.35, cursor: compatible ? 'pointer' : 'default' }}
      onMouseEnter={(e) => {
        if (!compatible) return;
        e.currentTarget.style.background = `${accentColor}18`;
        e.currentTarget.style.color = '#fff';
        e.currentTarget.style.borderLeftColor = accentColor;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.color = '#ccc';
        e.currentTarget.style.borderLeftColor = 'transparent';
      }}
    >
      {label}
    </button>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────

const panelBase: React.CSSProperties = {
  position: 'fixed',
  width: `${PANEL_W}px`,
  background: '#1a1a1a',
  border: '1px solid #444',
  borderRadius: '8px',
  zIndex: 10000,
  boxShadow: '0 10px 30px rgba(0,0,0,0.75)',
  pointerEvents: 'all',
  padding: '4px',
  maxHeight: '340px',
  overflowY: 'auto',
  scrollbarWidth: 'thin',
  scrollbarColor: '#555 #1a1a1a',
};

const browserStyle: React.CSSProperties = {
  ...panelBase,
  padding: 0,
  zIndex: 9999,
  boxShadow: '0 10px 40px rgba(0,0,0,0.8), 0 0 15px rgba(99,102,241,0.15)',
  animation: 'vfx-menu-slide-in 0.2s ease-out',
};

const subPanelBase: React.CSSProperties = {
  ...panelBase,
  animation: 'vfx-submenu-slide 0.12s ease-out',
};

const searchInputStyle: React.CSSProperties = {
  width: '100%',
  background: '#000',
  border: '1px solid #444',
  borderRadius: '4px',
  padding: '6px 10px',
  color: '#fff',
  fontSize: '12px',
  outline: 'none',
  boxSizing: 'border-box',
};

const catRowStyle: React.CSSProperties = {
  padding: '7px 10px',
  fontSize: '12px',
  borderRadius: '4px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '7px',
  transition: 'background 0.12s, border-color 0.12s',
};

const subCatRowStyle: React.CSSProperties = {
  padding: '7px 10px',
  fontSize: '12px',
  borderRadius: '4px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  transition: 'background 0.12s, border-color 0.12s',
};

const nodeButtonStyle: React.CSSProperties = {
  width: '100%',
  padding: '7px 10px',
  background: 'transparent',
  border: 'none',
  borderLeft: '2px solid transparent',
  color: '#ccc',
  textAlign: 'left',
  fontSize: '12px',
  cursor: 'pointer',
  borderRadius: '3px',
  display: 'block',
  transition: 'background 0.12s, color 0.12s, border-color 0.12s',
};