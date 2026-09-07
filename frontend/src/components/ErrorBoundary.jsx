import React from "react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Captured React error in boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#071312] text-white flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="p-8 max-w-md apple-glass-card rounded-3xl border border-rose-500/30 space-y-4">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              !
            </div>
            <h3 className="text-lg font-bold text-white font-display">A minor display issue occurred</h3>
            <p className="text-xs text-slate-300 font-mono">
              {this.state.error?.message || "An unexpected error occurred during rendering."}
            </p>
            <button
              onClick={() => { this.setState({ hasError: false }); window.location.href = "/dashboard"; }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition"
            >
              Reload Dashboard
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
