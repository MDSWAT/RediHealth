/** Resizes a portrait without cropping so the full uploaded image remains available. */
export async function toAvatarDataUrl(file: File, size = 256): Promise<string> {
  const bitmap = await createImageBitmap(file);
  try {
    const canvas = document.createElement("canvas");
    const scale = Math.min(1, size / Math.max(bitmap.width, bitmap.height));
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas is not available.");

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.85);
  } finally {
    bitmap.close();
  }
}

export type PreparedMedicalImage = {
  mimeType: "image/jpeg" | "image/png" | "image/webp";
  data: string;
};

const MAX_UPLOAD_BASE64_LENGTH = 4_200_000;

type DecodedImage = {
  width: number;
  height: number;
  source: CanvasImageSource;
  close: () => void;
};

async function decodeWithImageElement(file: File): Promise<DecodedImage> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("Could not decode image."));
      element.src = objectUrl;
    });
    const width = img.naturalWidth || img.width;
    const height = img.naturalHeight || img.height;
    if (width <= 0 || height <= 0) {
      throw new Error("Image has empty dimensions.");
    }
    return {
      width,
      height,
      source: img,
      close: () => URL.revokeObjectURL(objectUrl),
    };
  } catch (error) {
    URL.revokeObjectURL(objectUrl);
    throw error;
  }
}

async function decodeImageFile(file: File): Promise<DecodedImage> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file);
      if (bitmap.width > 0 && bitmap.height > 0) {
        return {
          width: bitmap.width,
          height: bitmap.height,
          source: bitmap,
          close: () => bitmap.close(),
        };
      }
      bitmap.close();
    } catch {
      // Safari / mobile WebViews may fall back to HTMLImageElement for some camera formats.
    }
  }
  return decodeWithImageElement(file);
}

function encodeCanvasImage(
  decoded: DecodedImage,
  maxDimension: number,
  mimeType: "image/jpeg" | "image/png",
  quality?: number,
): string {
  const scale = Math.min(1, maxDimension / Math.max(1, decoded.width, decoded.height));
  const targetWidth = Math.max(1, Math.round(decoded.width * scale));
  const targetHeight = Math.max(1, Math.round(decoded.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas is not available.");
  }

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, targetWidth, targetHeight);
  context.drawImage(decoded.source, 0, 0, targetWidth, targetHeight);

  const dataUrl =
    mimeType === "image/png"
      ? canvas.toDataURL("image/png")
      : canvas.toDataURL("image/jpeg", quality ?? 0.88);
  const data = dataUrl.split(",")[1] ?? "";
  if (!data) {
    throw new Error("Encoded image payload is empty.");
  }
  return data;
}

async function readRawAcceptedFile(file: File): Promise<PreparedMedicalImage> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size > 2_800_000) {
    throw new Error("Image processing is not available in this browser.");
  }
  const mimeType = file.type as PreparedMedicalImage["mimeType"];
  const data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      const encoded = result.split(",")[1] ?? "";
      if (encoded) resolve(encoded);
      else reject(new Error("Could not read image file."));
    };
    reader.onerror = () => reject(new Error("Could not read image file."));
    reader.readAsDataURL(file);
  });
  if (data.length > MAX_UPLOAD_BASE64_LENGTH) {
    throw new Error("Image is too large to upload.");
  }
  return { mimeType, data };
}

/**
 * Normalizes and downscales a prescription or medicine box photo so camera uploads
 * (including large JPEGs and iOS HEIC/HEIF photos) fit within serverless and vision API limits.
 */
export async function prepareMedicalImageForUpload(
  file: File,
  maxDimension = 1600,
): Promise<PreparedMedicalImage> {
  if (typeof document === "undefined") {
    return readRawAcceptedFile(file);
  }

  let decoded: DecodedImage;
  try {
    decoded = await decodeImageFile(file);
  } catch (error) {
    if (/^image\/(jpeg|png|webp)$/.test(file.type) && file.size <= 2_800_000) {
      return readRawAcceptedFile(file);
    }
    throw error;
  }

  try {
    const canKeepPng =
      file.type === "image/png" &&
      decoded.width <= maxDimension &&
      decoded.height <= maxDimension &&
      file.size <= 2_800_000;

    if (canKeepPng) {
      const pngData = encodeCanvasImage(decoded, maxDimension, "image/png");
      if (pngData.length <= MAX_UPLOAD_BASE64_LENGTH) {
        return { mimeType: "image/png", data: pngData };
      }
    }

    const jpegData = encodeCanvasImage(decoded, maxDimension, "image/jpeg", 0.88);
    if (jpegData.length <= MAX_UPLOAD_BASE64_LENGTH) {
      return { mimeType: "image/jpeg", data: jpegData };
    }

    const compactDimension = Math.min(maxDimension, 1280);
    const compactData = encodeCanvasImage(decoded, compactDimension, "image/jpeg", 0.76);
    if (compactData.length > MAX_UPLOAD_BASE64_LENGTH) {
      throw new Error("Image remains too large after compression.");
    }
    return { mimeType: "image/jpeg", data: compactData };
  } finally {
    decoded.close();
  }
}
