import React, { Component } from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  Record<string, never>,
  ErrorBoundaryState
> {
  constructor(props: Record<string, never>) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to monitoring service if needed
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center" data-testid="errorboundary">
          <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
          <p className="mb-2 text-red-600">{this.state.error?.message}</p>
          <p className="text-gray-500">
            Try refreshing the page or contact support if this persists.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
