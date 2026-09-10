import React, { Component, ReactNode } from 'react';

export class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean, error: Error | null, info: any}> {
  constructor(props: {children: ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: any) {
    console.error("ErrorBoundary caught an error:", error, info);
    this.setState({ info });
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, fontFamily: 'monospace', color: 'red', background: 'black', minHeight: '100vh' }}>
          <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>CRITICAL SYSTEM FAILURE</h1>
          <p style={{ marginBottom: 16 }}>The application crashed while rendering.</p>
          <pre style={{ fontSize: 12, background: '#111', padding: 16, borderRadius: 4, border: '1px solid #7f1d1d', overflow: 'auto' }}>
            {this.state.error?.message}
            <br />
            {this.state.error?.stack}
            <br />
            {this.state.info?.componentStack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}
