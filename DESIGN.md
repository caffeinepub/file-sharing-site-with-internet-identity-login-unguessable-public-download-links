# FileVault Design System

## Purpose
File-sharing platform requiring trust, clarity, and efficient access. Users need confidence in security (unique tokens) and fast file management.

## Tone & Aesthetics
**Modern Minimalist**: Clean dark mode (charcoal base #1a1f2e), cool cyan accents, high information density without clutter. Tech-forward, trustworthy, efficient.

## Visual Direction
Intent-driven UI with clear hierarchy. File tokens and metadata displayed prominently. Minimal decoration; every element serves function. Depth via elevation and borders, not gradients.

## Color Palette

| Role | Light | Dark | Purpose |
|------|-------|------|---------|
| Background | L0.95 C0.002 H0 | L0.1 C0.008 H255 | Neutral canvas |
| Foreground | L0.15 C0.005 H0 | L0.93 C0.003 H255 | Text, readable |
| Primary | L0.55 C0.15 H250 | L0.62 C0.18 H248 | Cyan accent, CTAs |
| Card | L0.97 C0.002 H0 | L0.135 C0.01 H255 | Elevated surfaces |
| Destructive | L0.55 C0.22 H25 | L0.58 C0.24 H25 | Delete actions |
| Border | L0.92 C0.008 H45 | L0.2 C0.015 H255 | Subtle dividers |
| Muted | L0.9 C0.005 H45 | L0.25 C0.015 H255 | Hover states |

## Typography
- **Display/Body**: General Sans (modern, neutral, technical clarity)
- **Mono**: Geist Mono (tokens, technical details, download links)
- **Scale**: 12px (labels), 14px (body), 16px (heading), 20px (stat), 32px (hero)

## Structural Zones
- **Header**: Card-elevated with bottom border, contains logo and navigation
- **Main Content**: Background with card sections for files/stats
- **Stat Cards**: Elevated with subtle shadows, grid layout (3-column on desktop, 1 on mobile)
- **File Rows**: Light hover state, compact padding, actions right-aligned
- **Admin Panel**: Tabular view, row borders, metadata columns

## Spacing & Rhythm
- Padding base: 6px unit (6/12/18/24/32px)
- Cards: 1.5rem gutter, 2rem padding
- File rows: 1rem vertical, 1.5rem horizontal
- Breakpoints: mobile-first (sm 640px, md 768px, lg 1024px, xl 1280px)

## Component Patterns
- **Buttons**: 4px padding, rounded-lg, solid primary/outline secondary/destructive red
- **Token Display**: Font-mono with copy-to-clipboard interaction
- **Stats**: Three-card row with icon + value + label stacked
- **File Actions**: Copy-link, delete buttons inline, hover to reveal

## Motion
Subtle smooth transitions: all properties 300ms ease-in-out. Avoid bouncy or decorative animations. Entrance: fade-in only.

## Signature Detail
Download token displayed in monospace, always copyable. Creates confidence in link permanence and security.

## Constraints
- No full-page gradients; depth via layers
- No rainbow palettes; 5 colors max
- Token-only color usage; no arbitrary Tailwind classes
- High contrast on all interactive elements
- Mobile-first responsive design
