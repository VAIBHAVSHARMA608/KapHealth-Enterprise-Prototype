import { Component } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary] caught:", error, info?.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="flex min-h-screen items-center justify-center bg-surface px-6">
        <div className="glass-panel max-w-md p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
            <AlertTriangle size={26} />
          </div>
          <h1 className="mt-5 font-display text-xl font-semibold text-ink">Something went wrong</h1>
          <p className="mt-2 text-sm text-muted">
            This part of the page hit an unexpected error. Reloading usually fixes it.
          </p>
          <button
            onClick={() => {
              this.setState({ error: null });
              window.location.reload();
            }}
            className="btn-primary mt-6 inline-flex"
          >
            <RotateCcw size={16} /> Reload page
          </button>
        </div>
      </div>
    );
  }
}
