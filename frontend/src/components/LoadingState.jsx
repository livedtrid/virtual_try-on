export default function LoadingState() {
  return (
    <div className="loading-state" role="status" aria-live="polite">
      <div className="loading-state__spinner" aria-hidden="true" />
      <p className="loading-state__title">Processing your photo</p>
      <p className="muted">Please stay on this page while we generate your try-on image.</p>
    </div>
  );
}

