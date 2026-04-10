'use client';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { codeToHtml } from 'shiki';
import { useVfxStore } from '../store/vfxStore';

export default function LivePreview({ code }: { code: string }) {
  const [highlightedHtml, setHighlightedHtml] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [copyHover, setCopyHover] = useState(false);
  const [flashKey, setFlashKey] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const vfxEnabled = useVfxStore((s) => s.vfxEnabled);

  useEffect(() => {
    let cancelled = false;
    codeToHtml(code, {
      lang: 'java',
      theme: 'vitesse-dark',
    }).then((html) => {
      if (!cancelled) {
        setHighlightedHtml(html);
        if (vfxEnabled) setFlashKey((k) => k + 1);
      }
    });
    return () => { cancelled = true; };
  }, [code, vfxEnabled]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), 2000);
    });
  }, [code]);

  return (
    <div style={{
      ...codePanelStyle,
      ...(vfxEnabled ? {
        borderImage: 'linear-gradient(180deg, #6366f144, #a855f744, #06b6d444) 1',
        borderWidth: '0 0 0 2px',
        borderStyle: 'solid',
      } : {}),
    }}>
      <div style={headerStyle}>
        <span style={{ fontSize: '11px', letterSpacing: '0.1em', color: '#888', fontWeight: 600 }}>
          LIVE JAVA PREVIEW
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handleCopy}
            onMouseEnter={() => setCopyHover(true)}
            onMouseLeave={() => setCopyHover(false)}
            style={{
              ...copyButtonStyle,
              ...(copied
                ? { borderColor: '#22c55e', color: '#22c55e' }
                : copyHover
                  ? { borderColor: '#555', color: '#ccc' }
                  : {}),
            }}
            title="Copy code to clipboard"
          >
            {copied ? '✓ Copied' : '⎘ Copy'}
          </button>
          <span style={{
            fontSize: '11px',
            color: '#22c55e',
            ...(vfxEnabled ? { animation: 'vfx-sync-pulse 2s ease-in-out infinite' } : {}),
          }}>
            ● Syncing
          </span>
        </div>
      </div>
      <div
        key={vfxEnabled ? flashKey : undefined}
        style={{
          ...codeAreaStyle,
          ...(vfxEnabled ? { animation: 'vfx-code-flash 0.4s ease-out' } : {}),
        }}
        dangerouslySetInnerHTML={{ __html: highlightedHtml }}
      />
    </div>
  );
}

const codePanelStyle: React.CSSProperties = {
  width: '350px',
  background: '#1a1a1a',
  borderLeftWidth: '1px',
  borderLeftStyle: 'solid',
  borderLeftColor: '#000',
  color: '#ccc',
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
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
  background: '#1e1e1e',
  color: '#999',
  border: '1px solid #333',
  padding: '4px 12px',
  borderRadius: '3px',
  fontSize: '11px',
  cursor: 'pointer',
  fontFamily: 'monospace',
  transition: 'color 0.15s, border-color 0.15s',
};

const codeAreaStyle: React.CSSProperties = {
  padding: '15px',
  overflowX: 'auto',
  overflowY: 'auto',
  flex: 1,
  background: '#0d0d0d',
  fontSize: '13px',
};