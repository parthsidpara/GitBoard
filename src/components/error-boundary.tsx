import { Component, type ErrorInfo, type ReactNode } from 'react'

import { Button } from '@/components/ui/button'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  error: Error | null
}

/**
 * Catches errors thrown while rendering its children. Error boundaries are the
 * one thing still written as a class (react101 §20): there is no hook
 * equivalent. Note it does not catch errors in event handlers or async code.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Uncaught render error', error, info)
  }

  private reset = () => this.setState({ error: null })

  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
          <div className="space-y-1">
            <h1 className="font-heading text-lg font-medium">Something went wrong</h1>
            <p className="max-w-sm text-sm text-muted-foreground">{this.state.error.message}</p>
          </div>
          <Button onClick={this.reset}>Try again</Button>
        </div>
      )
    }
    return this.props.children
  }
}
