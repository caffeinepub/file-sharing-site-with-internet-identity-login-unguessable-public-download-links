import { Badge } from "@/components/ui/badge";
import type { Timestamp } from "@/types";

interface ExpiryBadgeProps {
  expiryTime?: Timestamp;
}

function formatExpiryDate(ts: Timestamp): string {
  const ms = Number(ts / 1_000_000n);
  return new Date(ms).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function isExpired(expiryTime?: Timestamp): boolean {
  if (!expiryTime) return false;
  const ms = Number(expiryTime / 1_000_000n);
  return Date.now() > ms;
}

export default function ExpiryBadge({ expiryTime }: ExpiryBadgeProps) {
  if (!expiryTime) return null;

  const expired = isExpired(expiryTime);

  if (expired) {
    return (
      <Badge
        variant="destructive"
        className="text-xs shrink-0"
        data-ocid="expired-badge"
      >
        Expired
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="text-xs shrink-0 border-amber-500/50 text-amber-600 dark:text-amber-400"
      data-ocid="expiry-badge"
    >
      Expires {formatExpiryDate(expiryTime)}
    </Badge>
  );
}
