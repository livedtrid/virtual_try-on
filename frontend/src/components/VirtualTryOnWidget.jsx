import { useEffect, useRef, useState } from "react";

import { sendPhotoToVirtualTryOn } from "../services/virtualTryOnService";
import CameraCaptureModal from "./CameraCaptureModal";
import ResultPreview from "./ResultPreview";

export default function VirtualTryOnWidget({ selectedProduct, onClose }) {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState("");
  const [resultImage, setResultImage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  const requestIdRef = useRef(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  function openCamera() {
    setError("");
    setResultImage("");
    setCapturedPhoto("");
    setIsCameraOpen(true);
  }

  function closeCamera() {
    if (isProcessing) return;
    setIsCameraOpen(false);
  }

  async function handlePhotoConfirm(photo) {
    const nextRequestId = requestIdRef.current + 1;
    requestIdRef.current = nextRequestId;

    setCapturedPhoto(photo);
    setError("");
    setResultImage("");
    setIsCameraOpen(false);
    setIsProcessing(true);

    try {
      const generatedImage = await sendPhotoToVirtualTryOn(photo, {
        garmentAsset: selectedProduct?.asset,
        garmentId: selectedProduct?.id,
        mockOnly: import.meta.env.VITE_MOCK_VTO === "true",
      });

      if (!mountedRef.current || nextRequestId !== requestIdRef.current) return;
      setResultImage(generatedImage);
    } catch (serviceError) {
      if (!mountedRef.current || nextRequestId !== requestIdRef.current) return;
      setError(serviceError instanceof Error ? serviceError.message : "Unable to generate the try-on image. Please try again.");
    } finally {
      if (!mountedRef.current || nextRequestId !== requestIdRef.current) return;
      setIsProcessing(false);
    }
  }

  return (
    <div className="virtual-widget">
      <div className="widget-header">
        <h2>Virtual Try-On</h2>
        {onClose ? (
          <button type="button" className="close-btn" onClick={onClose}>
            Fechar
          </button>
        ) : null}
      </div>

      <p className="muted inline-note">Step: {isProcessing ? "processing" : resultImage ? "completed" : capturedPhoto ? "captured" : "ready"}</p>

      <div className="widget-actions">
        <button type="button" className="primary-cta" onClick={openCamera} disabled={isProcessing}>
          Take Photo
        </button>
        {capturedPhoto ? <p className="muted">Photo captured. Confirmed photo is kept in memory only.</p> : null}
      </div>

      <ResultPreview isProcessing={isProcessing} error={error} resultImage={resultImage} />

      <CameraCaptureModal isOpen={isCameraOpen} isBusy={isProcessing} onClose={closeCamera} onConfirm={handlePhotoConfirm} />
    </div>
  );
}

