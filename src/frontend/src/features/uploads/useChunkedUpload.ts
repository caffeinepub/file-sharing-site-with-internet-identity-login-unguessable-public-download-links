import { ExternalBlob } from "@/backend";
import { useActor } from "@/hooks/useActor";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { queryKeys } from "../react-query/queryKeys";

export function useChunkedUpload() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // expiryTime: nanoseconds as bigint, or null for no expiry
  const upload = async (file: File, expiryTime: bigint | null = null) => {
    if (!actor) {
      setError("Actor not initialized");
      return;
    }

    setIsUploading(true);
    setError(null);
    setIsSuccess(false);
    setProgress(0);

    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) => {
        setProgress(Math.round(pct * 0.9)); // 0–90% while uploading bytes
      });

      await actor.uploadFile(file.name, BigInt(file.size), blob, expiryTime);
      setProgress(100);
      setIsSuccess(true);

      queryClient.invalidateQueries({ queryKey: queryKeys.globalStats });
      queryClient.invalidateQueries({ queryKey: queryKeys.myFiles });
    } catch (err) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const reset = () => {
    setProgress(0);
    setError(null);
    setIsSuccess(false);
  };

  return { upload, progress, isUploading, error, isSuccess, reset };
}
