import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface QRCodeModalProps {
  open: boolean;
  onClose: () => void;
  url: string;
  filename?: string;
}

export default function QRCodeModal({
  open,
  onClose,
  url,
  filename,
}: QRCodeModalProps) {
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}&margin=10`;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm" data-ocid="qr-modal">
        <DialogHeader>
          <DialogTitle>Share via QR Code</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-2">
          <div className="rounded-lg border border-border bg-card p-3">
            <img
              src={qrImageUrl}
              alt={`QR code for ${filename ?? "file"}`}
              width={200}
              height={200}
              className="block"
            />
          </div>
          {filename && (
            <p className="text-sm font-medium text-foreground text-center truncate max-w-full">
              {filename}
            </p>
          )}
          <p className="text-xs text-muted-foreground text-center break-all max-w-full px-2">
            {url}
          </p>
          <Button
            variant="outline"
            className="w-full"
            onClick={onClose}
            data-ocid="qr-modal-close-btn"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
