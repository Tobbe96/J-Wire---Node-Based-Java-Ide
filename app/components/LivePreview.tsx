'use client';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { codeToHtml } from 'shiki';

export default function LivePreview({ code }: { code: string }) {
  const [highlightedHtml, setHighlightedHtml] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    let cancelled = false;
    codeToHtml(code, {
      lang: 'java',
      theme: 'vitesse-dark',
    }).then((html) => {
      if (!cancelled) setHighlightedHtml(html);
    });
    return () => { cancelled = true; };
  }, [code]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), 2000);
    });
  }, [code]);

  return (
    <div style={codePanelStyle}>
      <div style={headerStyle}>
        <span>LIVE JAVA PREVIEW</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={handleCopy} style={copyButtonStyle} title="Copy code to clipboard">
            {copied ? '✓ Copied' : '⎘ Copy'}
          </button>
          <span style={{ color: '#22c55e' }}>● Syncing</span>
        </div>
      </div>
      <div
        style={codeAreaStyle}
        dangerouslySetInnerHTML={{ __html: highlightedHtml }}
      />
    </div>
  );
}

const codePanelStyle: React.CSSProperties = {
  width: '350px',
  background: '#1a1a1a',
  borderLeft: '1px solid #000',
  color: '#ccc',
  display: 'flex',
  flexDirection: 'column',
  zIndex: 10,
};

const headerStyle: React.CSSProperties = {
  padding: '15px',
  borderBottom: '1px solid #333',
  fontSize: '12px',
  fontWeight: 'bold',
  color: '#fff',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const copyButtonStyle: React.CSSProperties = {
  background: '#333',
  color: '#ccc',
  border: '1px solid #555',
  padding: '3px 10px',
  borderRadius: '3px',
  fontSize: '11px',
  cursor: 'pointer',
  fontFamily: 'monospace',
};

const codeAreaStyle: React.CSSProperties = {
  padding: '15px',
  overflowY: 'auto',
  flex: 1,
  background: '#0d0d0d',
  fontSize: '13px',
};