'use client';
import React, { memo, useRef, useEffect, useCallback, useState } from 'react';
import { useVfxStore } from '../../store/vfxStore';
import { useEditorStore } from '../../store/editorStore';

interface TerminalProps {
  consoleOutput: string[];
  onRun: () => void;
  onRunJava?: () => void;
  onDebug?: () => void;
  isCompiling?: boolean;
  isDebugging?: boolean;
  height?: number;
}

const Terminal = ({ consoleOutput, onRun, onRunJava, onDebug, isCompiling, isDebugging, height }: TerminalProps) => {
  const vfxEnabled = useVfxStore((s) => s.vfxEnabled);
  const inputMode = useEditorStore((s) => s.inputMode);
  const pendingInputs = useEditorStore((s) => s.pendingInputs);
  const updatePendingInput = useEditorStore((s) => s.updatePendingInput);
  const submitInputs = useEditorStore((s) => s.submitInputs);
  const cancelInputs = useEditorStore((s) => s.cancelInputs);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const isCollecting = inputMode === 'collecting';

  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null);

  // Auto-focus first empty input when collecting starts
  useEffect(() => {
    if (isCollecting && inputRefs.current.length > 0) {
      const firstEmpty = pendingInputs.findIndex(p => p.value === '');
      const target = inputRefs.current[firstEmpty >= 0 ? firstEmpty : 0];
      target?.focus();
    }
  }, [isCollecting, pendingInputs.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // If last input, submit all; otherwise focus next
      if (index === pendingInputs.length - 1) {
        submitInputs();
      } else {
        inputRefs.current[index + 1]?.focus();
      }
    }
    if (e.key === 'Escape') {
      cancelInputs();
    }
  }, [pendingInputs.length, submitInputs, cancelInputs]);

  return (
    <div style={{ ...containerStyle, ...(height != null ? { height } : {}) }}>
      <div style={headerStyle}>
        <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#fff' }}>TERMINAL</span>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={onRun}
            disabled={isCollecting}
            onMouseEnter={() => setHoveredBtn('run')}
            onMouseLeave={() => setHoveredBtn(null)}
            style={{
              ...toolbarBtnBase,
              background: hoveredBtn === 'run' ? '#243824' : '#1a2e1a',
              borderLeft: '2px solid #22c55e',
              color: '#22c55e',
              ...(isCollecting ? { opacity: 0.4, cursor: 'not-allowed' } : {}),
              ...(vfxEnabled ? { boxShadow: '0 0 6px #22c55e22' } : {}),
            }}
          >
            ▶ Run
          </button>
          {onRunJava && (
            <button
              onClick={onRunJava}
              disabled={isCompiling || isCollecting}
              onMouseEnter={() => setHoveredBtn('java')}
              onMouseLeave={() => setHoveredBtn(null)}
              style={{
                ...toolbarBtnBase,
                background: hoveredBtn === 'java' ? '#3d2a15' : '#2e1f0f',
                borderLeft: '2px solid #f97316',
                color: '#f97316',
                ...(isCompiling || isCollecting ? { opacity: 0.4, cursor: 'not-allowed' } : {}),
                ...(vfxEnabled && isCompiling
                  ? { animation: 'vfx-btn-glow 1s ease-in-out infinite', '--btn-glow-color': '#f9731688' } as React.CSSProperties
                  : {}),
              }}
            >
              {isCompiling ? '⟳ Compiling' : '▶ Java'}
            </button>
          )}
          {onDebug && (
            <button
              onClick={onDebug}
              onMouseEnter={() => setHoveredBtn('debug')}
              onMouseLeave={() => setHoveredBtn(null)}
              style={{
                ...toolbarBtnBase,
                background: isDebugging
                  ? (hoveredBtn === 'debug' ? '#3d1a1a' : '#2e1010')
                  : (hoveredBtn === 'debug' ? '#3d3215' : '#2e2508'),
                borderLeft: isDebugging ? '2px solid #ef4444' : '2px solid #fbbf24',
                color: isDebugging ? '#ef4444' : '#fbbf24',
                ...(vfxEnabled && isDebugging
                  ? { boxShadow: '0 0 8px #ef444444' }
                  : {}),
              }}
            >
              {isDebugging ? '■ Stop' : '● Debug'}
            </button>
          )}
        </div>
      </div>
      <div style={{ ...outputStyle, position: 'relative' }}>
        {/* Scanline overlay */}
        {vfxEnabled && (
          <div style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.015) 2px, rgba(255,255,255,0.015) 4px)',
            zIndex: 1,
          }} />
        )}

        {/* Console output lines */}
        {!isCollecting && consoleOutput.length === 0 && (
          <span style={{ color: '#555' }}>Ready to run...</span>
        )}
        {consoleOutput.map((line, i) => (
          <div
            key={i}
            style={{
              marginBottom: '6px',
              color: line.startsWith('>') ? '#22c55e' : '#fff',
              ...(vfxEnabled ? { animation: 'vfx-line-fade-in 0.25s ease-out both', animationDelay: `${i * 30}ms` } : {}),
            }}
          >
            {line}
          </div>
        ))}

        {/* Inline input form for scanner nodes */}
        {isCollecting && (
          <div style={inputFormStyle}>
            <div style={{ color: '#22c55e', marginBottom: '8px', fontWeight: 'bold', fontSize: '12px' }}>
              ⌨ Provide input values:
            </div>
            {pendingInputs.map((input, i) => (
              <div key={i} style={inputRowStyle}>
                <span style={promptLabelStyle}>{input.prompt}</span>
                <input
                  ref={el => { inputRefs.current[i] = el; }}
                  type="text"
                  value={input.value}
                  onChange={(e) => updatePendingInput(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  style={terminalInputStyle}
                  placeholder="type here..."
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
            ))}
            <div style={inputButtonRowStyle}>
              <button
                onClick={submitInputs}
                onMouseEnter={() => setHoveredBtn('submit')}
                onMouseLeave={() => setHoveredBtn(null)}
                style={{
                  ...toolbarBtnBase,
                  background: hoveredBtn === 'submit' ? '#243824' : '#1a2e1a',
                  borderLeft: '2px solid #22c55e',
                  color: '#22c55e',
                  padding: '4px 10px',
                }}
              >
                ▶ Submit
              </button>
              <button
                onClick={cancelInputs}
                onMouseEnter={() => setHoveredBtn('cancel')}
                onMouseLeave={() => setHoveredBtn(null)}
                style={{
                  ...toolbarBtnBase,
                  background: hoveredBtn === 'cancel' ? '#252525' : '#1e1e1e',
                  border: `1px solid ${hoveredBtn === 'cancel' ? '#666' : '#444'}`,
                  color: '#888',
                  padding: '4px 10px',
                }}
              >
                Cancel
              </button>
              <span style={{ color: '#555', fontSize: '10px', marginLeft: '8px' }}>
                Enter to advance • Esc to cancel
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(Terminal);

const containerStyle: React.CSSProperties = {
  height: '250px',
  background: '#0a0a0a',
  display: 'flex',
  flexDirection: 'column',
  borderTop: '2px solid #333',
};

const headerStyle: React.CSSProperties = {
  padding: '10px 15px',
  background: '#111',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: '1px solid #333',
};

const toolbarBtnBase: React.CSSProperties = {
  background: '#1e1e1e',
  color: '#ccc',
  border: '1px solid #333',
  borderLeft: '2px solid #555',
  padding: '5px 12px',
  borderRadius: '4px',
  fontSize: '11px',
  fontWeight: 'bold',
  letterSpacing: '0.5px',
  textTransform: 'uppercase',
  fontFamily: 'inherit',
  cursor: 'pointer',
  transition: 'background 0.15s ease, border-color 0.15s ease',
  lineHeight: '1.4',
};

const outputStyle: React.CSSProperties = {
  padding: '12px',
  overflowY: 'auto',
  flex: 1,
  fontFamily: 'monospace',
  fontSize: '13px',
  color: '#a6accd',
};

const inputFormStyle: React.CSSProperties = {
  marginTop: '8px',
  padding: '10px',
  background: '#111',
  borderRadius: '6px',
  border: '1px solid #333',
};

const inputRowStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  marginBottom: '8px',
  gap: '2px',
};

const promptLabelStyle: React.CSSProperties = {
  color: '#fbbf24',
  fontSize: '11px',
  fontFamily: 'monospace',
};

const terminalInputStyle: React.CSSProperties = {
  background: '#0a0a0a',
  border: '1px solid #444',
  borderRadius: '3px',
  color: '#22c55e',
  fontFamily: 'monospace',
  fontSize: '13px',
  padding: '6px 8px',
  outline: 'none',
  caretColor: '#22c55e',
};

const inputButtonRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  marginTop: '6px',
};