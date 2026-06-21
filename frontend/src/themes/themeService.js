/**
 * @file themeService.js
 * @description Pure-function service layer for theme import / export / migration.
 *
 * This module has NO React dependencies — it can be unit-tested in isolation
 * and reused if the frontend ever migrates to a different framework.
 *
 * Public API:
 *   importThemeFile(jsonString)  → { ok, theme?, errors? }
 *   exportThemeFile(key, def)    → JSON string (.theme file content)
 *   migrateThemeFile(raw)        → latest-version ThemeFile object or throws
 *   applyThemeToDom(colors)      → void
 *   buildRegistryEntry(...)      → ThemeRegistryEntry
 */

import {
  ThemeFileSchema,
  ThemeFileV1Schema,
  ThemeRegistryEntrySchema,
  THEME_FILE_MIME,
  CURRENT_SCHEMA_VERSION,
} from './themeSchema.js';
import { BUILTIN_THEMES } from './builtinThemes.js';
import { generateUUID } from './uuid.js';

// ─────────────────────────────────────────────────────────────────────────────
// App version (read from import.meta.env in Vite projects)
// ─────────────────────────────────────────────────────────────────────────────
const APP_VERSION =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_APP_VERSION) ||
  '1.0.0';

// ─────────────────────────────────────────────────────────────────────────────
// 1. Migration pipeline
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Migrate a raw parsed object from any supported schema version to the latest.
 * Add new `case` blocks here when a breaking schema change ships.
 *
 * @param {unknown} raw - A plain object parsed from JSON.
 * @returns {object} A ThemeFile object at the current schema version.
 * @throws If the input cannot be migrated.
 */
export function migrateThemeFile(raw) {
  // Guard: must be an object with a schemaVersion field.
  if (typeof raw !== 'object' || raw === null || !('schemaVersion' in raw)) {
    throw new Error('Invalid theme file: missing schemaVersion.');
  }

  let current = raw;

  // ── v0 → v1 (hypothetical legacy format with no schemaVersion) ───────────
  // This branch handles files created before the versioning system existed.
  // Uncomment and adapt when needed:
  //
  // if (!current.schemaVersion || current.schemaVersion === '0') {
  //   current = {
  //     mime: THEME_FILE_MIME,
  //     schemaVersion: '1',
  //     id: current.id ?? crypto.randomUUID(),
  //     exportedAt: current.createdAt ?? new Date().toISOString(),
  //     theme: {
  //       name: current.displayName ?? 'Imported Theme',
  //       colors: current.palette,         // renamed field
  //       typography: undefined,
  //     },
  //   };
  // }

  // At this point we expect schemaVersion === '1'.
  // Validate the (possibly migrated) object with the current schema.
  const result = ThemeFileSchema.safeParse(current);
  if (!result.success) {
    throw new Error(
      `Theme file migration failed: ${JSON.stringify(result.error.format(), null, 2)}`
    );
  }

  return result.data;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Import
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parse and validate a `.theme` file JSON string.
 *
 * @param {string} jsonString - Raw file content.
 * @returns {{ ok: true, theme: ThemeFile } | { ok: false, errors: string[] }}
 */
export function importThemeFile(jsonString) {
  // Step 1 – JSON parse
  let raw;
  try {
    raw = JSON.parse(jsonString);
  } catch {
    return { ok: false, errors: ['File is not valid JSON.'] };
  }

  // Step 2 – Type-check MIME before attempting migration (fast-fail for random JSONs)
  if (raw?.mime !== THEME_FILE_MIME) {
    return {
      ok: false,
      errors: [
        `Unrecognised file type. Expected mime "${THEME_FILE_MIME}", got "${raw?.mime}".`,
      ],
    };
  }

  // Step 3 – Migrate to current version
  try {
    const migrated = migrateThemeFile(raw);
    return { ok: true, theme: migrated };
  } catch (err) {
    return { ok: false, errors: [err.message] };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Export
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Serialise a theme definition to a `.theme` file JSON string.
 *
 * @param {string} key - The theme's registry key (used as a default id seed).
 * @param {import('./themeSchema.js').ThemeDefinition} definition - Validated theme.
 * @param {object} [options]
 * @param {string[]} [options.tags]          - Optional tags for the file.
 * @param {string}   [options.existingId]    - Preserve the original file ID on re-export.
 * @returns {string} Pretty-printed JSON ready to save as a `.theme` file.
 */
export function exportThemeFile(key, definition, options = {}) {
  const { tags = [], existingId } = options;

  /** @type {import('./themeSchema.js').ThemeFileV1} */
  const envelope = {
    mime: THEME_FILE_MIME,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    id: existingId ?? generateUUID(),
    exportedAt: new Date().toISOString(),
    exportedByVersion: APP_VERSION,
    theme: definition,
    tags,
  };

  // Validate before serialising to catch any drift between the definition
  // object and the schema.
  const result = ThemeFileV1Schema.safeParse(envelope);
  if (!result.success) {
    throw new Error(
      `Cannot export theme "${key}": ${JSON.stringify(result.error.format(), null, 2)}`
    );
  }

  return JSON.stringify(result.data, null, 2);
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. DOM application  (CSS custom properties)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * CSS custom property map.
 * Extend this when new color tokens are added to ThemeColorsV1Schema.
 */
const COLOR_TOKEN_MAP = {
  bg: '--color-bg',
  accent: '--color-accent',
  indicator: '--indicator-color',
  glass: '--glass-color',
  text: '--color-text',
  secondary: '--color-secondary',
  dim: '--color-dim',
  cooldown: '--color-cooldown',
  sidebarBg: '--sidebar-bg',
  sidebarBlur: '--sidebar-blur',
  sidebarBorder: '--sidebar-border',
  mobileNavBg: '--mobile-nav-bg',
  mobileNavBlur: '--mobile-nav-blur',
  mobileNavBorder: '--mobile-nav-border',
  // Optional tokens
  success: '--color-success',
  warning: '--color-warning',
  danger: '--color-danger',
};

/**
 * Dynamically loads a Google Font if it is not a standard web-safe system font.
 *
 * @param {string} fontFamily
 */
function loadGoogleFont(fontFamily) {
  if (!fontFamily) return;
  const primaryFont = fontFamily.split(',')[0].replace(/['"]/g, '').trim();
  if (!primaryFont) return;

  const systemFonts = new Set([
    'sans-serif', 'serif', 'monospace', 'cursive', 'fantasy', 'system-ui', '-apple-system',
    'blinkmacsystemfont', 'segoe ui', 'roboto', 'helvetica', 'arial', 'georgia', 'times new roman',
    'times', 'courier new', 'courier', 'trebuchet ms', 'verdana', 'geneva', 'tahoma'
  ]);

  if (systemFonts.has(primaryFont.toLowerCase())) return;

  const linkId = `gfont-${primaryFont.toLowerCase().replace(/\s+/g, '-')}`;
  if (document.getElementById(linkId)) return;

  const link = document.createElement('link');
  link.id = linkId;
  link.rel = 'stylesheet';
  const familyParam = primaryFont.replace(/\s+/g, '+');
  link.href = `https://fonts.googleapis.com/css2?family=${familyParam}:wght@300;400;500;600;700&display=swap`;
  document.head.appendChild(link);
}

/**
 * Apply a theme's colors and typography to the document root.
 *
 * @param {import('./themeSchema.js').ThemeColors}     colors
 * @param {import('./themeSchema.js').ThemeTypography} [typography]
 */
export function applyThemeToDom(colors, typography) {
  const root = document.documentElement;

  // Colors
  for (const [token, cssVar] of Object.entries(COLOR_TOKEN_MAP)) {
    if (colors[token] !== undefined) {
      root.style.setProperty(cssVar, colors[token]);
    }
  }

  // Typography (all optional)
  if (typography) {
    if (typography.fontFamily) {
      root.style.setProperty('--font-main', typography.fontFamily);
      loadGoogleFont(typography.fontFamily);
    }
    if (typography.baseFontSize) {
      root.style.setProperty('--font-size-base', typography.baseFontSize);
    }
    if (typography.bodyWeight !== undefined) {
      root.style.setProperty('--font-weight-body', String(typography.bodyWeight));
    }
    if (typography.headingWeight !== undefined) {
      root.style.setProperty('--font-weight-heading', String(typography.headingWeight));
    }
    if (typography.headingLetterSpacing) {
      root.style.setProperty('--letter-spacing-heading', typography.headingLetterSpacing);
    }
    if (typography.lineHeight !== undefined) {
      root.style.setProperty('--line-height', String(typography.lineHeight));
    }

    // Border Radius (sm = radius, md = radius * 1.5, lg = radius * 2.5)
    if (typography.borderRadius !== undefined) {
      root.style.setProperty('--radius-squircle-sm', `${typography.borderRadius}px`);
      root.style.setProperty('--radius-squircle-md', `${typography.borderRadius * 1.5}px`);
      root.style.setProperty('--radius-squircle-lg', `${typography.borderRadius * 2.5}px`);
    } else {
      root.style.setProperty('--radius-squircle-sm', '1rem');
      root.style.setProperty('--radius-squircle-md', '1.5rem');
      root.style.setProperty('--radius-squircle-lg', '2.5rem');
    }

    // Glow toggle
    if (typography.glowEnabled !== undefined) {
      root.style.setProperty('--glow-opacity', typography.glowEnabled ? '1' : '0');
    } else {
      root.style.setProperty('--glow-opacity', '1');
    }
  } else {
    // Defaults when no typography is specified
    root.style.setProperty('--radius-squircle-sm', '1rem');
    root.style.setProperty('--radius-squircle-md', '1.5rem');
    root.style.setProperty('--radius-squircle-lg', '2.5rem');
    root.style.setProperty('--glow-opacity', '1');
  }

  // Meta theme-color for mobile browser chrome
  let metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (!metaThemeColor) {
    metaThemeColor = document.createElement('meta');
    metaThemeColor.setAttribute('name', 'theme-color');
    document.head.appendChild(metaThemeColor);
  }
  metaThemeColor.setAttribute('content', colors.bg);
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Registry helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Construct a validated ThemeRegistryEntry for a built-in theme.
 *
 * @param {string} key
 * @returns {import('./themeSchema.js').ThemeRegistryEntry}
 */
export function buildBuiltinRegistryEntry(key) {
  const definition = BUILTIN_THEMES[key];
  if (!definition) throw new Error(`Unknown built-in theme key: "${key}"`);

  return ThemeRegistryEntrySchema.parse({
    key,
    source: 'builtin',
    definition,
  });
}

/**
 * Construct a validated ThemeRegistryEntry for an imported theme.
 *
 * @param {import('./themeSchema.js').ThemeFile} themeFile
 * @returns {import('./themeSchema.js').ThemeRegistryEntry}
 */
export function buildImportedRegistryEntry(themeFile) {
  // Derive a stable key from the file id (strip non-alphanumeric).
  const key = `imported-${themeFile.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 12)}`;

  return ThemeRegistryEntrySchema.parse({
    key,
    source: 'imported',
    fileId: themeFile.id,
    definition: themeFile.theme,
    addedAt: new Date().toISOString(),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. File download helper  (browser-only)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Trigger a browser file-download of a `.theme` file.
 *
 * @param {string} key        - Theme key, used for the filename.
 * @param {string} jsonString - Output of exportThemeFile().
 */
export function downloadThemeFile(key, jsonString) {
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${key}.theme`;
  a.click();
  URL.revokeObjectURL(url);
}
