import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      let errorMessage = "An unexpected error occurred.";
      let isPocketBaseError = false;

      try {
        // Try to parse PocketBase error if it's JSON
        if (this.state.error?.message.startsWith('{')) {
          const pbError = JSON.parse(this.state.error.message);
          errorMessage = pbError.message || errorMessage;
          isPocketBaseError = true;
        } else {
          errorMessage = this.state.error?.message || errorMessage;
        }
      } catch (e) {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-[60vh] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl sm:rounded-[2.5rem] shadow-2xl border border-gray-100 p-8 sm:p-10 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-50 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-lg shadow-red-100">
              <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" />
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mb-3 sm:mb-4">
              System Error
            </h2>
            
            <div className="p-5 sm:p-6 bg-gray-50 rounded-xl sm:rounded-2xl border border-gray-100 mb-6 sm:mb-8">
              <p className="text-gray-600 font-medium leading-relaxed text-sm sm:text-base">
                {errorMessage}
              </p>
              {isPocketBaseError && (
                <p className="mt-3 sm:mt-4 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-red-400">
                  PocketBase Connection Error
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleReset}
                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-cyan-600 transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-3"
              >
                <RefreshCcw className="w-4 h-4" />
                Retry Connection
              </button>
              <a
                href="/"
                className="w-full py-4 bg-gray-100 text-gray-700 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-all flex items-center justify-center gap-3"
              >
                <Home className="w-4 h-4" />
                Back to Safety
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
