import type { CSSProperties } from 'react';

// ─── Node Container ────────────────────────────────────────────

export function nodeContainer(borderColor: string, selected: boolean): CSSProperties {
  return {
    background: '#1a1a1a',
    color: '#fff',
    borderRadius: '4px',
    border: selected ? '2px solid #fff' : `2px solid ${borderColor}`,
    minWidth: '200px',
    boxShadow: selected
      ? `0 0 20px ${borderColor}cc`
      : '0 10px 15px rgba(0,0,0,0.5)',
    transition: 'all 0.2s ease',
    fontFamily: 'Segoe UI, Tahoma, sans-serif',
  };
}

// ─── Node Header ───────────────────────────────────────────────

/** Gradient header used by most nodes */
export function nodeHeaderGradient(accentColor: string): CSSProperties {
  return {
    background: `linear-gradient(90deg, ${accentColor}44 0%, #3a3a3a 100%)`,
    padding: '8px 10px',
    fontSize: '11px',
    fontWeight: 'bold',
    borderBottom: '1px solid #000',
    display: 'flex',
    justifyContent: 'space-between',
  };
}

/** Solid-color header (CallMethod, Math, Branch, While, SetLocalVar) */
export function nodeHeaderSolid(bgColor: string): CSSProperties {
  return {
    background: bgColor,
    padding: '8px',
    fontSize: '12px',
    fontWeight: 'bold',
    borderTopLeftRadius: '2px',
    borderTopRightRadius: '2px',
  };
}

// ─── Handle Styles ─────────────────────────────────────────────

export function execHandleStyle(side: 'left' | 'right' | 'top' | 'bottom'): CSSProperties {
  const base: CSSProperties = {
    background: '#fff',
    width: '10px',
    height: '14px',
    borderRadius: '2px',
  };
  if (side === 'left') return { ...base, left: '-6px' };
  if (side === 'right') return { ...base, right: '-6px' };
  if (side === 'top') return { ...base, width: '10px', height: '6px', top: '-5px' };
  return { ...base, width: '10px', height: '6px', bottom: '-5px' };
}

export function dataHandleStyle(color: string, side: 'left' | 'right'): CSSProperties {
  return {
    background: color,
    width: '10px',
    height: '10px',
    ...(side === 'left' ? { left: '-6px' } : { right: '-6px' }),
  };
}

export function paramHandleStyle(color: string, side: 'left' | 'right'): CSSProperties {
  return {
    background: color,
    width: '8px',
    height: '8px',
    border: '2px solid #1a1a1a',
    ...(side === 'left' ? { left: '-22px' } : { right: '-22px' }),
  };
}

// ─── Section Styles ────────────────────────────────────────────

export const sectionBox: CSSProperties = {
  background: '#00000044',
  borderRadius: '4px',
  padding: '8px',
};

export const sectionHeader = (color: string): CSSProperties => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '8px',
  fontSize: '9px',
  fontWeight: 'bold',
  color,
});

// ─── Form Inputs ───────────────────────────────────────────────

export const nodeInputStyle: CSSProperties = {
  background: '#000',
  border: '1px solid #444',
  color: '#fff',
  padding: '5px',
  fontSize: '12px',
  outline: 'none',
};

export const nodeSelectStyle: CSSProperties = {
  background: '#000',
  border: '1px solid #444',
  color: '#9b59b6',
  padding: '4px',
  fontSize: '11px',
  outline: 'none',
  cursor: 'pointer',
};

export const smallButton = (bgColor: string): CSSProperties => ({
  background: bgColor,
  border: 'none',
  color: '#fff',
  borderRadius: '2px',
  fontSize: '10px',
  cursor: 'pointer',
  padding: '2px 6px',
});

// ─── Pin Row ───────────────────────────────────────────────────

export const pinRow: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  position: 'relative',
};

export const typeDot = (color: string): CSSProperties => ({
  width: '6px',
  height: '6px',
  borderRadius: '1px',
  background: color,
});

// ─── Exec Footer ───────────────────────────────────────────────

export const execFooter: CSSProperties = {
  padding: '0px 10px 12px 10px',
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
  position: 'relative',
};

export const execFooterLabel: CSSProperties = {
  fontSize: '11px',
  color: '#fff',
  fontWeight: 'bold',
  marginRight: '5px',
};
