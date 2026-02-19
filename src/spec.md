# Specification

## Summary
**Goal:** Make public download URLs unguessable by issuing a permanent short random token per file, and disable legacy numeric download links.

**Planned changes:**
- Backend: Generate and store a short, URL-safe random public download token for each newly uploaded file, ensuring uniqueness via collision checks, and keep it permanent for that file.
- Backend: Reject/disable legacy numeric download tokens (e.g., "1", "2") for public downloads so predictable links no longer work.
- Frontend: Continue to build and display public download links using the backend-provided `publicToken`, and ensure copied links use `/d/{token}` (no client-side token generation).

**User-visible outcome:** After uploading a file, users get a permanent public download link like `/d/{randomToken}` that cannot be guessed; older numeric `/d/1`-style links no longer work.
