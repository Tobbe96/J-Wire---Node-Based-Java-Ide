'use client';
import React, { Component, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackLabel?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  showStack: boolean;
  copied: boolean;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, showStack: false, copied: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(`[ErrorBoundary${this.props.fallbackLabel ? `: ${this.props.fallbackLabel}` : ''}]`, error, info.componentStack);
  }

  private copyErrorDetails = async () => {
    const { error } = this.state;
    if (!error) return;
    const details = `${error.message}\n\n${error.stack || '(no stack trace)'}`;
    try {
      await navigator.clipboard.writeText(details);
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    } catch {
      // Clipboard API unavailable
    }
  };

  render() {
    if (this.state.hasError) {
      const { error, showStack, copied } = this.state;
      return (
        <div style={containerStyle}>
          <div style={iconStyle}>⚠</div>
          <div style={titleStyle}>
            {this.props.fallbackLabel || 'Component'} crashed
          </div>
          <div style={messageStyle}>
            {error?.message || 'An unexpected error occurred.'}
          </div>
          <div style={buttonRow}>
            <button
              onClick={() => this.setState({ hasError: false, error: null, showStack: false })}
              style={retryButtonStyle}
            >
              Retry
            </button>
            <button onClick={this.copyErrorDetails} style={retryButtonStyle}>
              {copied ? 'Copied!' : 'Copy Error Details'}
            </button>
          </div>
          {error?.stack && (
            <>
              <button
                onClick={() => this.setState({ showStack: !showStack })}
                style={toggleStyle}
              >
                {showStack ? '▾ Hide Stack Trace' : '▸ Show Stack Trace'}
              </button>
              {showStack && (
                <pre style={stackStyle}>{error.stack}</pre>
              )}
            </>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px',
  background: 'var(--jf-panel-bg, #1a1a1a)',
  color: 'var(--jf-text-secondary, #ccc)',
  height: '100%',
  gap: '8px',
};

const iconStyle: React.CSSProperties = {
  fontSize: '32px',
  color: '#f59e0b',
};

const titleStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: 'var(--jf-text-primary, #fff)',
};

const messageStyle: React.CSSProperties = {
  fontSize: '11px',
  color: 'var(--jf-text-muted, #888)',
  maxWidth: '300px',
  textAlign: 'center',
  wordBreak: 'break-word',
};

const buttonRow: React.CSSProperties = {
  display: 'flex',
  gap: '8px',
  marginTop: '8px',
};

const retryButtonStyle: React.CSSProperties = {
  background: 'var(--jf-surface, #333)',
  color: 'var(--jf-text-primary, #fff)',
  border: '1px solid var(--jf-panel-border-strong, #555)',
  padding: '6px 16px',
  borderRadius: '4px',
  fontSize: '11px',
  cursor: 'pointer',
};

const toggleStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'var(--jf-text-secondary, #999)',
  fontSize: '11px',
  cursor: 'pointer',
  padding: '4px 0',
};

const stackStyle: React.CSSProperties = {
  fontSize: '10px',
  color: 'var(--jf-text-muted, #888)',
  background: 'var(--jf-canvas-bg, #121212)',
  border: '1px solid var(--jf-panel-border, #2a2a2a)',
  borderRadius: '4px',
  padding: '8px',
  maxWidth: '400px',
  maxHeight: '200px',
  overflow: 'auto',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-all',
};
