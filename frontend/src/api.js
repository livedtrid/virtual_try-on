const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

/**
 * Converts any image File/Blob to a PNG File using an off-screen canvas.
 * This keeps uploaded assets in a Vertex-friendly raster format.
 */
async function ensurePng(file, filename = "image.png") {
  if (file.type === "image/png") return file;

  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || 512;
      canvas.height = img.naturalHeight || 512;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error("Failed to convert image to PNG"));
        resolve(new File([blob], filename, { type: "image/png" }));
      }, "image/png");
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image for conversion"));
    };
    img.src = url;
  });
}

export async function runTryOn({ personFile, garmentFile }) {
  // Normalize assets to PNG before sending them to the backend.
  const [safePersonFile, safeGarmentFile] = await Promise.all([
    ensurePng(personFile, "person.png"),
    ensurePng(garmentFile, "garment.png"),
  ]);

  console.log("[VTO] sending files", {
    person: { name: safePersonFile.name, type: safePersonFile.type, size: safePersonFile.size },
    garment: { name: safeGarmentFile.name, type: safeGarmentFile.type, size: safeGarmentFile.size },
  });

  const formData = new FormData();
  formData.append("person_image", safePersonFile);
  formData.append("garment_image", safeGarmentFile);

  const response = await fetch(`${API_BASE_URL}/tryon`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let details = `Server error ${response.status}`;
    try {
      const payload = await response.json();
      details = payload.detail || details;
    } catch {
      // Ignore JSON parse errors and keep the generic message.
    }
    console.error("[VTO] request failed", { status: response.status, details });
    throw new Error(details);
  }

  const data = await response.json();
  console.log("[VTO] response received", {
    mime_type: data.mime_type,
    image_base64_length: data.image_base64?.length,
  });

  if (!data.image_base64) {
    throw new Error("Backend returned an empty image. The try-on model may not have generated a result.");
  }

  return data;
}

export { API_BASE_URL };

