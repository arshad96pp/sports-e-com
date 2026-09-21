"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadProductImageAction, deleteProductImageAction } from "@/lib/actions/admin/product-actions";
import { optimizeImageForUpload } from "@/lib/utils/client-image";
import { useToast } from "@/lib/context/ToastContext";

export interface ProductImageItem {
  id: string;
  url: string;
}

export function ProductImageManager({ productId, initialImages }: { productId: string; initialImages: ProductImageItem[] }) {
  const [images, setImages] = useState(initialImages);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, startUpload] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);

    startUpload(async () => {
      let lastError: string | null = null;
      for (const file of Array.from(files)) {
        const optimized = await optimizeImageForUpload(file);
        if (!optimized.ok) {
          lastError = optimized.error;
          setError(optimized.error);
          continue;
        }
        const formData = new FormData();
        formData.set("file", optimized.file);
        formData.set("sortOrder", String(images.length));
        const result = await uploadProductImageAction(productId, formData);
        if (!result.ok || !result.data) {
          lastError = result.error ?? "Upload failed.";
          setError(lastError);
          continue;
        }
        setImages((prev) => [...prev, { id: result.data!.id, url: result.data!.url }]);
      }
      if (lastError) {
        showToast(lastError, "error");
      } else {
        showToast(files.length > 1 ? "Images uploaded successfully" : "Image uploaded successfully", "success");
      }
    });
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleDelete(image: ProductImageItem) {
    setImages((prev) => prev.filter((i) => i.id !== image.id));
    startUpload(async () => {
      const result = await deleteProductImageAction(productId, image.id, image.url);
      if (!result.ok) {
        setImages((prev) => [...prev, image]);
        setError(result.error ?? "Failed to delete image");
        showToast(result.error ?? "Failed to delete image", "error");
        return;
      }
      showToast("Image deleted successfully", "success");
    });
  }

  return (
    <section className="rounded-xl border border-border bg-white p-5">
      <h2 className="font-display text-base font-bold text-ink">Images</h2>
      <p className="mt-1 text-xs text-muted">JPEG, PNG or WebP — optimized to WebP automatically on upload.</p>

      {error && <p className="mt-3 rounded-lg bg-signal-soft px-3 py-2 text-xs font-medium text-signal">{error}</p>}

      <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {images.map((img) => (
          <div key={img.id} className="group relative aspect-square overflow-hidden rounded-lg border border-border">
            <Image src={img.url} alt="" fill sizes="120px" className="object-cover" />
            <button
              type="button"
              onClick={() => handleDelete(img)}
              aria-label="Remove image"
              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-border-strong text-muted transition-colors hover:border-ink hover:text-ink"
        >
          {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
          <span className="text-[11px] font-medium">{isUploading ? "Uploading…" : "Add Image"}</span>
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <Button type="button" variant="outline" className="mt-4" onClick={() => inputRef.current?.click()} disabled={isUploading}>
        <Upload className="h-4 w-4" />
        Upload Images
      </Button>
    </section>
  );
}
