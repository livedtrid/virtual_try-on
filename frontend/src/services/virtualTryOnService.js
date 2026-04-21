import { runTryOn } from "../api";

function dataUrlToFile(photoDataUrl, fileName = "person-capture.jpg") {
  const [meta, base64Payload] = photoDataUrl.split(",");
  const mimeMatch = /data:(.*?);base64/.exec(meta || "");
  const mimeType = mimeMatch?.[1] || "image/jpeg";

  const binary = atob(base64Payload || "");
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new File([bytes], fileName, { type: mimeType });
}

async function loadGarmentFile(garmentAsset, garmentId = "garment") {
  const response = await fetch(`${import.meta.env.BASE_URL}${garmentAsset}`);
  if (!response.ok) {
    throw new Error("Failed to load garment image.");
  }

  const blob = await response.blob();
  const extension = garmentAsset.split(".").pop() || "jpg";
  return new File([blob], `${garmentId}.${extension}`, { type: blob.type || "image/jpeg" });
}

export async function sendPhotoToVirtualTryOn(photo, options = {}) {
  const { garmentAsset, garmentId = "garment", mockOnly = false } = options;

  if (!garmentAsset || mockOnly) {
    // Mock path keeps local behavior for demos without backend.
    await new Promise((resolve) => setTimeout(resolve, 1400));
    return photo;
  }

  const personFile = dataUrlToFile(photo);
  const garmentFile = await loadGarmentFile(garmentAsset, garmentId);
  const response = await runTryOn({ personFile, garmentFile });
  return `data:${response.mime_type};base64,${response.image_base64}`;
}

