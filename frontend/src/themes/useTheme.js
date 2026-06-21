/**
 * @file useTheme.js
 * @description React hook for the full theme lifecycle:
 *   - Initialise from built-ins + persisted imported themes
 *   - Select / apply the active theme
 *   - Import a .theme file
 *   - Export any theme to a .theme file
 *   - Remove an imported theme
 *
 * Usage:
 *   const { registry, activeKey, selectTheme, importTheme, exportTheme, removeTheme } = useTheme();
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { BUILTIN_THEME_KEYS, DEFAULT_THEME_KEY } from './builtinThemes.js';
import {
  applyThemeToDom,
  buildBuiltinRegistryEntry,
  buildImportedRegistryEntry,
  importThemeFile,
  exportThemeFile,
  downloadThemeFile,
} from './themeService.js';
import { ThemeRegistryEntrySchema } from './themeSchema.js';
import { generateUUID } from './uuid.js';

// ─────────────────────────────────────────────────────────────────────────────
// localStorage keys
// ─────────────────────────────────────────────────────────────────────────────

const LS_ACTIVE_KEY     = 'theme:activeKey';
const LS_IMPORTED_THEMES = 'theme:importedThemes'; // JSON array of ThemeFile objects

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @returns {{
 *   registry:        import('./themeSchema.js').ThemeRegistryEntry[],
 *   activeKey:       string,
 *   activeEntry:     import('./themeSchema.js').ThemeRegistryEntry,
 *   selectTheme:     (key: string) => Promise<void>,
 *   importTheme:     (jsonString: string) => { ok: boolean, key?: string, errors?: string[] },
 *   exportTheme:     (key: string) => void,
 *   removeTheme:     (key: string) => void,
 *   saveCustomTheme: (definition: object, existingKey: string | null) => { ok: boolean, key?: string, errors?: string[] },
 *   isBuiltin:       (key: string) => boolean,
 * }}
 */
export function useTheme() {
  // ── 1. Seed registry from built-ins + persisted imported themes ────────────
  const [registry, setRegistry] = useState(() => {
    const builtins = BUILTIN_THEME_KEYS.map(buildBuiltinRegistryEntry);
    try {
      const stored = localStorage.getItem(LS_IMPORTED_THEMES);
      if (stored) {
        const files = JSON.parse(stored);
        if (Array.isArray(files)) {
          const importedEntries = files.map(buildImportedRegistryEntry);
          const existingKeys = new Set(builtins.map((e) => e.key));
          const fresh = importedEntries.filter((e) => !existingKeys.has(e.key));
          return [...builtins, ...fresh];
        }
      }
    } catch {
      // Corrupted storage — reset silently.
      localStorage.removeItem(LS_IMPORTED_THEMES);
    }
    return builtins;
  });

  // ── 2. Restore active key ──────────────────────────────────────────────────
  const [activeKey, setActiveKey] = useState(() => {
    return localStorage.getItem(LS_ACTIVE_KEY) ?? DEFAULT_THEME_KEY;
  });

  // ── 3. Track whether the DOM has been hydrated (avoid double-apply) ────────
  const domHydratedRef = useRef(false);

  // ── 5. Apply theme to DOM whenever activeKey or registry changes ───────────
  useEffect(() => {
    const entry = registry.find((e) => e.key === activeKey);
    if (!entry) return;

    applyThemeToDom(entry.definition.colors, entry.definition.typography);
    domHydratedRef.current = true;
  }, [activeKey, registry]);

  // ── 6. selectTheme ─────────────────────────────────────────────────────────
  /**
   * Activate a theme by key. Persists locally and syncs to the API.
   * Falls back to the previous active key if the key is unknown.
   */
  const selectTheme = useCallback(
    async (key) => {
      const entry = registry.find((e) => e.key === key);
      if (!entry) {
        console.warn(`[useTheme] selectTheme: unknown key "${key}"`);
        return;
      }

      setActiveKey(key);
      localStorage.setItem(LS_ACTIVE_KEY, key);

      // Sync to server (best-effort — non-blocking)
      try {
        await fetch('/api/settings/theme', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ theme: key }),
        });
      } catch (err) {
        console.warn('[useTheme] Failed to persist theme to server:', err);
      }
    },
    [registry]
  );

  // ── 7. importTheme ─────────────────────────────────────────────────────────
  /**
   * Parse, validate and add a .theme file to the registry.
   *
   * @param {string} jsonString - Raw .theme file content.
   * @returns {{ ok: boolean, key?: string, errors?: string[] }}
   */
  const importTheme = useCallback((jsonString) => {
    const result = importThemeFile(jsonString);
    if (!result.ok) return result;

    const themeFile = result.theme;
    const entry = buildImportedRegistryEntry(themeFile);

    setRegistry((prev) => {
      // Deduplicate by fileId
      const filtered = prev.filter((e) => e.fileId !== themeFile.id);
      return [...filtered, entry];
    });

    // Persist imported themes to localStorage
    try {
      const stored = localStorage.getItem(LS_IMPORTED_THEMES);
      const files = stored ? JSON.parse(stored) : [];
      const deduped = files.filter((f) => f.id !== themeFile.id);
      deduped.push(themeFile);
      localStorage.setItem(LS_IMPORTED_THEMES, JSON.stringify(deduped));
    } catch {
      // Non-fatal
    }

    return { ok: true, key: entry.key };
  }, []);

  // ── 8. exportTheme ─────────────────────────────────────────────────────────
  /**
   * Serialise a theme and trigger a file download in the browser.
   *
   * @param {string} key - Registry key of the theme to export.
   */
  const exportTheme = useCallback(
    (key) => {
      const entry = registry.find((e) => e.key === key);
      if (!entry) {
        console.warn(`[useTheme] exportTheme: unknown key "${key}"`);
        return;
      }

      const json = exportThemeFile(key, entry.definition, {
        tags: [],
        existingId: entry.fileId, // preserve id for imported themes
      });

      downloadThemeFile(key, json);
    },
    [registry]
  );

  // ── 9. removeTheme ─────────────────────────────────────────────────────────
  /**
   * Remove an imported theme. No-op for built-in themes.
   *
   * @param {string} key
   */
  const removeTheme = useCallback(
    (key) => {
      const entry = registry.find((e) => e.key === key);
      if (!entry || entry.source === 'builtin') return;

      setRegistry((prev) => prev.filter((e) => e.key !== key));

      // If the removed theme was active, fall back to the default
      if (activeKey === key) {
        setActiveKey(DEFAULT_THEME_KEY);
        localStorage.setItem(LS_ACTIVE_KEY, DEFAULT_THEME_KEY);
      }

      // Remove from localStorage
      try {
        const stored = localStorage.getItem(LS_IMPORTED_THEMES);
        if (!stored) return;
        const files = JSON.parse(stored).filter((f) => f.id !== entry.fileId);
        localStorage.setItem(LS_IMPORTED_THEMES, JSON.stringify(files));
      } catch {
        // Non-fatal
      }
    },
    [activeKey, registry]
  );

  // ── 10. saveCustomTheme ────────────────────────────────────────────────────
  /**
   * Persist a hand-edited theme definition.
   *
   * @param {object}      definition  - Validated ThemeDefinition object.
   * @param {string|null} existingKey - Pass the registry key to UPDATE an
   *                                    existing custom theme, or null to create
   *                                    a brand-new entry.
   * @returns {{ ok: boolean, key?: string, errors?: string[] }}
   */
  const saveCustomTheme = useCallback(
    (definition, existingKey) => {
      try {
        const isUpdate = !!existingKey;
        const existingEntry = isUpdate ? registry.find((e) => e.key === existingKey) : null;

        // Derive a file ID — reuse if updating, generate fresh for new.
        const fileId =
          existingEntry?.fileId ?? generateUUID();

        // Build a full ThemeFile envelope so we can persist it alongside
        // imported .theme files (same storage format).
        const themeFileJson = exportThemeFile(
          existingKey ?? `custom-${Date.now()}`,
          definition,
          { existingId: fileId }
        );
        const themeFile = JSON.parse(themeFileJson);

        // Build a registry entry from the file object.
        const entry = buildImportedRegistryEntry(themeFile);

        // For an update, keep the original key so it stays at the same
        // position in the registry and the active selection doesn't jump.
        const finalEntry = isUpdate
          ? { ...entry, key: existingKey, fileId }
          : entry;

        // Validate the final entry.
        ThemeRegistryEntrySchema.parse(finalEntry);

        setRegistry((prev) => {
          const filtered = prev.filter((e) => e.key !== finalEntry.key);
          return [...filtered, finalEntry];
        });

        // Persist to localStorage (same array as imported .theme files).
        try {
          const stored = localStorage.getItem(LS_IMPORTED_THEMES);
          const files = stored ? JSON.parse(stored) : [];
          const deduped = files.filter((f) => f.id !== fileId);
          deduped.push(themeFile);
          localStorage.setItem(LS_IMPORTED_THEMES, JSON.stringify(deduped));
        } catch { /* Non-fatal */ }

        // Auto-select the saved theme.
        setActiveKey(finalEntry.key);
        localStorage.setItem(LS_ACTIVE_KEY, finalEntry.key);

        return { ok: true, key: finalEntry.key };
      } catch (err) {
        console.error('[useTheme] saveCustomTheme failed:', err);
        return { ok: false, errors: [err.message] };
      }
    },
    [registry]
  );

  // ── 11. Derived helpers ────────────────────────────────────────────────────
  const activeEntry = registry.find((e) => e.key === activeKey) ?? registry[0];
  const isBuiltin = useCallback(
    (key) => registry.find((e) => e.key === key)?.source === 'builtin',
    [registry]
  );

  return {
    registry,
    activeKey,
    activeEntry,
    selectTheme,
    importTheme,
    exportTheme,
    removeTheme,
    saveCustomTheme,
    isBuiltin,
  };
}
