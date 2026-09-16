/**
 * Browser-side pre-upload pass: validate, downscale and re-encode to WebP
 * *before* the file leaves the browser, so a 12MB phone photo doesn't cross
 * the wire just to be shrunk on the server. This is bandwidth-saving only —
 * `processAndUploadImage` (src/lib/services/image-service.ts) is the actual
 * security/correctness boundary and re-validates + re-encodes every file
 * server-side regardless of what a client sends. If a browser can't decode
 * or encode WebP (unsupported API, corrupt file), this falls back to
 * returning the original file untouched rather than blocking the upload.
 */

const ACCEPTED_MIME_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]);
const MAX_INPUT_BYTES = 12 * 1024 * 1024;
const MAX_DIMENSION = 2000;
const WEBP_QUALITY = 0.85;

export type ClientImageResult =
  | { ok: true; file: File }
  | { ok: false; error: string };

export async function optimizeImageForUpload(file: File): Promise<ClientImageResult> {
  if (!ACCEPTED_MIME_TYPES.has(file.type)) {
    return { ok: false, error: `Unsupported file type "${file.type || "unknown"}". Use JPEG, PNG, GIF or WebP.` };
  }
  if (file.size === 0) {
    return { ok: false, error: "File is empty." };
  }
  if (file.size > MAX_INPUT_BYTES) {
    return { ok: false, error: `File is too large (${Math.round(file.size / 1024 / 1024)}MB). Max 12MB.` };
  }

  try {
    const optimized = await encodeToWebp(file);
    return { ok: true, file: optimized ?? file };
  } catch {
    return { ok: true, file };
  }
}

async function encodeToWebp(file: File): Promise<File | null> {
  const bitmap = await loadBitmap(file);
  try {
    const { width, height } = fitWithin(bitmap.width, bitmap.height, MAX_DIMENSION);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await canvasToWebp(canvas);
    if (!blob) return null;
    return new File([blob], toWebpName(file.name), { type: "image/webp" });
  } finally {
    if ("close" in bitmap) bitmap.close();
  }
}

function loadBitmap(file: File): Promise<ImageBitmap> {
  if (typeof createImageBitmap !== "function") {
    return Promise.reject(new Error("createImageBitmap unsupported"));
  }
  return createImageBitmap(file);
}

function fitWithin(width: number, height: number, max: number): { width: number; height: number } {
  if (width <= max && height <= max) return { width, height };
  const ratio = Math.min(max / width, max / height);
  return { width: Math.max(1, Math.round(width * ratio)), height: Math.max(1, Math.round(height * ratio)) };
}

function canvasToWebp(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob && blob.type === "image/webp" ? blob : null),
      "image/webp",
      WEBP_QUALITY
    );
  });
}

function toWebpName(name: string): string {
  const base = name.replace(/\.[^./]+$/, "");
  return `${base || "image"}.webp`;
}
