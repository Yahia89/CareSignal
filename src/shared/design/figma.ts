/**
 * Figma-derived theme tokens — the single source of truth for the new
 * design pass (FamilyDashboard, Settings, ForgotPassword, header pattern,
 * etc.). Screens MUST consume these values rather than inlining hex
 * codes / pixel sizes / radii.
 *
 * If a value isn't here, either:
 *   1. It's a one-off — add it here under a meaningful name, then use it.
 *   2. It already exists in the older `tokens/index.ts` — use that instead.
 *
 * NEVER add a hardcoded color, font size, radius, or shadow to a screen.
 */

// ── Color ───────────────────────────────────────────────────────────────
export const figmaColor = {
  // Page + surfaces
  pageBg: '#FCFDFF',     // Bright white page bg (matches Figma; shadows separate the cards)
  headerBg: '#FFFFFF',
  cardBg: '#FFFFFF',     // White cards so they stay above the near-white page
  surface: '#FFFFFF',
  border: '#D7DEE6',

  // Brand text colors
  titleNavy: '#1E3A5F',     // Big navy headings + brand colour
  bodyDark: '#2A3B4D',      // Default body / paragraph text
  textMuted: '#5E6F82',     // Secondary captions
  textInverse: '#FFFFFF',   // Text on dark fills

  // Brand accent (CareSignal leaf green) and semantic states
  green: '#5FA94B',
  amber: '#E0A93E',
  red: '#C0392B',

  // Component-specific
  toggleOff: '#C9D2DC',
  shadowSoft: 'rgba(30,58,95,0.06)',
  shadowSofter: 'rgba(30,58,95,0.03)',
} as const;

// ── Font size ───────────────────────────────────────────────────────────
// Each name maps to a Figma-named scale. Use `font.h1` not `22`.
export const figmaFont = {
  caption: 12,        // small hint text under stat cards
  small: 13,          // eyebrows / metadata
  body: 14,           // default paragraph
  bodyLg: 15,         // emphasised body (button labels)
  bodyXl: 16,         // larger body (checkbox labels)
  display: 17,        // routing card values
  h3: 19,             // sub-section card titles ("Optional Vital Capture")
  h2: 20,             // page header title ("Alert Settings", "Daily Checkin")
  h1: 22,             // primary heading ("Configure how help…")
  hero: 28,           // senior name
  // Display (invite code) is monospace, special-cased in PairingScreen
} as const;

// ── Border radius ───────────────────────────────────────────────────────
export const figmaRadius = {
  btn: 10,            // primary CTA buttons
  pill: 28,           // outlined pill rows ("response rating")
  card: 14,           // stat / routing / response cards
  cardLg: 16,         // section cards
  toggle: 15,         // pill-toggle track
  fieldSm: 8,         // small inline buttons
} as const;

// ── Re-export grouped namespace ──────────────────────────────────────────
export const figma = {
  color: figmaColor,
  font: figmaFont,
  radius: figmaRadius,
} as const;
