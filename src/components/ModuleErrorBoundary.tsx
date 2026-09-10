import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  moduleName?: string;
}

export class ModuleErrorBoundary extends Component<Props, {hasError: boolean, error: Error | null}> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    console.error(`ModuleErrorBoundary caught an error in ${this.props.moduleName || 'a module'}:`, error, info);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 h-full bg-[#111] border border-red-900/50 rounded-xl text-center">
          <AlertTriangle className="text-red-500 mb-4" size={48} />
          <h2 className="text-xl font-bold text-red-500 font-mono mb-2">
            Module Failure: {this.props.moduleName || 'Component'}
          </h2>
          <p className="text-zinc-400 max-w-md mb-6 font-mono text-sm">
            An unexpected error occurred while rendering this module. Other systems are still operational.
          </p>
          <div className="bg-black/50 p-4 rounded-lg border border-red-900/30 text-left w-full max-w-lg mb-6 overflow-auto max-h-32">
            <code className="text-red-400 text-xs font-mono break-words">
              {this.state.error?.message}
            </code>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={this.resetError}
              className="flex items-center gap-2 px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors font-mono text-xs cursor-pointer"
            >
              <RefreshCcw size={14} />
              Retry Module
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-5 py-2 bg-red-950/80 hover:bg-red-900 border border-red-700/50 text-red-200 rounded-lg transition-colors font-mono text-xs cursor-pointer"
            >
              Reload System
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
