import { useState } from 'react';
import { useActor } from '@/hooks/useActor';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../react-query/queryKeys';

const CHUNK_SIZE = 1024 * 1024 * 2; // 2MB chunks

export function useChunkedUpload() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const upload = async (file: File) => {
    if (!actor) {
      setError('Actor not initialized');
      return;
    }

    setIsUploading(true);
    setError(null);
    setIsSuccess(false);
    setProgress(0);

    try {
      // Initialize upload
      const fileId = await actor.initUpload(file.name);

      // Read file and split into chunks
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const totalChunks = Math.ceil(uint8Array.length / CHUNK_SIZE);

      // Upload chunks
      for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, uint8Array.length);
        const chunk = uint8Array.slice(start, end);

        await actor.uploadChunk(fileId, chunk);

        // Update progress
        const currentProgress = Math.round(((i + 1) / totalChunks) * 90); // Reserve 10% for finalization
        setProgress(currentProgress);
      }

      // Finalize upload
      await actor.finalizeUpload(fileId);
      setProgress(100);
      setIsSuccess(true);

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: queryKeys.globalStats });
      queryClient.invalidateQueries({ queryKey: queryKeys.myFiles });
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const reset = () => {
    setProgress(0);
    setError(null);
    setIsSuccess(false);
  };

  return {
    upload,
    progress,
    isUploading,
    error,
    isSuccess,
    reset,
  };
}
