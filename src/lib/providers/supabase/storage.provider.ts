import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ImageBucket, StoragePort, UploadResult } from "@/lib/core/ports/storage.port";

export function createSupabaseStoragePort(): StoragePort {
  return {
    async upload(bucket: ImageBucket, path: string, data: Buffer, contentType: string): Promise<UploadResult> {
      const supabase = createAdminClient();
      const { error: uploadError } = await supabase.storage.from(bucket).upload(path, data, {
        contentType,
        cacheControl: "31536000",
        upsert: false,
      });
      if (uploadError) {
        return { ok: false, error: `Upload failed: ${uploadError.message}` };
      }
      const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(path);
      return { ok: true, path, publicUrl: publicUrlData.publicUrl };
    },

    getPublicUrl(bucket: ImageBucket, path: string): string {
      const supabase = createAdminClient();
      return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
    },

    async remove(bucket: ImageBucket, path: string): Promise<void> {
      const supabase = createAdminClient();
      await supabase.storage.from(bucket).remove([path]);
    },
  };
}
