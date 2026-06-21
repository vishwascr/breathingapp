/**
 * @file index.js
 * @description Public barrel export for the themes/ module.
 *
 * Consumers should import exclusively from this file, not from sub-modules,
 * to keep the internal structure refactorable.
 *
 * Example:
 *   import { useTheme, BUILTIN_THEMES, importThemeFile } from '../themes';
 */

// ── Schemas (Zod objects — useful for consumers that want to validate)
export {
  ThemeColorsV1Schema,
  ThemeTypographyV1Schema,
  ThemeDefinitionSchema,
  ThemeFileV1Schema,
  ThemeFileSchema,
  ThemeRegistryEntrySchema,
  THEME_FILE_MIME,
  CURRENT_SCHEMA_VERSION,
} from './themeSchema.js';

// ── Built-in themes
export {
  BUILTIN_THEMES,
  BUILTIN_THEME_KEYS,
  DEFAULT_THEME_KEY,
} from './builtinThemes.js';

// ── Service functions (framework-agnostic)
export {
  migrateThemeFile,
  importThemeFile,
  exportThemeFile,
  applyThemeToDom,
  buildBuiltinRegistryEntry,
  buildImportedRegistryEntry,
  downloadThemeFile,
} from './themeService.js';

// ── Utilities
export { generateUUID } from './uuid.js';

// ── React hook
export { useTheme } from './useTheme.js';
