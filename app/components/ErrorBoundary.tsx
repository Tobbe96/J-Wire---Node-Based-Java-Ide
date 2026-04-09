'use client';
import React, { Component, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackLabel?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(`[ErrorBoundary${this.props.fallbackLabel ? `: ${this.props.fallbackLabel}` : ''}]`, error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={containerStyle}>
          <div style={iconStyle}>⚠</div>
          <div style={titleStyle}>
            {this.props.fallbackLabel || 'Component'} crashed
          </div>
          <div style={messageStyle}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </div>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={retryButtonStyle}
          >
            Retry
          </button>
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
  background: '#1a1a1a',
  color: '#ccc',
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
  color: '#fff',
};

const messageStyle: React.CSSProperties = {
  fontSize: '11px',
  color: '#888',
  maxWidth: '300px',
  textAlign: 'center',
  wordBreak: 'break-word',
};

const retryButtonStyle: React.CSSProperties = {
  marginTop: '8px',
  background: '#333',
  color: '#fff',
  border: '1px solid #555',
  padding: '6px 16px',
  borderRadius: '4px',
  fontSize: '11px',
  cursor: 'pointer',
};
