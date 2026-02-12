export function triggerDownload(byteData: Uint8Array | ArrayBuffer, filename: string): void {
  // Ensure we have a proper Uint8Array with ArrayBuffer (not ArrayBufferLike)
  const uint8Array = byteData instanceof Uint8Array 
    ? new Uint8Array(byteData) // Create a copy to ensure proper ArrayBuffer type
    : new Uint8Array(byteData);
  
  const blob = new Blob([uint8Array], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
