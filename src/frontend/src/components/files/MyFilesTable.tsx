import { useMyFiles } from '@/features/files/useMyFiles';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Copy, Check } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { formatBytes, formatTimestamp } from '@/utils/format';
import { buildPublicDownloadUrl, copyToClipboard } from '@/utils/links';
import { normalizeError } from '@/features/react-query/errorMessages';
import { useState } from 'react';

export default function MyFilesTable() {
  const { data: files, isLoading, error } = useMyFiles();
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const handleCopyLink = async (token: string) => {
    if (!token || token.trim() === '') {
      return;
    }
    const url = buildPublicDownloadUrl(token);
    const success = await copyToClipboard(url);
    if (success) {
      setCopiedToken(token);
      setTimeout(() => setCopiedToken(null), 2000);
    }
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
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>You haven't uploaded any files yet. Upload your first file above to get started.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Your Uploaded Files</h2>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Filename</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Downloads</TableHead>
              <TableHead>Public Link</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.map((file) => {
              const hasValidToken = file.publicToken && file.publicToken.trim() !== '';
              return (
                <TableRow key={file.id.toString()}>
                  <TableCell className="font-medium">{file.originalFilename}</TableCell>
                  <TableCell>{formatBytes(file.byteSize)}</TableCell>
                  <TableCell>{formatTimestamp(file.createdAt)}</TableCell>
                  <TableCell className="text-right">{file.downloadCount.toString()}</TableCell>
                  <TableCell>
                    {hasValidToken ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyLink(file.publicToken)}
                        className="gap-2"
                      >
                        {copiedToken === file.publicToken ? (
                          <>
                            <Check className="h-4 w-4" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            Copy Link
                          </>
                        )}
                      </Button>
                    ) : (
                      <span className="text-sm text-muted-foreground">No link available</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <div className="text-sm text-muted-foreground">
        Total files: {files.length}
      </div>
    </div>
  );
}
