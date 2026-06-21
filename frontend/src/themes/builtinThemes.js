/**
 * @file builtinThemes.js
 * @description Built-in theme definitions, validated at module load time.
 *
 * To add a new built-in theme:
 *  1. Add its definition object to BUILTIN_THEME_DEFINITIONS below.
 *  2. Assign a unique camelCase key.
 *  3. The module will throw at startup if validation fails (fail-fast).
 */

import { z } from 'zod';
import { ThemeDefinitionSchema } from './themeSchema.js';

// ─────────────────────────────────────────────────────────────────────────────
// Raw definitions  (plain objects, validated below)
// ─────────────────────────────────────────────────────────────────────────────

const RAW_BUILTIN_THEMES = {
  noir: {
    name: 'Simple Grayscale',
    description: 'Clean monochrome palette — minimal and distraction-free.',
    author: 'Project Unlearn',
    colors: {
      bg: '#0a0a0a',
      accent: '#cccccc',
      indicator: '#eaeaea',
      glass: '#161616',
      text: '#dddddd',
      secondary: '#242424',
      dim: '#8c8c8c',
      cooldown: '#7a7a7a',
      sidebarBg: 'rgba(22, 22, 22, 0.65)',
      sidebarBlur: '20px',
      sidebarBorder: 'rgba(255, 255, 255, 0.05)',
      mobileNavBg: 'rgba(22, 22, 22, 0.65)',
      mobileNavBlur: '24px',
      mobileNavBorder: 'rgba(255, 255, 255, 0.05)',
    },
    typography: {
      fontFamily: 'Lora, serif',
      bodyWeight: 300,
      headingWeight: 200,
      borderRadius: 16,
      glowEnabled: false,
    },
  },

  mint: {
    name: 'Mint (Fresh)',
    description: 'Refreshing teal-green — calm and energising.',
    author: 'Project Unlearn',
    colors: {
      bg: '#051410',
      accent: '#42f5ad',
      indicator: '#00ffa3',
      glass: '#0D1412',
      text: '#E0FFF4',
      secondary: '#101a15',
      dim: '#80A396',
      cooldown: '#2dd4bf',
      sidebarBg: 'rgba(255, 255, 255, 0.08)',
      sidebarBlur: '20px',
      sidebarBorder: 'rgba(255, 255, 255, 0.1)',
      mobileNavBg: 'rgba(255, 255, 255, 0.08)',
      mobileNavBlur: '24px',
      mobileNavBorder: 'rgba(255, 255, 255, 0.1)',
    },
    typography: {
      fontFamily: 'Nunito, sans-serif',
      bodyWeight: 300,
      headingWeight: 200,
      borderRadius: 24,
      glowEnabled: true,
    },
  },

  coder: {
    name: 'Coder (Synth)',
    description: 'High-contrast synthwave palette for night owls.',
    author: 'Project Unlearn',
    colors: {
      bg: '#11121C',
      accent: '#FF98A4',
      indicator: '#C099FF',
      glass: '#1A1C29',
      text: '#FFFFFF',
      secondary: '#2D304A',
      dim: '#65BCFF',
      cooldown: '#65BCFF',
      sidebarBg: '#1A1C29',
      sidebarBlur: '0px',
      sidebarBorder: '#2D304A',
      mobileNavBg: '#1A1C29',
      mobileNavBlur: '0px',
      mobileNavBorder: '#2D304A',
    },
    typography: {
      fontFamily: 'JetBrains Mono, monospace',
      bodyWeight: 300,
      headingWeight: 200,
      headingLetterSpacing: '0.05em',
      borderRadius: 4,
      glowEnabled: true,
    },
  },

  monster: {
    name: 'Monster',
    description: 'Bold red and amber — intense and focused.',
    author: 'Project Unlearn',
    colors: {
      bg: '#0B0B0B',
      accent: '#E53935',
      indicator: '#FFB74D',
      glass: '#141414',
      text: '#FFFFFF',
      secondary: '#222222',
      dim: '#9E9E9E',
      cooldown: '#FF6B35',
      sidebarBg: 'rgba(20, 20, 20, 0.7)',
      sidebarBlur: '20px',
      sidebarBorder: 'rgba(229, 57, 53, 0.12)',
      mobileNavBg: 'rgba(20, 20, 20, 0.7)',
      mobileNavBlur: '24px',
      mobileNavBorder: 'rgba(229, 57, 53, 0.12)',
    },
    typography: {
      fontFamily: 'Cinzel, serif',
      bodyWeight: 300,
      headingWeight: 200,
      borderRadius: 8,
      glowEnabled: true,
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Validation  (fail-fast at module load — catches typos in dev immediately)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Map of validated built-in theme definitions, keyed by theme key string.
 * @type {Record<string, z.infer<typeof ThemeDefinitionSchema>>}
 */
export const BUILTIN_THEMES = Object.fromEntries(
  Object.entries(RAW_BUILTIN_THEMES).map(([key, raw]) => {
    const result = ThemeDefinitionSchema.safeParse(raw);
    if (!result.success) {
      // Surface the offending key and validation issues immediately.
      console.error(
        `[themeSystem] Built-in theme "${key}" failed validation:`,
        result.error.format()
      );
      throw new Error(
        `Built-in theme "${key}" is invalid. Fix it in builtinThemes.js.`
      );
    }
    return [key, result.data];
  })
);

/**
 * Ordered list of built-in theme keys (preserves insertion order).
 * @type {string[]}
 */
export const BUILTIN_THEME_KEYS = Object.keys(BUILTIN_THEMES);

/**
 * Default theme key applied on first launch.
 */
export const DEFAULT_THEME_KEY = 'noir';
