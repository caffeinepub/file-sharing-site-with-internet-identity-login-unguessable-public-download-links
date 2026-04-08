import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useChunkedUpload } from "@/features/uploads/useChunkedUpload";
import {
  AlertCircle,
  CalendarX,
  CheckCircle,
  Loader2,
  Upload,
} from "lucide-react";
import { useRef, useState } from "react";

export default function FileUploadPanel() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [expiryDate, setExpiryDate] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { upload, progress, isUploading, error, isSuccess, reset } =
    useChunkedUpload();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      reset();
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    // Convert selected date to nanoseconds bigint, or null if not set
    let expiryTime: bigint | null = null;
    if (expiryDate) {
      const ms = new Date(expiryDate).getTime();
      if (!Number.isNaN(ms)) {
        expiryTime = BigInt(ms) * 1_000_000n; // ms → nanoseconds
      }
    }

    await upload(selectedFile, expiryTime);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setExpiryDate("");
    reset();
    if (inputRef.current) inputRef.current.value = "";
  };

  // Minimum date = today
  const today = new Date().toISOString().split("T")[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload File</CardTitle>
        <CardDescription>
          Select any file to upload. No size or type restrictions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isSuccess ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="file-input">Choose File</Label>
              <Input
                id="file-input"
                ref={inputRef}
                type="file"
                onChange={handleFileSelect}
                disabled={isUploading}
                className="cursor-pointer"
                data-ocid="file-input"
              />
              {selectedFile && (
                <p className="text-sm text-muted-foreground">
                  Selected:{" "}
                  <span className="font-medium text-foreground">
                    {selectedFile.name}
                  </span>{" "}
                  ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="expiry-date"
                className="flex items-center gap-1.5"
              >
                <CalendarX className="h-3.5 w-3.5 text-muted-foreground" />
                Expiry Date
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </Label>
              <Input
                id="expiry-date"
                type="date"
                min={today}
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                disabled={isUploading}
                className="cursor-pointer"
                data-ocid="expiry-date-input"
              />
              {expiryDate && (
                <p className="text-xs text-muted-foreground">
                  File will expire on{" "}
                  <span className="font-medium text-foreground">
                    {new Date(expiryDate).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </p>
              )}
            </div>

            {isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Uploading…</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="w-full"
              data-ocid="upload-submit-btn"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading…
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload File
                </>
              )}
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                File uploaded successfully! Your unique download link is ready
                to copy below.
              </AlertDescription>
            </Alert>
            <Button
              onClick={handleReset}
              variant="outline"
              className="w-full"
              data-ocid="upload-another-btn"
            >
              Upload Another File
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
