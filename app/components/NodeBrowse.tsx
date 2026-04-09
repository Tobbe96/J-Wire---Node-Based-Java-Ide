import React, { useState, useMemo, useEffect, useRef } from 'react';
import { NODE_CATEGORIES, NODE_CONFIGS } from '../utils/nodeRegistry';

interface NodeBrowserProps {
  position: { x: number; y: number };
  onAddNode: (nodeKind: string) => void;
  onClose: () => void;
}

export default function NodeBrowser({ position, onAddNode, onClose }: NodeBrowserProps) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus search bar when menu opens
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const isNearRightEdge = position.x > (typeof window !== 'undefined' ? window.innerWidth - 400 : 0);

  // Flattened search logic
  const filteredNodes = useMemo(() => {
    if (!searchTerm) return [];
    return Object.keys(NODE_CONFIGS).filter((key) => {
      const label = NODE_CONFIGS[key].data.label || '';
      return (
        key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        label.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [searchTerm]);

  return (
    <div 
      style={{ ...browserStyle, left: position.x, top: position.y }}
      onMouseLeave={() => setHoveredCategory(null)}
    >
      {/* SEARCH INPUT */}
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

      {/* FIXED: overflowY is now 'visible' so submenus can pop out without scrolling */}
      <div style={{ maxHeight: '350px', overflowY: 'visible', padding: '4px' }}>
        {searchTerm === '' ? (
          /* CATEGORY VIEW */
          Object.keys(NODE_CATEGORIES).map((cat) => (
            <div 
              key={cat} 
              style={{ position: 'relative' }}
              onMouseEnter={() => setHoveredCategory(cat)}
            >
              <div style={{
                ...itemStyle, 
                background: hoveredCategory === cat ? '#3498db' : 'transparent',
                color: hoveredCategory === cat ? '#fff' : '#ccc'
              }}>
                <span>{cat}</span>
                <span style={{ fontSize: '9px' }}>▶</span>
              </div>

              {hoveredCategory === cat && (
                <div style={{ ...subMenuStyle, left: isNearRightEdge ? '-182px' : '100%' }}>
                  {NODE_CATEGORIES[cat as keyof typeof NODE_CATEGORIES].map((nodeKind) => (
                    <button 
                      key={nodeKind} 
                      onClick={() => { onAddNode(nodeKind); onClose(); }} 
                      style={buttonStyle}
                    >
                      + {NODE_CONFIGS[nodeKind].data.label || nodeKind}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          /* SEARCH RESULTS VIEW */
          <div>
            {filteredNodes.length > 0 ? (
              filteredNodes.map((nodeKind) => (
                <button 
                  key={nodeKind} 
                  onClick={() => { onAddNode(nodeKind); onClose(); }} 
                  style={buttonStyle}
                >
                  <span style={{ color: '#3498db', marginRight: '8px' }}>•</span>
                  {NODE_CONFIGS[nodeKind].data.label || nodeKind}
                </button>
              ))
            ) : (
              <div style={{ padding: '10px', fontSize: '11px', color: '#666', textAlign: 'center' }}>
                No nodes match "{searchTerm}"
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// --- STYLES ---
const browserStyle: React.CSSProperties = {
  position: 'fixed',
  width: '200px',
  background: '#1a1a1a',
  border: '1px solid #444',
  borderRadius: '8px',
  zIndex: 9999,
  boxShadow: '0 10px 40px rgba(0,0,0,0.8)',
  pointerEvents: 'all', // FIXED: Ensures the menu registers clicks properly
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
  boxSizing: 'border-box' // Prevents input from spilling over the padding
};

const subMenuStyle: React.CSSProperties = {
  position: 'absolute',
  top: '0',
  width: '180px',
  marginLeft: '-2px', // FIXED: Slight overlap to prevent the mouse from "falling off" and closing the menu
  background: '#1a1a1a',
  border: '1px solid #444',
  borderRadius: '6px',
  padding: '4px',
  boxShadow: '0 10px 30px rgba(0,0,0,0.7)',
  zIndex: 10000, // FIXED: Ensure submenu stays above the parent menu
};

const itemStyle: React.CSSProperties = {
  padding: '8px 12px',
  fontSize: '12px',
  borderRadius: '4px',
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const buttonStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  background: 'transparent',
  border: 'none',
  color: '#ddd',
  textAlign: 'left',
  fontSize: '12px',
  cursor: 'pointer',
  borderRadius: '4px',
  display: 'block',
  transition: 'background 0.1s',
  borderBottom: '1px solid #222'
};