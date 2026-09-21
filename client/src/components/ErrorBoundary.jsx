import { Component } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Home,
  RotateCcw,
  ShieldAlert,
} from "lucide-react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);

    this.state = {
      error: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error(
      "[Kapstone ErrorBoundary]",
      {
        error,
        componentStack: info?.componentStack,
      }
    );
  }

  handleRetry = () => {
    this.setState({ error: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    const { error } = this.state;

    if (!error) {
      return this.props.children;
    }

    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f7faf8] px-5 py-10 sm:px-6">
        {/* Ambient background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/[0.07] blur-3xl" />
          <div className="absolute -bottom-40 -right-32 h-[28rem] w-[28rem] rounded-full bg-accent/[0.05] blur-3xl" />

          <div className="absolute inset-0 opacity-[0.025] [background-image:linear-gradient(rgba(15,110,91,1)_1px,transparent_1px),linear-gradient(90deg,rgba(15,110,91,1)_1px,transparent_1px)] [background-size:48px_48px]" />
        </div>

        {/* Error card */}
        <section
          role="alert"
          aria-labelledby="error-title"
          className="relative z-10 w-full max-w-lg"
        >
          <div className="glass-panel overflow-hidden p-6 sm:p-8">
            {/* Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                <ShieldAlert
                  size={14}
                  className="text-primary"
                  strokeWidth={1.8}
                />
                Kapstone Healthcare
              </div>

              <span className="rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-semibold text-red-600 ring-1 ring-inset ring-red-600/10">
                System error
              </span>
            </div>

            {/* Icon */}
            <div className="mt-10 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 animate-ping rounded-2xl bg-red-400/10 [animation-duration:2.5s]" />

                <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-red-500 shadow-sm">
                  <AlertTriangle
                    size={32}
                    strokeWidth={1.7}
                  />
                </div>
              </div>
            </div>

            {/* Message */}
            <div className="mt-7 text-center">
              <p className="eyebrow text-red-600/80">
                Unexpected interruption
              </p>

              <h1
                id="error-title"
                className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl"
              >
                Something went wrong
              </h1>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted sm:text-[15px]">
                This part of Kapstone encountered an unexpected problem.
                Your session and data should remain safe. Try continuing
                below or reload the page if the issue persists.
              </p>
            </div>

            {/* Actions */}
            <div className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={this.handleRetry}
                className="btn-primary w-full sm:w-auto"
              >
                <RotateCcw size={16} />
                Try again
              </button>

              <button
                type="button"
                onClick={this.handleReload}
                className="btn-secondary w-full sm:w-auto"
              >
                Reload page
              </button>
            </div>

            {/* Secondary navigation */}
            <div className="mt-5 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="btn-ghost px-3 py-2 text-xs"
              >
                <ArrowLeft size={14} />
                Go back
              </button>

              <span className="h-3.5 w-px bg-line" />

              <button
                type="button"
                onClick={() => {
                  window.location.href = "/";
                }}
                className="btn-ghost px-3 py-2 text-xs"
              >
                <Home size={14} />
                Home
              </button>
            </div>

            {/* Trust footer */}
            <div className="mt-7 border-t border-slate-200/60 pt-4 text-center">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-medium text-muted">
                <ShieldAlert
                  size={12}
                  className="text-primary/70"
                />
                Kapstone secure application environment
              </div>
            </div>
          </div>

          <p className="mt-4 text-center text-[10px] text-muted/60">
            If this continues, please contact your support team.
          </p>
        </section>
      </main>
    );
  }
}