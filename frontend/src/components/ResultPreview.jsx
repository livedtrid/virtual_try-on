export default function ResultPreview({ isLoading, errorMessage, resultData }) {
  if (isLoading) {
    return <p className="muted">Generating result image...</p>;
  }

  if (errorMessage) {
    return <p className="error">{errorMessage}</p>;
  }

  if (!resultData) {
    return <p className="muted">Upload an image and run the try-on to see the result.</p>;
  }

  return (
    <div>
      <p>Generated result:</p>
      <img
        className="result-image"
        src={`data:${resultData.mime_type};base64,${resultData.image_base64}`}
        alt="Try-on result"
      />
    </div>
  );
}

