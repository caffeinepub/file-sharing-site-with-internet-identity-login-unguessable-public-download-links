/**
 * Re-exports generated backend types for use across the frontend.
 * Import from here rather than directly from '@/backend' to keep
 * non-generated code insulated from bindgen changes.
 */
export type {
  FileInfo,
  FileInfoAdmin,
  FileId,
  FileToken,
  Timestamp,
  UserProfile,
  UserRole,
  PlatformCounts,
  ExternalBlob,
} from "@/backend";
