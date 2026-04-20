export default function CTAButton({ isLoading, isReady, hasResult, onClick }) {
  return (
    <button type="button" onClick={onClick} disabled={!isReady || isLoading}>
      {isLoading ? "Running..." : hasResult ? "Run Again" : "Run Try-On"}
    </button>
  );
}

