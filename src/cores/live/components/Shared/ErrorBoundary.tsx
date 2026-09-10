import React, { Component, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
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

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-screen w-screen bg-[#0A0A0B] text-white">
          <div className="bg-red-500/10 border border-red-500 p-8 rounded-lg max-w-lg text-center space-y-4 shadow-2xl shadow-red-500/20">
            <AlertCircle size={48} className="mx-auto text-red-500 mb-4 animate-pulse" />
            <h1 className="text-xl font-bold uppercase tracking-widest text-red-500 font-mono">System Component Crashed</h1>
            <p className="text-xs font-mono text-gray-300 bg-black/50 p-4 rounded border border-red-500/30 overflow-auto max-h-48 whitespace-pre-wrap">
              {this.state.error?.message || "Unknown Null Reference or Render Error"}
            </p>
            <button 
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="bg-red-500 text-black px-6 py-2 rounded font-bold uppercase text-xs hover:bg-red-400 mt-4 transition-colors font-mono"
            >
              Reboot Terminal
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
