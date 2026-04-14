'use client';
import React, { memo, useEffect, useRef } from 'react';

interface ContextMenuProps {
  x: number;
  y: number;
  type: 'node' | 'pane';
  onClose: () => void;
  onCopy?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onPaste?: () => void;
  onSelectAll?: () => void;
  onOpenNodeBrowser?: () => void;
}

const btnStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  width: '100%',
  padding: '6px 12px',
  background: 'transparent',
  border: 'none',
  color: 'var(--ctx-text, #e0e0e0)',
  fontSize: 12,
  cursor: 'pointer',
  textAlign: 'left',
  borderRadius: 4,
  transition: 'background 0.1s',
};

const handleHover = (e: React.MouseEvent<HTMLButtonElement>, enter: boolean) => {
  e.currentTarget.style.background = enter ? 'var(--ctx-hover, rgba(255,255,255,0.08))' : 'transparent';
};

interface ItemProps {
  icon: string;
  label: string;
  shortcut?: string;
  onClick?: () => void;
  danger?: boolean;
  onClose: () => void;
}

const Item = memo(({ icon, label, shortcut, onClick, danger, onClose }: ItemProps) => (
  <button
    role="menuitem"
    style={{ ...btnStyle, color: danger ? '#f87171' : 'var(--ctx-text, #e0e0e0)' }}
    onClick={() => { onClick?.(); onClose(); }}
    onMouseEnter={(e) => handleHover(e, true)}
    onMouseLeave={(e) => handleHover(e, false)}
  >
    <span style={{ width: 14, textAlign: 'center', opacity: 0.7 }}>{icon}</span>
    <span style={{ flex: 1 }}>{label}</span>
    {shortcut && <span style={{ opacity: 0.4, fontSize: 10 }}>{shortcut}</span>}
  </button>
));
Item.displayName = 'ContextMenuItem';

const Divider = () => (
  <div role="separator" style={{ height: 1, background: 'var(--ctx-border, rgba(255,255,255,0.08))', margin: '3px 8px' }} />
);

export default function ContextMenu({
  x, y, type, onClose,
  onCopy, onDuplicate, onDelete,
  onPaste, onSelectAll, onOpenNodeBrowser,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click or Escape
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Focus first menu item on mount & keyboard navigation
  useEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;
    const items = () => menu.querySelectorAll<HTMLElement>('[role="menuitem"]');
    const first = items()[0];
    if (first) first.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      const list = Array.from(items());
      const idx = list.indexOf(document.activeElement as HTMLElement);
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        list[(idx + 1) % list.length]?.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        list[(idx - 1 + list.length) % list.length]?.focus();
      } else if (e.key === 'Home') {
        e.preventDefault();
        list[0]?.focus();
      } else if (e.key === 'End') {
        e.preventDefault();
        list[list.length - 1]?.focus();
      }
    };

    menu.addEventListener('keydown', handleKeyDown);
    return () => menu.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Clamp to viewport
  const ww = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const wh = typeof window !== 'undefined' ? window.innerHeight : 900;
  const menuW = 160;
  const menuH = type === 'node' ? 110 : 115;
  const cx = Math.min(x, ww - menuW - 8);
  const cy = Math.min(y, wh - menuH - 8);

  return (
    <div
      ref={menuRef}
      role="menu"
      style={{
        position: 'fixed',
        left: cx,
        top: cy,
        width: menuW,
        background: 'var(--ctx-bg, #1e1e1e)',
        border: '1px solid var(--ctx-border, rgba(255,255,255,0.12))',
        borderRadius: 7,
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        zIndex: 9999,
        padding: '4px 0',
        userSelect: 'none',
      }}
    >
      {type === 'node' ? (
        <>
          <Item icon="⎘" label="Copy" shortcut="Ctrl+C" onClick={onCopy} onClose={onClose} />
          <Item icon="⧉" label="Duplicate" shortcut="Ctrl+D" onClick={onDuplicate} onClose={onClose} />
          <Divider />
          <Item icon="✕" label="Delete" shortcut="Del" onClick={onDelete} danger onClose={onClose} />
        </>
      ) : (
        <>
          <Item icon="⎘" label="Paste" shortcut="Ctrl+V" onClick={onPaste} onClose={onClose} />
          <Item icon="⊡" label="Select All" shortcut="Ctrl+A" onClick={onSelectAll} onClose={onClose} />
          <Divider />
          <Item icon="+" label="Add Node…" shortcut="Tab" onClick={onOpenNodeBrowser} onClose={onClose} />
        </>
      )}
    </div>
  );
}
