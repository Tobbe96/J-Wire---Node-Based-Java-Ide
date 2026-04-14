'use client';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { codeToHtml } from 'shiki';
import { useVfxStore } from '../../store/vfxStore';

export default function LivePreview({ code }: { code: string }) {
  const [highlightedHtml, setHighlightedHtml] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [copyHover, setCopyHover] = useState(false);
  const [flashKey, setFlashKey] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const codeAreaRef = useRef<HTMLDivElement>(null);
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

  // Override Shiki's inline styles on <pre> so the parent div handles scrolling
  useEffect(() => {
    const el = codeAreaRef.current;
    if (!el) return;
    const pre = el.querySelector('pre');
    if (pre) {
      pre.style.margin = '0';
      pre.style.padding = '0';
      pre.style.background = 'transparent';
      pre.style.overflow = 'visible';
      pre.style.whiteSpace = 'pre';
    }
    const codeEl = el.querySelector('code');
    if (codeEl) {
      codeEl.style.whiteSpace = 'pre';
    }
  }, [highlightedHtml]);

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
        borderLeftWidth: '2px',
        borderLeftStyle: 'solid',
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
        ref={codeAreaRef}
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
  background: '#1a1a1a',
  borderLeftWidth: '1px',
  borderLeftStyle: 'solid',
  borderLeftColor: '#000',
  color: '#ccc',
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minHeight: 0,
  overflow: 'hidden',
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
  flexShrink: 0,
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

// width:0 + minWidth:100% prevents content from pushing the panel wider
const codeAreaStyle: React.CSSProperties = {
  flex: 1,
  minHeight: 0,
  width: 0,
  minWidth: '100%',
  overflow: 'auto',
  padding: '15px',
  background: '#0d0d0d',
  fontSize: '13px',
};