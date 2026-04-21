import LoadingState from "./LoadingState";

export default function ResultPreview({ isProcessing, error, resultImage }) {
  if (isProcessing) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="result-card">
        <p className="result-card__step">Step: error</p>
        <p className="error">{error}</p>
      </div>
    );
  }

  if (!resultImage) {
    return (
      <div className="result-card result-card--placeholder">
        <p className="result-card__step">Step: idle</p>
        <p className="muted">Take or upload a photo to run virtual try-on.</p>
      </div>
    );
  }

  return (
    <div className="result-card">
      <p className="result-card__step">Step: completed</p>
      <img className="result-image" src={resultImage} alt="Generated try-on result" />
    </div>
  );
}

