import { useEffect, useMemo, useRef, useState } from "react";

const FOCUSABLE_SELECTOR = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export default function CameraCaptureModal({ isOpen, isBusy, onClose, onConfirm }) {
  const modalRef = useRef(null);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  const [previewPhoto, setPreviewPhoto] = useState("");
  const [devices, setDevices] = useState([]);
  const [activeDeviceIndex, setActiveDeviceIndex] = useState(0);
  const [stream, setStream] = useState(null);
  const [cameraError, setCameraError] = useState("");

  const stepLabel = useMemo(() => (previewPhoto ? "previewing" : "capturing"), [previewPhoto]);

  useEffect(() => {
    if (!isOpen) {
      setPreviewPhoto("");
      setCameraError("");
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

  useEffect(() => {
    if (!isOpen || previewPhoto) return undefined;

    let isMounted = true;

    async function startCamera() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("This browser does not support camera access.");
        }

        const availableDevices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = availableDevices.filter((device) => device.kind === "videoinput");

        if (isMounted) {
          setDevices(videoInputs);
        }

        const selectedDevice = videoInputs[activeDeviceIndex];
        const constraints = selectedDevice
          ? { video: { deviceId: { exact: selectedDevice.deviceId } }, audio: false }
          : { video: { facingMode: "environment" }, audio: false };

        const nextStream = await navigator.mediaDevices.getUserMedia(constraints);

        if (!isMounted) {
          nextStream.getTracks().forEach((track) => track.stop());
          return;
        }

        setStream(nextStream);
        setCameraError("");
      } catch (error) {
        setCameraError(error instanceof Error ? error.message : "Unable to access camera. Use gallery upload instead.");
      }
    }

    startCamera();

    return () => {
      isMounted = false;
    };
  }, [activeDeviceIndex, isOpen, previewPhoto]);

  useEffect(() => {
    if (!videoRef.current || !stream) return;
    videoRef.current.srcObject = stream;
  }, [stream]);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  function handleBackdropClick(event) {
    if (event.target !== event.currentTarget || isBusy) return;
    onClose();
  }

  function handleCapture() {
    try {
      const video = videoRef.current;
      if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
        setCameraError("Unable to capture a photo. Please try again.");
        return;
      }

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      if (!context) {
        setCameraError("Unable to capture a photo. Please try again.");
        return;
      }

      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const photo = canvas.toDataURL("image/png");
      setCameraError("");
      setPreviewPhoto(photo);
    } catch (error) {
      setCameraError(error instanceof Error ? error.message : "Unable to capture from this camera.");
    }
  }

  function handleSwitchCamera() {
    if (devices.length < 2) return;
    setActiveDeviceIndex((current) => (current + 1) % devices.length);
    setCameraError("");
  }

  function handleToggleFlash() {
    setCameraError("Flash control is not supported in this browser. Use device camera app if needed.");
  }

  function handleRetake() {
    setPreviewPhoto("");
    setCameraError("");
  }

  function stopStream() {
    if (!stream) return;
    stream.getTracks().forEach((track) => track.stop());
    setStream(null);
  }

  useEffect(() => {
    if (!isOpen || previewPhoto) {
      stopStream();
    }
  }, [isOpen, previewPhoto]);

  function handleUsePhoto() {
    if (!previewPhoto) return;
    onConfirm(previewPhoto);
    setPreviewPhoto("");
    setCameraError("");
    stopStream();
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
              <video ref={videoRef} autoPlay playsInline muted className="camera-modal__video" />
            </div>

            {cameraError ? <p className="error camera-modal__error">{cameraError}</p> : null}

            <div className="camera-modal__controls">
              <button type="button" className="camera-modal__secondary" onClick={() => fileInputRef.current?.click()}>
                Choose from Gallery
              </button>
              <button type="button" className="camera-modal__capture" onClick={handleCapture}>
                Take Photo
              </button>
              <button type="button" className="camera-modal__secondary" onClick={handleSwitchCamera} disabled={devices.length < 2}>
                Switch Camera
              </button>
              <button type="button" className="camera-modal__secondary" onClick={handleToggleFlash}>
                Flash
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

