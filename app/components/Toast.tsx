'use client';

import React from 'react';
import { useToastStore } from '../store/toastStore';

const borderColors: Record<string, string> = {
  success: '#2ecc71',
  error: '#e74c3c',
  info: '#3498db',
};

export function Toast() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes toast-fade-in {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
      <div
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          pointerEvents: 'none',
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              background: '#1a1a1a',
              color: '#ccc',
              borderLeft: `4px solid ${borderColors[toast.type]}`,
              borderRadius: 6,
              padding: '10px 36px 10px 14px',
              fontSize: 14,
              minWidth: 240,
              maxWidth: 360,
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
              animation: 'toast-fade-in 0.25s ease-out',
              pointerEvents: 'auto',
              position: 'relative',
            }}
          >
            {toast.message}
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                position: 'absolute',
                top: 6,
                right: 8,
                background: 'none',
                border: 'none',
                color: '#888',
                cursor: 'pointer',
                fontSize: 16,
                lineHeight: 1,
                padding: '2px 4px',
              }}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
