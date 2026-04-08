import ExpiryBadge from "@/components/files/ExpiryBadge";
import InlineRename from "@/components/files/InlineRename";
import QRCodeModal from "@/components/files/QRCodeModal";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useIsAdmin } from "@/features/admin/useIsAdmin";
import { useAllFiles } from "@/features/files/useAllFiles";
import { useDeleteFile } from "@/features/files/useDeleteFile";
import { normalizeError } from "@/features/react-query/errorMessages";
import type { FileId } from "@/types";
import { formatBytes, formatTimestamp } from "@/utils/format";
import { buildPublicDownloadUrl, copyToClipboard } from "@/utils/links";
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  Check,
  Copy,
  Loader2,
  QrCode,
  Shield,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminPage() {
  const { data: isAdmin, isLoading: isAdminLoading } = useIsAdmin();
  const {
    data: files,
    isLoading: filesLoading,
    error: filesError,
  } = useAllFiles(isAdmin === true);
  const { mutate: deleteFile, isPending: isDeleting } = useDeleteFile();
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<FileId | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [qrFilename, setQrFilename] = useState<string | undefined>(undefined);

  const handleCopyLink = async (token: string, name: string) => {
    if (!token) return;
    const url = buildPublicDownloadUrl(token, name);
    const success = await copyToClipboard(url);
    if (success) {
      setCopiedToken(token);
      setTimeout(() => setCopiedToken(null), 2000);
    } else {
      toast.error("Could not copy link. Please copy it manually.", {
        description: buildPublicDownloadUrl(token, name),
        duration: 8000,
      });
    }
  };

  const handleDelete = (fileId: FileId) => {
    setDeletingId(fileId);
    deleteFile(fileId, {
      onSettled: () => setDeletingId(null),
    });
  };

  const openQr = (token: string, name: string) => {
    setQrUrl(buildPublicDownloadUrl(token, name));
    setQrFilename(name);
  };

  if (isAdminLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Access denied. Admin privileges required.</span>
            <Link to="/">
              <Button variant="outline" size="sm">
                Go Home
              </Button>
            </Link>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage all files on the platform
          </p>
        </div>
      </div>

      {filesError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{normalizeError(filesError)}</AlertDescription>
        </Alert>
      )}

      {filesLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : files && files.length > 0 ? (
        <>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {files.length} {files.length === 1 ? "file" : "files"} on platform
            </span>
          </div>
          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Filename</TableHead>
                  <TableHead>Uploader</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead className="text-right">Downloads</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {files.map((file) => (
                  <TableRow key={file.id.toString()} data-ocid="admin-file-row">
                    <TableCell className="max-w-[160px]">
                      <InlineRename fileId={file.id} currentName={file.name} />
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs max-w-[100px] truncate">
                      {file.uploader.toString().slice(0, 14)}…
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatBytes(file.size)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatTimestamp(file.uploadTime)}
                    </TableCell>
                    <TableCell>
                      <ExpiryBadge expiryTime={file.expiryTime} />
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {file.downloadCount.toString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {file.token ? (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                void handleCopyLink(file.token, file.name)
                              }
                              className="gap-1.5 text-xs"
                              data-ocid="admin-copy-link-btn"
                            >
                              {copiedToken === file.token ? (
                                <>
                                  <Check className="h-3.5 w-3.5 text-primary" />
                                  Copied
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3.5 w-3.5" />
                                  Copy
                                </>
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openQr(file.token, file.name)}
                              className="gap-1.5 text-xs"
                              aria-label={`Show QR code for ${file.name}`}
                              data-ocid="admin-qr-btn"
                            >
                              <QrCode className="h-3.5 w-3.5" />
                              QR
                            </Button>
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground px-2">
                            No link
                          </span>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(file.id)}
                          disabled={isDeleting && deletingId === file.id}
                          className="gap-1.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                          data-ocid="admin-delete-file-btn"
                          aria-label={`Delete ${file.name}`}
                        >
                          {isDeleting && deletingId === file.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      ) : (
        <div
          className="border border-dashed border-border rounded-lg p-10 text-center"
          data-ocid="admin-empty-state"
        >
          <p className="text-muted-foreground text-sm">
            No files have been uploaded yet.
          </p>
        </div>
      )}

      <QRCodeModal
        open={!!qrUrl}
        onClose={() => setQrUrl(null)}
        url={qrUrl ?? ""}
        filename={qrFilename}
      />
    </div>
  );
}
