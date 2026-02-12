# Specification

## Summary
**Goal:** Make public file download links secure (unguessable 20-character tokens) and ensure copied public links reliably route to a working public download page that triggers downloads.

**Planned changes:**
- Replace predictable numeric public download tokens with unique 20-character tokens for all newly finalized uploads, ensuring uniqueness and rejecting/invalidating old numeric tokens.
- Regenerate and reassign new 20-character tokens for all existing stored files via a state upgrade/migration so previously shared short links stop working.
- Fix public link generation and routing so copied links resolve to the app’s public download route (`/d/<token>`) and open the PublicDownloadPage correctly.
- Update PublicDownloadPage to auto-start a download once on load for valid tokens, show loading/success states, keep a manual Download button, and display a clear English error for invalid tokens.

**User-visible outcome:** Copying a public link from user/admin file lists produces a secure URL that opens the public download page and automatically downloads the file; invalid or old links show a clear error instead of silently failing.
