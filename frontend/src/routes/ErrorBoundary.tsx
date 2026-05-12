import React from "react";
import { Link } from "react-router-dom";

type Props = { children: React.ReactNode };
type State = { hasError: boolean; error?: Error };

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error("[render:error]", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-4 px-6">
        <div className="text-center">
          <div className="text-lg font-semibold">Something crashed.</div>
          <div className="mt-1 text-sm text-slate-600">Try reloading or go home.</div>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
            onClick={() => window.location.reload()}
            type="button"
          >
            Reload
          </button>
          <Link className="rounded-md border px-4 py-2 text-sm font-medium" to="/">
            Home
          </Link>
        </div>
      </div>
    );
  }
}

