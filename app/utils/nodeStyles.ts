import type { CSSProperties } from 'react';

// ─── Node Container ────────────────────────────────────────────

export function nodeContainer(borderColor: string, selected: boolean, vfx = true): CSSProperties {
  const baseShadow = `inset 0 2px 0 ${borderColor}, inset 0 1px 0 rgba(255,255,255,0.04)`;
  const outerShadow = '0 8px 32px rgba(0,0,0,0.5)';
  const glowIdle = vfx ? `0 0 18px ${borderColor}18` : '';
  const glowSelected = vfx
    ? `0 0 30px ${borderColor}88, 0 0 60px ${borderColor}33`
    : `0 0 20px ${borderColor}cc`;

  return {
    background: 'linear-gradient(180deg, #1c1c2e 0%, #151521 100%)',
    color: '#fff',
    borderRadius: '8px',
    border: selected
      ? `1px solid rgba(255,255,255,0.45)`
      : `1px solid rgba(255,255,255,0.07)`,
    minWidth: '200px',
    boxShadow: selected
      ? `${baseShadow}, ${glowSelected}, ${outerShadow}`
      : `${baseShadow}, ${glowIdle}, ${outerShadow}`,
    transition: 'box-shadow 0.3s ease, border-color 0.3s ease, transform 0.2s ease, filter 0.3s ease',
    fontFamily: "'Segoe UI', Tahoma, sans-serif",
    animation: vfx && selected ? 'vfx-node-glow 2s ease-in-out infinite' : undefined,
  };
}

// ─── Node Header ───────────────────────────────────────────────

/** Gradient header used by most nodes */
export function nodeHeaderGradient(accentColor: string): CSSProperties {
  return {
    background: `linear-gradient(90deg, ${accentColor}33 0%, rgba(255,255,255,0.03) 100%)`,
    padding: '8px 12px',
    fontSize: '11px',
    fontWeight: 'bold',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    borderTopLeftRadius: '7px',
    borderTopRightRadius: '7px',
    display: 'flex',
    justifyContent: 'space-between',
    textShadow: `0 0 12px ${accentColor}66`,
    letterSpacing: '0.5px',
  };
}

/** Solid-color header (CallMethod, Math, Branch, While, SetLocalVar) */
export function nodeHeaderSolid(bgColor: string): CSSProperties {
  return {
    background: `linear-gradient(90deg, ${bgColor} 0%, ${bgColor}99 100%)`,
    padding: '8px 12px',
    fontSize: '12px',
    fontWeight: 'bold',
    borderTopLeftRadius: '7px',
    borderTopRightRadius: '7px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    textShadow: `0 0 10px ${bgColor}88`,
    letterSpacing: '0.5px',
  };
}

// ─── Handle Styles ─────────────────────────────────────────────

export function execHandleStyle(side: 'left' | 'right', vfx = true): CSSProperties {
  return {
    background: '#fff',
    width: '10px',
    height: '14px',
    borderRadius: '2px',
    border: '1px solid rgba(255,255,255,0.3)',
    boxShadow: vfx ? '0 0 8px rgba(255,255,255,0.4)' : undefined,
    transition: 'box-shadow 0.2s ease, transform 0.2s ease',
    ...(side === 'left' ? { left: '-6px' } : { right: '-6px' }),
  };
}

export function dataHandleStyle(color: string, side: 'left' | 'right', vfx = true): CSSProperties {
  return {
    background: color,
    width: '10px',
    height: '10px',
    border: `1px solid ${color}66`,
    boxShadow: vfx ? `0 0 8px ${color}66` : undefined,
    transition: 'box-shadow 0.2s ease, transform 0.2s ease',
    ...(side === 'left' ? { left: '-6px' } : { right: '-6px' }),
  };
}

export function paramHandleStyle(color: string, side: 'left' | 'right', vfx = true): CSSProperties {
  return {
    background: color,
    width: '8px',
    height: '8px',
    border: '2px solid #151521',
    boxShadow: vfx ? `0 0 6px ${color}55` : undefined,
    transition: 'box-shadow 0.2s ease, transform 0.2s ease',
    ...(side === 'left' ? { left: '-22px' } : { right: '-22px' }),
  };
}

// ─── Section Styles ────────────────────────────────────────────

export const sectionBox: CSSProperties = {
  background: 'rgba(0,0,0,0.3)',
  borderRadius: '6px',
  padding: '8px',
  border: '1px solid rgba(255,255,255,0.04)',
};

export const sectionHeader = (color: string): CSSProperties => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '8px',
  fontSize: '9px',
  fontWeight: 'bold',
  color,
  letterSpacing: '0.5px',
});

// ─── Form Inputs ───────────────────────────────────────────────

export const nodeInputStyle: CSSProperties = {
  background: 'rgba(0,0,0,0.5)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: '#fff',
  padding: '5px 8px',
  fontSize: '12px',
  outline: 'none',
  borderRadius: '4px',
  transition: 'border-color 0.2s ease',
};

export const inlineInputStyle: CSSProperties = {
  background: 'rgba(0,0,0,0.5)',
  border: '1px solid rgba(255,255,255,0.15)',
  color: '#ccc',
  padding: '3px 6px',
  fontSize: '10px',
  outline: 'none',
  borderRadius: '3px',
  width: '80px',
};

export const nodeSelectStyle: CSSProperties = {
  background: 'rgba(0,0,0,0.5)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: '#9b59b6',
  padding: '4px 8px',
  fontSize: '11px',
  outline: 'none',
  cursor: 'pointer',
  borderRadius: '4px',
};

export const smallButton = (bgColor: string): CSSProperties => ({
  background: `${bgColor}cc`,
  border: '1px solid rgba(255,255,255,0.1)',
  color: '#fff',
  borderRadius: '4px',
  fontSize: '10px',
  cursor: 'pointer',
  padding: '2px 8px',
  transition: 'background 0.2s ease',
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
  borderRadius: '2px',
  background: color,
  boxShadow: `0 0 4px ${color}88`,
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
