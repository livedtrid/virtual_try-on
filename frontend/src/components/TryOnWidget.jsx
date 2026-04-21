import { useMemo, useState } from "react";

import { runTryOn } from "../api";
import CTAButton from "./CTAButton";
import ImageUploader from "./ImageUploader";
import ResultPreview from "./ResultPreview";

function buildAssetUrl(assetPath) {
  return `${import.meta.env.BASE_URL}${assetPath}`;
}

function buildFileName(product) {
  const extension = product.asset.split(".").pop() || "jpg";
  return `${product.id}.${extension}`;
}

export default function TryOnWidget({ selectedProduct, onClose }) {
  const [personFile, setPersonFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [resultData, setResultData] = useState(null);

  const previewUrl = useMemo(() => (personFile ? URL.createObjectURL(personFile) : ""), [personFile]);

  async function handleRunTryOn() {
    if (!personFile) {
      setErrorMessage("Please upload an image first.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      if (!selectedProduct) {
        throw new Error("Try-on product is not available.");
      }

      const garmentResponse = await fetch(buildAssetUrl(selectedProduct.asset));
      if (!garmentResponse.ok) {
        throw new Error("Failed to load selected garment image");
      }

      const garmentBlob = await garmentResponse.blob();
      const garmentFile = new File([garmentBlob], buildFileName(selectedProduct), {
        type: garmentBlob.type || "image/jpeg",
      });

      const response = await runTryOn({ personFile, garmentFile });
      setResultData(response);
      console.log("[VTO] try-on completed", { product: selectedProduct.id });
    } catch (error) {
      setResultData(null);
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  const canRun = Boolean(personFile);

  return (
    <div className="widget">
      <div className="widget-header">
        <h2>Provador Virtual</h2>
        {onClose ? (
          <button type="button" className="close-btn" onClick={onClose}>
            Fechar
          </button>
        ) : null}
      </div>
      <p className="muted inline-note">Upload a person image and run try-on for {selectedProduct?.label || "the selected item"}.</p>

      <ImageUploader onFileChange={setPersonFile} previewUrl={previewUrl} />

      <CTAButton isLoading={isLoading} isReady={canRun} hasResult={Boolean(resultData)} onClick={handleRunTryOn} />
      <ResultPreview isLoading={isLoading} errorMessage={errorMessage} resultData={resultData} />
    </div>
  );
}

