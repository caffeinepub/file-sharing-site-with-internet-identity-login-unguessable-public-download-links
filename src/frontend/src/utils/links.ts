export function buildPublicDownloadUrl(token: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  // Encode the token to ensure URL safety while preserving the /d/{token} format
  const encodedToken = encodeURIComponent(token);
  return `${origin}/d/${encodedToken}`;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}
