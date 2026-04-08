export function formatBytes(bytes: bigint | number): string {
  const numBytes = typeof bytes === "bigint" ? Number(bytes) : bytes;

  if (numBytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(numBytes) / Math.log(k));

  return `${(numBytes / k ** i).toFixed(2)} ${sizes[i]}`;
}

export function formatTimestamp(timestamp: bigint): string {
  // Convert nanoseconds to milliseconds
  const ms = Number(timestamp / 1_000_000n);
  const date = new Date(ms);

  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
