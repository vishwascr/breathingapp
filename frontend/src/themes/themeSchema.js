/**
 * @file themeSchema.js
 * @description Zod schemas for the meditation app theme system.
 *
 * Design principles:
 *  - VERSIONED: Every theme file carries a `schemaVersion`. Parsers use
 *    migration pipelines so older files always round-trip cleanly.
 *  - FUTURE-COMPATIBLE: `unknownKeys("passthrough")` on every object lets
 *    unknown keys survive a round-trip instead of being silently dropped.
 *    Consumers that care about strict shapes can call `.strict()` themselves.
 *  - BUILT-IN vs CUSTOM: Built-in themes are keyed records inside `constants.js`
 *    and are type-checked at build time. Imported/exported `.theme` files use
 *    the `ThemeFileSchema` (JSON envelope + payload).
 *  - SELF-DESCRIBING: Each theme file includes author, description and a tags
 *    array so they can be listed, previewed and searched without fully parsing
 *    the color/typography payloads.
 */

import { z } from 'zod';

// ─────────────────────────────────────────────────────────────────────────────
// 1. Primitives
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Accepts any CSS <color> string.
 * Validates hex (#rrggbb / #rgb), rgb(), rgba(), hsl(), hsla(),
 * transparent, and named colours (basic check).
 */
const CssColor = z
  .string()
  .min(1)
  .refine(
    (v) =>
      /^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(v) ||
      /^rgba?\(/.test(v) ||
      /^hsla?\(/.test(v) ||
      /^color-mix\(/.test(v) ||
      /^(transparent|currentColor|inherit|initial|unset)$/i.test(v) ||
      /^[a-zA-Z]+$/.test(v), // named colour (too many to enumerate)
    { message: 'Expected a valid CSS color value' }
  );

/**
 * Accepts any valid CSS length / blur string, e.g. "20px", "0px", "1.5rem".
 */
const CssLength = z
  .string()
  .regex(/^\d+(\.\d+)?(px|rem|em|vh|vw|%)$|^0$/, {
    message: 'Expected a CSS length (e.g. "20px", "0")',
  });

/**
 * Semantic version string, e.g. "1.0.0".
 */
const SemVer = z
  .string()
  .regex(/^\d+\.\d+\.\d+$/, { message: 'Expected semver (e.g. "1.0.0")' });

// ─────────────────────────────────────────────────────────────────────────────
// 2. Colors payload  (schemaVersion 1)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Core colour tokens that map directly to CSS custom properties.
 * Any future additions (e.g. `highlight`, `error`) can be appended here
 * without breaking existing files that omit them — use `.optional()`.
 */
export const ThemeColorsV1Schema = z
  .object({
    // ── Required tokens ──────────────────────────────────────────────────────
    /** Page / app background */
    bg: CssColor,
    /** Primary accent / brand colour */
    accent: CssColor,
    /** Breathing-ring / progress indicator colour */
    indicator: CssColor,
    /** Glassmorphism card / panel background */
    glass: CssColor,
    /** Primary text colour */
    text: CssColor,
    /** Secondary surface (cards, inputs) */
    secondary: CssColor,
    /** De-emphasised / muted text */
    dim: CssColor,
    /** Cooldown-phase ring colour */
    cooldown: CssColor,

    // ── Sidebar surface ───────────────────────────────────────────────────────
    sidebarBg: CssColor,
    sidebarBlur: CssLength,
    sidebarBorder: CssColor,

    // ── Mobile bottom nav surface ─────────────────────────────────────────────
    mobileNavBg: CssColor,
    mobileNavBlur: CssLength,
    mobileNavBorder: CssColor,

    // ── Optional / forward-compat tokens ─────────────────────────────────────
    /** Positive / success indicator */
    success: CssColor.optional(),
    /** Warning indicator */
    warning: CssColor.optional(),
    /** Destructive / error indicator */
    danger: CssColor.optional(),
  })
  .passthrough(); // unknown future tokens survive serialisation

// ─────────────────────────────────────────────────────────────────────────────
// 3. Typography payload  (schemaVersion 1)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Font weight as a number (100–900) or a CSS keyword string.
 */
const FontWeight = z.union([
  z.number().int().min(100).max(900).multipleOf(100),
  z.enum(['normal', 'bold', 'lighter', 'bolder']),
]);

/**
 * Typography settings.  All fields are optional so that a theme file can
 * override only what it cares about; the app fills gaps with its defaults.
 */
export const ThemeTypographyV1Schema = z
  .object({
    /** Google Fonts or system font family, e.g. "Inter, sans-serif" */
    fontFamily: z.string().min(1).optional(),

    /** Base font size for body text, e.g. "16px" */
    baseFontSize: CssLength.optional(),

    /** Default body font weight */
    bodyWeight: FontWeight.optional(),

    /** Heading font weight */
    headingWeight: FontWeight.optional(),

    /**
     * Letter-spacing / tracking override for headings.
     * Accepts CSS lengths or "normal".
     */
    headingLetterSpacing: z
      .union([CssLength, z.literal('normal')])
      .optional(),

    /** Line-height multiplier (unitless) or CSS value */
    lineHeight: z
      .union([z.number().positive(), z.string().min(1)])
      .optional(),

    // ── Shape & effects ────────────────────────────────────────

    /**
     * Base border-radius in pixels (applied to the "sm" tier).
     * The "md" and "lg" tiers are derived proportionally.
     *   sm = borderRadius px
     *   md = borderRadius * 1.5 px
     *   lg = borderRadius * 2.5 px
     *   Range: 0 (sharp) – 20 (very round).
     */
    borderRadius: z.number().min(0).max(20).optional(),

    /**
     * Whether glow / bloom shadow effects are rendered.
     * When false, `--glow-opacity` is set to 0 and all
     * `::after` glow pseudo-elements become invisible.
     */
    glowEnabled: z.boolean().optional(),
  })
  .passthrough();

// ─────────────────────────────────────────────────────────────────────────────
// 4. Theme definition  (the "logical" theme object used at runtime)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A fully parsed theme ready for use inside the React app.
 * This is what `useTheme()` and the CSS-variable applicator receive.
 */
export const ThemeDefinitionSchema = z
  .object({
    /** Human-readable display name shown in Settings */
    name: z.string().min(1).max(60),

    /** Short description, shown in the theme browser */
    description: z.string().max(200).optional(),

    /** Author / creator credit */
    author: z.string().max(80).optional(),

    /** Colour palette */
    colors: ThemeColorsV1Schema,

    /** Typography settings (all optional) */
    typography: ThemeTypographyV1Schema.optional(),
  })
  .passthrough();

// ─────────────────────────────────────────────────────────────────────────────
// 5. Theme file envelope  (what lives on disk / what is imported & exported)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * MIME type embedded in every exported file so hosts can detect it without
 * inspecting the extension.
 */
export const THEME_FILE_MIME = 'application/x-breathing-theme';

/**
 * The current schema version written to every exported file.
 * Bump this when the shape changes in a breaking way and add a migration
 * in `migrateThemeFile()` below.
 */
export const CURRENT_SCHEMA_VERSION = '1';

/**
 * Discriminated union of all supported file versions.
 * When schemaVersion 2 is needed, add a ThemeFileV2Schema here and
 * extend the union + migrateThemeFile().
 */
export const ThemeFileV1Schema = z
  .object({
    /** Identifies the file type for loaders */
    mime: z.literal(THEME_FILE_MIME),

    /** Schema version – drives migration logic */
    schemaVersion: z.literal('1'),

    /** Unique ID for deduplication (UUID v4 recommended) */
    id: z.string().min(1),

    /** Wall-clock timestamp of when the file was exported (ISO-8601) */
    exportedAt: z.string().datetime(),

    /** App version that exported this file, for provenance */
    exportedByVersion: SemVer.optional(),

    /** The theme payload */
    theme: ThemeDefinitionSchema,

    /** Free-form tags for search / filtering */
    tags: z.array(z.string().max(30)).max(20).optional(),
  })
  .passthrough();

/**
 * Union entry point – always validate incoming files through this.
 * New schema versions are added to the union; the discriminator is `schemaVersion`.
 */
export const ThemeFileSchema = z.discriminatedUnion('schemaVersion', [
  ThemeFileV1Schema,
  // ThemeFileV2Schema, ← add here when needed
]);

// ─────────────────────────────────────────────────────────────────────────────
// 6. Runtime registry entry  (built-in + imported themes merged together)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Each entry in the live theme registry (built-in OR imported).
 */
export const ThemeRegistryEntrySchema = z.object({
  /** Unique string key used by the CSS-variable applicator */
  key: z.string().min(1),

  /** 'builtin' | 'imported' */
  source: z.enum(['builtin', 'imported']),

  /**
   * Unique file ID (undefined for built-ins, present for imported themes
   * – used for deduplication and removal).
   */
  fileId: z.string().optional(),

  /** The fully-parsed theme definition */
  definition: ThemeDefinitionSchema,

  /** ISO-8601 timestamp of when the theme was added to the registry */
  addedAt: z.string().datetime().optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. Exported TypeScript-style type aliases (JSDoc for plain JS consumers)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @typedef {z.infer<typeof ThemeColorsV1Schema>}     ThemeColors
 * @typedef {z.infer<typeof ThemeTypographyV1Schema>} ThemeTypography
 * @typedef {z.infer<typeof ThemeDefinitionSchema>}   ThemeDefinition
 * @typedef {z.infer<typeof ThemeFileV1Schema>}       ThemeFileV1
 * @typedef {z.infer<typeof ThemeFileSchema>}         ThemeFile
 * @typedef {z.infer<typeof ThemeRegistryEntrySchema>}ThemeRegistryEntry
 */
