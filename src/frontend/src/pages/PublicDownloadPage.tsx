import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useDownloadFile } from "@/features/files/useDownloadFile";
import { normalizeError } from "@/features/react-query/errorMessages";
import { useActor } from "@/hooks/useActor";
import { Link, useParams, useSearch } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Home,
  Loader2,
} from "lucide-react";
import { useEffect, useRef } from "react";

export default function PublicDownloadPage() {
  const { token: rawToken } = useParams({ from: "/d/$token" });
  const search = useSearch({ from: "/d/$token" });
  const { actor, isFetching: actorFetching } = useActor();
  const { mutate: download, isPending, isSuccess, error } = useDownloadFile();
  const autoDownloadTriggered = useRef(false);

  // Decode the token from the URL
  const token = rawToken ? decodeURIComponent(rawToken).trim() : "";
  // Use the filename from the query param, fall back to the token string if absent
  const filename = search.name?.trim() ? search.name.trim() : token;

  // Check if the error message indicates expiry
  const isExpiredError =
    error != null &&
    (normalizeError(error).toLowerCase().includes("expir") ||
      normalizeError(error).toLowerCase().includes("expired"));

  // Auto-download once the actor is ready
  useEffect(() => {
    if (token && actor && !actorFetching && !autoDownloadTriggered.current) {
      autoDownloadTriggered.current = true;
      download({ token, filename });
    }
  }, [token, actor, actorFetching, download, filename]);

  const handleManualDownload = () => {
    if (token) {
      download({ token, filename });
    }
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <Card className="bg-card border-border">
        <CardHeader className="text-center space-y-1">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            {isExpiredError ? (
              <Clock className="w-6 h-6 text-destructive" />
            ) : (
              <Download className="w-6 h-6 text-primary" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {isExpiredError ? "File Expired" : "File Download"}
          </CardTitle>
          {filename && filename !== token && (
            <p className="text-sm font-medium text-foreground truncate max-w-xs mx-auto">
              {filename}
            </p>
          )}
          <CardDescription>
            {isExpiredError
              ? "This file is no longer available"
              : actorFetching
                ? "Preparing your download…"
                : isPending
                  ? "Downloading your file…"
                  : isSuccess
                    ? "Download complete"
                    : error
                      ? "Download failed"
                      : "Your file will download automatically"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive" data-ocid="download-error">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {isExpiredError
                  ? "This file has expired and can no longer be downloaded. The download link is no longer valid."
                  : normalizeError(error)}
              </AlertDescription>
            </Alert>
          )}

          {isSuccess && (
            <Alert className="border-primary/20 bg-primary/5">
              <CheckCircle className="h-4 w-4 text-primary" />
              <AlertDescription>
                Download started successfully!
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-3">
            {!isExpiredError && (
              <Button
                onClick={handleManualDownload}
                disabled={isPending || !token || actorFetching}
                size="lg"
                className="w-full gap-2"
                data-ocid="download-btn"
              >
                {isPending || actorFetching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {actorFetching ? "Connecting…" : "Downloading…"}
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    {isSuccess ? "Download Again" : "Download File"}
                  </>
                )}
              </Button>
            )}

            <Link to="/" className="w-full">
              <Button variant="outline" className="w-full gap-2">
                <Home className="w-4 h-4" />
                Go to Home
              </Button>
            </Link>
          </div>

          <p className="text-xs text-muted-foreground text-center pt-2">
            Files are stored securely on the Internet Computer decentralized
            network.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
