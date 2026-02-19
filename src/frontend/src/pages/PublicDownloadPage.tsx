import { useParams } from '@tanstack/react-router';
import { useDownloadFile } from '@/features/files/useDownloadFile';
import { useActor } from '@/hooks/useActor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { normalizeError } from '@/features/react-query/errorMessages';
import { useEffect, useRef } from 'react';

export default function PublicDownloadPage() {
  const { token: rawToken } = useParams({ from: '/d/$token' });
  const { actor, isFetching: actorFetching } = useActor();
  const { mutate: download, isPending, isSuccess, error } = useDownloadFile();
  const autoDownloadTriggered = useRef(false);

  // Normalize the token: decode and trim
  const token = rawToken ? decodeURIComponent(rawToken).trim() : '';

  // Auto-download effect: trigger once when actor is ready
  useEffect(() => {
    if (token && actor && !actorFetching && !autoDownloadTriggered.current) {
      autoDownloadTriggered.current = true;
      download(token);
    }
  }, [token, actor, actorFetching, download]);

  const handleDownload = () => {
    if (token) {
      download(token);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">File Download</CardTitle>
          <CardDescription>
            {actorFetching ? 'Preparing download...' : 'Click the button below to download your file'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {normalizeError(error)}
              </AlertDescription>
            </Alert>
          )}

          {isSuccess && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>Download started successfully!</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-3">
            <Button onClick={handleDownload} disabled={isPending || !token || actorFetching} size="lg" className="w-full">
              {isPending || actorFetching ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 mr-2" />
                  Download File
                </>
              )}
            </Button>

            <Link to="/" className="w-full">
              <Button variant="outline" className="w-full">
                Go to Home
              </Button>
            </Link>
          </div>

          <div className="text-xs text-muted-foreground text-center pt-4">
            <p>This is a secure download link. Files are stored on the Internet Computer.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
