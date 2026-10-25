import { Component, type ReactNode } from 'react'

interface ErrorBoundaryState {
  message: string | null
}

export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { message: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { message: error.message }
  }

  render() {
    if (this.state.message) {
      return (
        <div className="ink-fallback">
          <h1>Qualcosa è andato storto</h1>
          <p>{this.state.message}</p>
          <button className="btn" type="button" onClick={() => window.location.reload()}>Ricarica</button>
        </div>
      )
    }
    return this.props.children
  }
}
