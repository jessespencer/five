"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" aria-live="assertive" className="min-h-dvh flex items-center justify-center bg-[var(--background)] text-[var(--foreground)]">
          <div className="text-center">
            <h1 className="text-2xl font-black tracking-tight mb-2">Something went wrong</h1>
            <p className="text-sm opacity-50 mb-4">The app hit an unexpected error.</p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="text-sm px-4 py-2 rounded-full bg-[var(--foreground)]/10 hover:bg-[var(--foreground)]/20 transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
