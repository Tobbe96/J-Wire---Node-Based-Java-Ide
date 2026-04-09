'use client';
import React, { memo } from 'react';

interface TerminalProps {
  consoleOutput: string[];
  onRun: () => void;
  onRunJava?: () => void;
  onDebug?: () => void;
  isCompiling?: boolean;
  isDebugging?: boolean;
}

const Terminal = ({ consoleOutput, onRun, onRunJava, onDebug, isCompiling, isDebugging }: TerminalProps) => {
  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#fff' }}>TERMINAL</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={onRun} style={runButtonStyle}>
            ▶ RUN SCRIPT
          </button>
          {onRunJava && (
            <button
              onClick={onRunJava}
              disabled={isCompiling}
              style={{
                ...runJavaButtonStyle,
                opacity: isCompiling ? 0.6 : 1,
                cursor: isCompiling ? 'not-allowed' : 'pointer',
              }}
            >
              {isCompiling ? '⏳ COMPILING...' : '☕ RUN JAVA'}
            </button>
          )}
          {onDebug && (
            <button
              onClick={onDebug}
              style={{
                ...debugButtonStyle,
                background: isDebugging ? '#ef4444' : '#fbbf24',
              }}
            >
              {isDebugging ? '⏹ STOP DEBUG' : '🐛 DEBUG'}
            </button>
          )}
        </div>
      </div>
      <div style={outputStyle}>
        {consoleOutput.length === 0 && (
          <span style={{ color: '#555' }}>Ready to run...</span>
        )}
        {consoleOutput.map((line, i) => (
          <div
            key={i}
            style={{
              marginBottom: '6px',
              color: line.startsWith('>') ? '#22c55e' : '#fff',
            }}
          >
            {line}
          </div>
        ))}
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

const runButtonStyle: React.CSSProperties = {
  background: '#22c55e',
  color: '#000',
  border: 'none',
  padding: '6px 14px',
  borderRadius: '4px',
  fontSize: '11px',
  fontWeight: 'bold',
  cursor: 'pointer',
};

const runJavaButtonStyle: React.CSSProperties = {
  background: '#f97316',
  color: '#000',
  border: 'none',
  padding: '6px 14px',
  borderRadius: '4px',
  fontSize: '11px',
  fontWeight: 'bold',
  cursor: 'pointer',
};

const debugButtonStyle: React.CSSProperties = {
  background: '#fbbf24',
  color: '#000',
  border: 'none',
  padding: '6px 14px',
  borderRadius: '4px',
  fontSize: '11px',
  fontWeight: 'bold',
  cursor: 'pointer',
};

const outputStyle: React.CSSProperties = {
  padding: '12px',
  overflowY: 'auto',
  flex: 1,
  fontFamily: 'monospace',
  fontSize: '13px',
  color: '#a6accd',
};