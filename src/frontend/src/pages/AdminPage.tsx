import { useIsAdmin } from '@/features/admin/useIsAdmin';
import { useAllFiles } from '@/features/files/useAllFiles';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Shield, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatBytes, formatTimestamp } from '@/utils/format';
import { buildPublicDownloadUrl, copyToClipboard } from '@/utils/links';
import { normalizeError } from '@/features/react-query/errorMessages';
import { useState } from 'react';

export default function AdminPage() {
  const { data: isAdmin, isLoading: isAdminLoading } = useIsAdmin();
  const { data: files, isLoading: filesLoading, error: filesError } = useAllFiles(isAdmin === true);
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
        <Shield className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage all files on the platform</p>
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
      ) : (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>No files have been uploaded yet.</AlertDescription>
        </Alert>
      )}

      {files && files.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Total files: {files.length}
        </div>
      )}
    </div>
  );
}
