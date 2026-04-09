'use client';
import React, { memo } from 'react';
import { useDebugStore } from '../store/debugStore';

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

  if (!isDebugging) return null;

  const currentStep = currentStepIndex >= 0 ? traceSteps[currentStepIndex] : null;
  const atEnd = currentStepIndex >= traceSteps.length - 1;
  const atStart = currentStepIndex <= 0;

  return (
    <div style={panelStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <span style={{ fontWeight: 700, fontSize: 12, color: '#fbbf24' }}>🐛 DEBUGGER</span>
        <span style={{ fontSize: 11, color: '#888' }}>
          Step {currentStepIndex + 1} / {traceSteps.length}
        </span>
      </div>

      {/* Controls */}
      <div style={controlsStyle}>
        <button style={btnStyle} onClick={stepBack} disabled={atStart} title="Step Back">
          ⏮
        </button>
        <button style={btnStyle} onClick={stepForward} disabled={atEnd} title="Step Forward">
          ⏭
        </button>
        {isPlaying ? (
          <button style={{ ...btnStyle, background: '#ef4444' }} onClick={stopPlayback} title="Pause">
            ⏸
          </button>
        ) : (
          <button style={{ ...btnStyle, background: '#22c55e' }} onClick={playAll} disabled={atEnd} title="Play">
            ▶
          </button>
        )}
        <button style={{ ...btnStyle, background: '#3b82f6' }} onClick={continueToBreakpoint} disabled={atEnd} title="Continue to Breakpoint">
          ⏩
        </button>
        <button style={{ ...btnStyle, background: '#ef4444' }} onClick={stopDebug} title="Stop Debug">
          ⏹
        </button>
      </div>

      {/* Current action */}
      {currentStep && (
        <div style={sectionStyle}>
          <div style={labelStyle}>Current Action</div>
          <div style={{ color: '#fbbf24', fontSize: 12, fontFamily: 'monospace' }}>
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
          <div style={labelStyle}>Global Variables</div>
          {Object.entries(currentStep.globalMemory).map(([key, val]) => (
            <div key={key} style={varRowStyle}>
              <span style={{ color: '#22c55e' }}>{key}</span>
              <span style={{ color: '#e5e7eb' }}>{formatValue(val)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Local scope */}
      {currentStep && Object.keys(currentStep.localScope).filter(k => !k.startsWith('__')).length > 0 && (
        <div style={sectionStyle}>
          <div style={labelStyle}>Local Scope</div>
          {Object.entries(currentStep.localScope)
            .filter(([k]) => !k.startsWith('__'))
            .map(([key, val]) => (
              <div key={key} style={varRowStyle}>
                <span style={{ color: '#60a5fa' }}>{key}</span>
                <span style={{ color: '#e5e7eb' }}>{formatValue(val)}</span>
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
              <div key={i} style={{ color: '#22c55e', fontSize: 11, fontFamily: 'monospace' }}>
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
          <div style={{ fontSize: 10, color: '#888' }}>
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
  border: '1px solid #fbbf24',
  borderRadius: 8,
  zIndex: 30,
  backdropFilter: 'blur(8px)',
};

const headerStyle: React.CSSProperties = {
  padding: '8px 12px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: '1px solid #333',
};

const controlsStyle: React.CSSProperties = {
  padding: '6px 12px',
  display: 'flex',
  gap: 4,
  borderBottom: '1px solid #222',
};

const btnStyle: React.CSSProperties = {
  background: '#333',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  padding: '4px 8px',
  fontSize: 14,
  cursor: 'pointer',
  flex: 1,
};

const sectionStyle: React.CSSProperties = {
  padding: '6px 12px',
  borderBottom: '1px solid #222',
};

const labelStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  color: '#666',
  textTransform: 'uppercase',
  marginBottom: 4,
};

const varRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: 11,
  fontFamily: 'monospace',
  padding: '1px 0',
};
