import "server-only";
import sharp from "sharp";
import type { Sharp, Metadata, OutputInfo } from "sharp";
import { getStoragePort } from "@/lib/config/providers";
import type { ImageBucket } from "@/lib/core/ports/storage.port";

export type { ImageBucket };

const ACCEPTED_MIME_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]);
const MAX_INPUT_BYTES = 12 * 1024 * 1024; // 12MB — generous, this is the *pre*-optimization ceiling.

const BUCKET_LIMITS: Record<ImageBucket, { maxWidth: number; maxHeight: number; quality: number }> = {
  "product-images": { maxWidth: 1600, maxHeight: 1600, quality: 82 },
  "category-images": { maxWidth: 1200, maxHeight: 1200, quality: 80 },
  "banner-images": { maxWidth: 2400, maxHeight: 1600, quality: 78 },
  "store-assets": { maxWidth: 800, maxHeight: 800, quality: 85 },
};

export type ImageUploadResult =
  | { ok: true; path: string; publicUrl: string; width: number; height: number; bytes: number }
  | { ok: false; error: string };

/**
 * Full admin image-upload pipeline: validate (declared MIME + actual decoded
 * bytes, size ceiling) → resize to a bucket-appropriate max box (preserving
 * aspect ratio, never upscaling) → strip metadata → re-encode to WebP → upload
 * the optimized WebP (never the original) via the storage provider. Runs
 * entirely in memory (buffers only) so it works on Vercel's serverless
 * runtime with no persistent filesystem. Used by every admin image upload
 * form (products, categories, banners) — one place to change quality/size
 * behaviour. None of this depends on which provider backs storage.
 */
export async function processAndUploadImage(
  file: File,
  bucket: ImageBucket,
  pathPrefix: string
): Promise<ImageUploadResult> {
  if (!ACCEPTED_MIME_TYPES.has(file.type)) {
    return { ok: false, error: `Unsupported file type "${file.type || "unknown"}". Use JPEG, PNG, GIF or WebP.` };
  }
  if (file.size > MAX_INPUT_BYTES) {
    return { ok: false, error: `File is too large (${Math.round(file.size / 1024 / 1024)}MB). Max 12MB.` };
  }
  if (file.size === 0) {
    return { ok: false, error: "File is empty." };
  }

  const inputBuffer = Buffer.from(await file.arrayBuffer());

  let pipeline: Sharp;
  let metadata: Metadata;
  try {
    // No `animated: true` — an animated GIF is read as its first frame only,
    // so output is always a single static WebP. Animated WebP output isn't a
    // current requirement and would need its own size/quality handling.
    pipeline = sharp(inputBuffer, { failOn: "error" });
    metadata = await pipeline.metadata();
  } catch {
    return { ok: false, error: "Could not read this file — it doesn't look like a valid image." };
  }

  // Validate the ACTUAL decoded format, not just the client-declared MIME type
  // (a renamed .exe with a fake Content-Type would fail here, not at .eq(mime)).
  if (!metadata.format || !["jpeg", "png", "webp", "gif"].includes(metadata.format)) {
    return { ok: false, error: `Unrecognized image format "${metadata.format ?? "unknown"}".` };
  }

  const { maxWidth, maxHeight, quality } = BUCKET_LIMITS[bucket];

  let optimized: Buffer;
  let outputInfo: OutputInfo;
  try {
    const result = await pipeline
      .rotate() // apply EXIF orientation, then metadata below strips the EXIF itself
      .resize({ width: maxWidth, height: maxHeight, fit: "inside", withoutEnlargement: true })
      .webp({ quality })
      .toBuffer({ resolveWithObject: true });
    optimized = result.data;
    outputInfo = result.info;
  } catch {
    return { ok: false, error: "Could not process this image. Try a different file." };
  }

  const path = `${pathPrefix}/${crypto.randomUUID()}.webp`;
  const uploaded = await getStoragePort().upload(bucket, path, optimized, "image/webp");
  if (!uploaded.ok) return uploaded;

  return {
    ok: true,
    path: uploaded.path,
    publicUrl: uploaded.publicUrl,
    width: outputInfo.width,
    height: outputInfo.height,
    bytes: optimized.byteLength,
  };
}

export async function deleteImage(bucket: ImageBucket, path: string): Promise<void> {
  await getStoragePort().remove(bucket, path);
}

/** Extracts the storage path from a public storage URL, for deletes. */
export function pathFromPublicUrl(bucket: ImageBucket, publicUrl: string): string | null {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return null;
  return publicUrl.slice(idx + marker.length);
}
