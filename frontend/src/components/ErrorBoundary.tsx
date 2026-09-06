import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCw, LogOut, Home } from 'lucide-react';
import { Button } from './ui/Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[UNCAUGHT UI ERROR]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private handleClearAndLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-ivory-100 flex items-center justify-center p-6 font-sans">
          <div className="max-w-lg w-full bg-white rounded-3xl border border-rose-200 p-8 shadow-card space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <div className="text-center space-y-2">
              <span className="text-xs font-mono font-bold uppercase text-rose-600 tracking-wider">
                Application Rendering Interruption
              </span>
              <h1 className="text-xl font-black text-navy-800 tracking-tight">
                An Unexpected Interface Error Occurred
              </h1>
              <p className="text-xs text-slate-500 leading-relaxed">
                CampusClear encountered an unhandled rendering condition. Your data is safe on the server.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs font-mono text-rose-700 overflow-x-auto space-y-1">
                <p className="font-bold">{this.state.error.name}: {this.state.error.message}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={this.handleReset}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Try Again
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => window.location.reload()}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Reload Page
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={this.handleClearAndLogout}
                leftIcon={<LogOut className="w-3.5 h-3.5" />}
              >
                Reset Session
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
