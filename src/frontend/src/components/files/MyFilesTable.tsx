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
import { useDeleteFile } from "@/features/files/useDeleteFile";
import { useMyFiles } from "@/features/files/useMyFiles";
import { normalizeError } from "@/features/react-query/errorMessages";
import type { FileId } from "@/types";
import { formatBytes, formatTimestamp } from "@/utils/format";
import { buildPublicDownloadUrl, copyToClipboard } from "@/utils/links";
import {
  AlertCircle,
  Check,
  Copy,
  Loader2,
  QrCode,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function MyFilesTable() {
  const { data: files, isLoading, error } = useMyFiles();
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

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Your Uploaded Files</h2>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{normalizeError(error)}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Your Uploaded Files</h2>
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    );
  }

  if (!files || files.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Your Uploaded Files</h2>
        <div
          className="border border-dashed border-border rounded-lg p-10 text-center"
          data-ocid="empty-files-state"
        >
          <p className="text-muted-foreground text-sm">
            No files uploaded yet. Use the panel above to upload your first
            file.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Your Uploaded Files</h2>
        <span className="text-sm text-muted-foreground">
          {files.length} {files.length === 1 ? "file" : "files"}
        </span>
      </div>
      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Filename</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead>Expiry</TableHead>
              <TableHead className="text-right">Downloads</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.map((file) => (
              <TableRow key={file.id.toString()} data-ocid="file-row">
                <TableCell className="max-w-[200px]">
                  <InlineRename fileId={file.id} currentName={file.name} />
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
                          data-ocid="copy-link-btn"
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
                          data-ocid="qr-btn"
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
                      data-ocid="delete-file-btn"
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

      <QRCodeModal
        open={!!qrUrl}
        onClose={() => setQrUrl(null)}
        url={qrUrl ?? ""}
        filename={qrFilename}
      />
    </div>
  );
}
