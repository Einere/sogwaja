"use client";

import React, { Component, ReactNode } from "react";
import Button from "@/components/ui/Button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          className="flex flex-col items-center justify-center min-h-screen p-4"
          role="alert"
          aria-live="assertive"
        >
          <h2 className="text-xl font-bold text-error mb-4">오류가 발생했습니다</h2>
          <p className="text-foreground mb-4 text-center">
            {this.state.error?.message || "알 수 없는 오류가 발생했습니다."}
          </p>
          <Button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            aria-label="페이지 새로고침"
          >
            새로고침
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
