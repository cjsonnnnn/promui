"use client"

import React, { type ReactNode } from "react"

type Props = {
  children: ReactNode
  fallback?: ReactNode
}

type State = { hasError: boolean }

export class ConfigErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(): void {
    /* logged by React in dev */
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex h-full min-h-[120px] items-center justify-center p-6 text-center text-sm text-muted-foreground">
            Something went wrong loading configuration.
          </div>
        )
      )
    }
    return this.props.children
  }
}
