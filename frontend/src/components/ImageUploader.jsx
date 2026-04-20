import { useRef, useState } from "react";

export default function ImageUploader({ onFileChange, previewUrl }) {
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState("");

  async function handleCameraCapture() {
    if (isCameraOpen) {
      // Close camera
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
      setIsCameraOpen(false);
      setCameraError("");
      return;
    }

    setIsCameraLoading(true);
    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Wait a moment for the stream to start playing
        setTimeout(() => {
          setIsCameraOpen(true);
          setIsCameraLoading(false);
        }, 500);
      }
    } catch (error) {
      console.error("[VTO] Camera access denied or unavailable", error);
      const errorMsg = error.name === "NotAllowedError" 
        ? "Camera permission denied. Please allow camera access in your browser settings."
        : "Camera not available. Using file upload instead.";
      setCameraError(errorMsg);
      setIsCameraLoading(false);
    }
  }

  function handleCapturePhoto() {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], "camera-capture.png", { type: "image/png" });
        onFileChange(file);
        handleCameraCapture();
      }
    }, "image/png");
  }

  return (
    <div>
      <label htmlFor="person-image">Upload your image</label>
      <input
        id="person-image"
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(event) => onFileChange(event.target.files?.[0] || null)}
      />

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: "none" }}
        onChange={(event) => onFileChange(event.target.files?.[0] || null)}
      />

      <button
        type="button"
        onClick={handleCameraCapture}
        style={{
          marginBottom: "0.75rem",
          width: "100%",
          textAlign: "center",
          padding: "0.75rem",
          fontSize: "1rem",
        }}
      >
        {isCameraLoading ? "📷 Starting camera..." : isCameraOpen ? "❌ Close Camera" : "📷 Use Camera"}
      </button>

      {cameraError ? (
        <p style={{ color: "#b91c1c", marginBottom: "0.75rem", fontSize: "0.9rem" }}>
          {cameraError}
        </p>
      ) : null}

      {isCameraOpen ? (
        <div style={{ marginBottom: "0.75rem" }}>
          <p style={{ color: "#6b7280", margin: "0 0 0.5rem 0", fontSize: "0.9rem" }}>
            📷 Camera Ready
          </p>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{
              width: "100%",
              height: "auto",
              minHeight: "300px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              marginBottom: "0.5rem",
              backgroundColor: "#000",
              display: "block",
            }}
          />
          <button
            type="button"
            onClick={handleCapturePhoto}
            style={{ width: "100%", padding: "0.75rem" }}
          >
            📸 Capture Photo
          </button>
          <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>
      ) : null}

      {previewUrl ? <img className="preview" src={previewUrl} alt="Person preview" /> : null}
    </div>
  );
}

