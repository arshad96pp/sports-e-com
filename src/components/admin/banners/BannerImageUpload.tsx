"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Upload, Loader2, X } from "lucide-react";
import { uploadBannerImageAction, removeBannerImageAction } from "@/lib/actions/admin/banner-actions";
import { optimizeImageForUpload } from "@/lib/utils/client-image";

export function BannerImageUpload({
  bannerId,
  field,
  label,
  currentUrl,
  optional,
}: {
  bannerId: string;
  field: "imageUrlDesktop" | "imageUrlMobile";
  label: string;
  currentUrl: string;
  optional?: boolean;
}) {
  const [url, setUrl] = useState(currentUrl);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    startTransition(async () => {
      const optimized = await optimizeImageForUpload(file);
      if (!optimized.ok) {
        setError(optimized.error);
        return;
      }
      const formData = new FormData();
      formData.set("file", optimized.file);
      const result = await uploadBannerImageAction(bannerId, field, formData);
      if (!result.ok || !result.data) {
        setError(result.error ?? "Upload failed.");
        return;
      }
      setUrl(result.data.url);
    });
  }

  function handleRemove() {
    setError(null);
    startTransition(async () => {
      const result = await removeBannerImageAction(bannerId, field);
      if (!result.ok) {
        setError(result.error ?? "Could not remove image.");
        return;
      }
      setUrl("");
    });
  }

  return (
    <div>
      <p className="mb-1.5 text-[11px] font-semibold text-muted">
        {label}
      </p>
      <div className="relative h-16 w-28 shrink-0">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isPending}
          className="relative flex h-16 w-28 items-center justify-center overflow-hidden rounded-lg border border-dashed border-border-strong bg-surface text-muted hover:border-ink"
        >
          {url && <Image src={url} alt="" fill sizes="112px" className="object-cover" />}
          <span className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white/90">
            {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          </span>
        </button>
        {optional && url && !isPending && (
          <button
            type="button"
            onClick={handleRemove}
            aria-label={`Remove ${label.toLowerCase()} image`}
            className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-border-strong bg-white text-muted shadow-sm hover:text-signal"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
      {error && <p className="mt-1 text-[11px] font-medium text-signal">{error}</p>}
    </div>
  );
}
