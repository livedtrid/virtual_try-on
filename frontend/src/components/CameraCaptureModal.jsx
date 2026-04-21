import { useEffect, useMemo, useRef, useState } from "react";
import { Camera } from "react-camera-pro";

const FOCUSABLE_SELECTOR = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export default function CameraCaptureModal({ isOpen, isBusy, onClose, onConfirm }) {
  const modalRef = useRef(null);
  const cameraRef = useRef(null);
  const fileInputRef = useRef(null);

  const [previewPhoto, setPreviewPhoto] = useState("");
  const [numberOfCameras, setNumberOfCameras] = useState(0);
  const [cameraError, setCameraError] = useState("");
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [flashSupported, setFlashSupported] = useState(false);

  const stepLabel = useMemo(() => (previewPhoto ? "previewing" : "capturing"), [previewPhoto]);

  useEffect(() => {
    if (!isOpen) {
      setPreviewPhoto("");
      setCameraError("");
      setFlashEnabled(false);
      setFlashSupported(false);
      return;
    }

    const timer = window.setTimeout(() => {
      const closeBtn = modalRef.current?.querySelector(".camera-modal__close");
      closeBtn?.focus();
    }, 20);

    return () => window.clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape" && !isBusy) {
        event.preventDefault();
        onClose();
      }

      if (event.key !== "Tab") return;
      const focusable = modalRef.current?.querySelectorAll(FOCUSABLE_SELECTOR);
      if (!focusable || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isBusy, isOpen, onClose]);

  function handleBackdropClick(event) {
    if (event.target !== event.currentTarget || isBusy) return;
    onClose();
  }

  function handleCapture() {
    try {
      const photo = cameraRef.current?.takePhoto();
      if (!photo) {
        setCameraError("Unable to capture a photo. Please try again.");
        return;
      }
      setCameraError("");
      setPreviewPhoto(photo);
    } catch (error) {
      setCameraError(error instanceof Error ? error.message : "Unable to capture from this camera.");
    }
  }

  function handleSwitchCamera() {
    try {
      cameraRef.current?.switchCamera();
      setFlashEnabled(false);
      setFlashSupported(Boolean(cameraRef.current?.torchSupported));
      setCameraError("");
    } catch (error) {
      setCameraError(error instanceof Error ? error.message : "Unable to switch camera.");
    }
  }

  function handleToggleFlash() {
    try {
      const nextValue = cameraRef.current?.toggleTorch?.();
      setFlashEnabled(Boolean(nextValue));
      setCameraError("");
    } catch {
      setCameraError("Flash is not available on this device/browser.");
    }
  }

  function handleRetake() {
    setPreviewPhoto("");
    setCameraError("");
  }

  function handleUsePhoto() {
    if (!previewPhoto) return;
    onConfirm(previewPhoto);
    setPreviewPhoto("");
    setCameraError("");
  }

  function handleFallbackUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setPreviewPhoto(reader.result);
      }
    };
    reader.onerror = () => {
      setCameraError("Unable to read selected photo.");
    };
    reader.readAsDataURL(file);

    event.target.value = "";
  }

  if (!isOpen) return null;

  return (
    <div className="camera-modal" role="dialog" aria-modal="true" aria-label="Take a photo for virtual try-on" onMouseDown={handleBackdropClick}>
      <div className="camera-modal__surface" ref={modalRef}>
        <button className="camera-modal__close" type="button" onClick={onClose} disabled={isBusy} aria-label="Cancel and close photo capture">
          x
        </button>

        {!previewPhoto ? (
          <div className="camera-modal__camera-step">
            <p className="camera-modal__status">Step: {stepLabel}</p>
            <div className="camera-modal__viewport" aria-live="polite">
              <Camera
                ref={cameraRef}
                facingMode="environment"
                numberOfCamerasCallback={(count) => {
                  setNumberOfCameras(count);
                  setFlashSupported(Boolean(cameraRef.current?.torchSupported));
                }}
                errorMessages={{
                  noCameraAccessible: "No camera available. Use gallery upload instead.",
                  permissionDenied: "Camera access denied. Allow camera access or use gallery upload.",
                  switchCamera: "Unable to switch camera.",
                  canvas: "Browser does not support camera capture canvas.",
                }}
                videoReadyCallback={() => {
                  setCameraError("");
                  setFlashSupported(Boolean(cameraRef.current?.torchSupported));
                }}
              />
            </div>

            {cameraError ? <p className="error camera-modal__error">{cameraError}</p> : null}

            <div className="camera-modal__controls">
              <button type="button" className="camera-modal__secondary" onClick={() => fileInputRef.current?.click()}>
                Choose from Gallery
              </button>
              <button type="button" className="camera-modal__capture" onClick={handleCapture}>
                Take Photo
              </button>
              <button type="button" className="camera-modal__secondary" onClick={handleSwitchCamera} disabled={numberOfCameras < 2}>
                Switch Camera
              </button>
              <button type="button" className="camera-modal__secondary" onClick={handleToggleFlash} disabled={!flashSupported}>
                {flashEnabled ? "Flash Off" : "Flash On"}
              </button>
            </div>
          </div>
        ) : (
          <div className="camera-modal__preview-step">
            <p className="camera-modal__status">Step: previewing</p>
            <img className="camera-modal__preview-image" src={previewPhoto} alt="Captured preview" />
            <div className="camera-modal__controls camera-modal__controls--preview">
              <button type="button" className="camera-modal__secondary" onClick={handleRetake}>
                Retake
              </button>
              <button type="button" className="camera-modal__capture" onClick={handleUsePhoto}>
                Use this photo
              </button>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFallbackUpload}
          className="camera-modal__file-input"
          aria-label="Upload a photo as fallback"
        />
      </div>
    </div>
  );
}

