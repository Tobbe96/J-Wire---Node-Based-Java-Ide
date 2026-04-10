'use client';
import React, { memo, useState, useCallback } from 'react';
import { useDebugStore } from '../store/debugStore';

interface ControlBtn {
  id: string;
  icon: string;
  title: string;
  color: string;
  hoverColor: string;
  onClick: () => void;
  disabled: boolean;
}

const DebugPanel = () => {
  const {
    isDebugging,
    traceSteps,
    currentStepIndex,
    isPlaying,
    breakpoints,
    stepForward,
    stepBack,
    continueToBreakpoint,
    stopDebug,
    playAll,
    stopPlayback,
  } = useDebugStore();

  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null);

  const handleMouseEnter = useCallback((id: string) => setHoveredBtn(id), []);
  const handleMouseLeave = useCallback(() => setHoveredBtn(null), []);

  if (!isDebugging) return null;

  const currentStep = currentStepIndex >= 0 ? traceSteps[currentStepIndex] : null;
  const atEnd = currentStepIndex >= traceSteps.length - 1;
  const atStart = currentStepIndex <= 0;

  const buttons: ControlBtn[] = [
    { id: 'back', icon: '◀', title: 'Step Back', color: '#999', hoverColor: '#fff', onClick: stepBack, disabled: atStart },
    { id: 'forward', icon: '▶', title: 'Step Forward', color: '#999', hoverColor: '#fff', onClick: stepForward, disabled: atEnd },
    ...(isPlaying
      ? [{ id: 'pause', icon: '\u2016', title: 'Pause', color: '#fbbf24', hoverColor: '#fde68a', onClick: stopPlayback, disabled: false }]
      : [{ id: 'play', icon: '▷', title: 'Play', color: '#22c55e', hoverColor: '#4ade80', onClick: playAll, disabled: atEnd }]),
    { id: 'continue', icon: '⏩', title: 'Continue to Breakpoint', color: '#3b82f6', hoverColor: '#60a5fa', onClick: continueToBreakpoint, disabled: atEnd },
    { id: 'stop', icon: '■', title: 'Stop Debug', color: '#ef4444', hoverColor: '#f87171', onClick: stopDebug, disabled: false },
  ];

  return (
    <div style={panelStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <span style={headerTitleStyle}>DEBUGGER</span>
        <span style={headerStepStyle}>
          {currentStepIndex + 1}<span style={{ color: '#555', margin: '0 2px' }}>/</span>{traceSteps.length}
        </span>
      </div>

      {/* Controls */}
      <div style={controlsRowStyle}>
        <div style={controlsGroupStyle}>
          {buttons.map((btn, i) => {
            const isHovered = hoveredBtn === btn.id && !btn.disabled;
            const isFirst = i === 0;
            const isLast = i === buttons.length - 1;
            const style: React.CSSProperties = {
              ...controlBtnBase,
              color: isHovered ? btn.hoverColor : btn.color,
              background: isHovered ? '#2a2a2a' : '#1e1e1e',
              opacity: btn.disabled ? 0.3 : 1,
              cursor: btn.disabled ? 'not-allowed' : 'pointer',
              borderRadius: isFirst ? '5px 0 0 5px' : isLast ? '0 5px 5px 0' : 0,
              borderRight: isLast ? '1px solid #333' : 'none',
            };
            return (
              <button
                key={btn.id}
                style={style}
                onClick={btn.onClick}
                disabled={btn.disabled}
                title={btn.title}
                onMouseEnter={() => handleMouseEnter(btn.id)}
                onMouseLeave={handleMouseLeave}
              >
                {btn.icon}
              </button>
            );
          })}
        </div>
      </div>

      {/* Current action */}
      {currentStep && (
        <div style={sectionStyle}>
          <div style={labelStyle}>Action</div>
          <div style={actionValueStyle}>
            {currentStep.action}
          </div>
        </div>
      )}

      {/* Call stack */}
      {currentStep && currentStep.callStack.length > 0 && (
        <div style={sectionStyle}>
          <div style={labelStyle}>Call Stack</div>
          {currentStep.callStack.map((frame, i) => (
            <div key={i} style={{ color: '#a78bfa', fontSize: 11, fontFamily: 'monospace', paddingLeft: i * 8 }}>
              {i > 0 ? '→ ' : ''}{frame}()
            </div>
          ))}
        </div>
      )}

      {/* Global variables */}
      {currentStep && Object.keys(currentStep.globalMemory).length > 0 && (
        <div style={sectionStyle}>
          <div style={labelStyle}>Globals</div>
          {Object.entries(currentStep.globalMemory).map(([key, val]) => (
            <div key={key} style={varRowStyle}>
              <span style={{ color: '#22c55e' }}>{key}</span>
              <span style={{ color: '#d1d5db' }}>{formatValue(val)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Local scope */}
      {currentStep && Object.keys(currentStep.localScope).filter(k => !k.startsWith('__')).length > 0 && (
        <div style={sectionStyle}>
          <div style={labelStyle}>Locals</div>
          {Object.entries(currentStep.localScope)
            .filter(([k]) => !k.startsWith('__'))
            .map(([key, val]) => (
              <div key={key} style={varRowStyle}>
                <span style={{ color: '#60a5fa' }}>{key}</span>
                <span style={{ color: '#d1d5db' }}>{formatValue(val)}</span>
              </div>
            ))}
        </div>
      )}

      {/* Console output */}
      {currentStep && currentStep.consoleOutput.length > 0 && (
        <div style={sectionStyle}>
          <div style={labelStyle}>Console</div>
          <div style={{ maxHeight: 80, overflowY: 'auto' }}>
            {currentStep.consoleOutput.map((line, i) => (
              <div key={i} style={{ color: '#22c55e', fontSize: 11, fontFamily: 'monospace', lineHeight: '16px' }}>
                {line}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Breakpoints */}
      {breakpoints.length > 0 && (
        <div style={sectionStyle}>
          <div style={labelStyle}>Breakpoints ({breakpoints.length})</div>
          <div style={{ fontSize: 10, color: '#666', fontFamily: 'monospace' }}>
            {breakpoints.map(id => id.slice(0, 12)).join(', ')}
          </div>
        </div>
      )}
    </div>
  );
};

function formatValue(val: unknown): string {
  if (val === null || val === undefined) return 'null';
  if (Array.isArray(val)) return `[${val.join(', ')}]`;
  if (typeof val === 'string') return `"${val}"`;
  return String(val);
}

export default memo(DebugPanel);

// --- Styles ---
const panelStyle: React.CSSProperties = {
  position: 'absolute',
  top: 50,
  left: 10,
  width: 260,
  maxHeight: 'calc(100vh - 100px)',
  overflowY: 'auto',
  background: 'rgba(15, 15, 15, 0.95)',
  border: '1px solid #2a2a2a',
  borderRadius: 8,
  zIndex: 30,
  backdropFilter: 'blur(8px)',
  boxShadow: '0 4px 24px rgba(0, 0, 0, 0.5)',
};

const headerStyle: React.CSSProperties = {
  padding: '8px 12px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: '1px solid #222',
};

const headerTitleStyle: React.CSSProperties = {
  fontWeight: 600,
  fontSize: 11,
  color: '#999',
  letterSpacing: '0.08em',
  fontFamily: 'system-ui, -apple-system, sans-serif',
};

const headerStepStyle: React.CSSProperties = {
  fontSize: 11,
  color: '#777',
  fontFamily: 'monospace',
  fontVariantNumeric: 'tabular-nums',
};

const controlsRowStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderBottom: '1px solid #222',
};

const controlsGroupStyle: React.CSSProperties = {
  display: 'flex',
  borderRadius: 5,
  overflow: 'hidden',
  border: '1px solid #333',
};

const controlBtnBase: React.CSSProperties = {
  height: 26,
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  borderLeft: '1px solid #333',
  background: '#1e1e1e',
  fontSize: 12,
  lineHeight: 1,
  padding: 0,
  transition: 'background 0.15s ease, color 0.15s ease',
};

const sectionStyle: React.CSSProperties = {
  padding: '6px 12px',
  borderBottom: '1px solid #1a1a1a',
};

const labelStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 600,
  color: '#555',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: 3,
  fontFamily: 'system-ui, -apple-system, sans-serif',
};

const actionValueStyle: React.CSSProperties = {
  color: '#e2e8f0',
  fontSize: 12,
  fontFamily: 'monospace',
  lineHeight: '16px',
};

const varRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: 11,
  fontFamily: 'monospace',
  padding: '1px 0',
  lineHeight: '16px',
};
