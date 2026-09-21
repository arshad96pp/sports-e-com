export type ImageBucket = "product-images" | "category-images" | "banner-images";

export type UploadResult =
  | { ok: true; path: string; publicUrl: string }
  | { ok: false; error: string };

/**
 * Raw object storage — upload an already-processed buffer, resolve its public
 * URL, delete by path. Image validation/resizing (`image-service.ts`) is
 * business logic that stays provider-independent; only the bytes-in/URL-out
 * operations below are provider-specific (Supabase Storage today, S3 later).
 */
export interface StoragePort {
  upload(bucket: ImageBucket, path: string, data: Buffer, contentType: string): Promise<UploadResult>;
  getPublicUrl(bucket: ImageBucket, path: string): string;
  remove(bucket: ImageBucket, path: string): Promise<void>;
}
