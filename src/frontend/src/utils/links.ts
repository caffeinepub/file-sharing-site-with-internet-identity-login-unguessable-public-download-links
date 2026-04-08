export function buildPublicDownloadUrl(
  token: string,
  filename?: string,
): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const encodedToken = encodeURIComponent(token);
  let url = `${origin}/#/d/${encodedToken}`;
  if (filename) {
    url += `?name=${encodeURIComponent(filename)}`;
  }
  return url;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  // Primary: modern Clipboard API (requires secure context + focus)
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to legacy method
    }
  }

  // Fallback: execCommand (works in more environments)
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.cssText =
      "position:fixed;top:-9999px;left:-9999px;opacity:0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const success = document.execCommand("copy");
    document.body.removeChild(textarea);
    return success;
  } catch {
    return false;
  }
}
