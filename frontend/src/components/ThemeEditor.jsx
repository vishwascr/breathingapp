/**
 * @file ThemeEditor.jsx
 * @description Full-featured modal editor for theme colors and typography.
 *
 * Features:
 *  - Color picker (native <input type="color">) + raw CSS text input per token
 *  - Handles both solid hex AND rgba/css strings (text fallback for transparency)
 *  - Typography section: font family, weights, letter-spacing, line-height
 *  - Live preview bar showing all color tokens in real time
 *  - Blur value sliders for sidebar/nav glass surfaces
 *  - Save as new theme OR update existing custom theme
 *  - Zod validation before saving with per-field error display
 *
 * Props:
 *   isOpen       – boolean
 *   onClose      – () => void
 *   baseEntry    – ThemeRegistryEntry  (the theme to fork/edit from)
 *   isBuiltin    – boolean             (true = "Save as New" only; false = also allow "Update")
 *   onSave       – (definition, existingKey | null) => { ok, key?, errors? }
 */

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  X, Save, Plus, Sliders, Type, Eye, RotateCcw, ChevronDown, ChevronRight,
} from 'lucide-react';
import { ThemeDefinitionSchema, ThemeColorsV1Schema } from '../themes/themeSchema.js';
import { applyThemeToDom } from '../themes/themeService.js';

// ─────────────────────────────────────────────────────────────────────────────
// Token metadata — drives the UI groups
// ─────────────────────────────────────────────────────────────────────────────

const COLOR_GROUPS = [
  {
    id: 'core',
    label: 'Core Palette',
    tokens: [
      { key: 'bg',        label: 'Background',      hint: 'App / page background' },
      { key: 'accent',    label: 'Accent',           hint: 'Primary brand / CTA color' },
      { key: 'indicator', label: 'Indicator',        hint: 'Breathing ring / progress' },
    ],
  },
  {
    id: 'sidebar',
    label: 'Sidebar',
    blur: { key: 'sidebarBlur', label: 'Blur' },
  },
  {
    id: 'mobilenav',
    label: 'Mobile Nav',
    blur: { key: 'mobileNavBlur', label: 'Blur' },
  },
];

const FONT_WEIGHT_OPTIONS = [100, 200, 300, 400, 500, 600, 700, 800, 900];

const FONT_PRESETS = [
  'Helvetica, Arial, sans-serif',
  'Inter, sans-serif',
  'Lato, sans-serif',
  'Nunito, sans-serif',
  'Raleway, sans-serif',
  'Poppins, sans-serif',
  'DM Sans, sans-serif',
  'Quicksand, sans-serif',
  'Jost, sans-serif',
  'Hind, sans-serif',
  'Playfair Display, serif',
  'Lora, serif',
  'Cormorant Garamond, serif',
  'Libre Baskerville, serif',
  'EB Garamond, serif',
  'Merriweather, serif',
  'Crimson Pro, serif',
  'Source Serif 4, serif',
  'Spectral, serif',
  'DM Mono, monospace',
  'Source Code Pro, monospace',
  'JetBrains Mono, monospace',
  'Inconsolata, monospace',
  'Space Mono, monospace',
  'Josefin Slab, serif',
  'Philosopher, sans-serif',
  'Abril Fatface, serif',
  'Cinzel, serif',
  'Tenor Sans, sans-serif',
  'Josefin Sans, sans-serif',
  'Questrial, sans-serif',
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Try to extract a hex-representable color from any CSS color string.
 * Falls back to #000000 so <input type="color"> never errors.
 */
function cssToHex(css = '') {
  if (/^#[0-9a-fA-F]{6}$/.test(css)) return css;
  if (/^#[0-9a-fA-F]{3}$/.test(css)) {
    const [, r, g, b] = css.match(/^#(.)(.)(.)$/);
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  // For rgba / complex values, try to parse via canvas trick
  try {
    const ctx = document.createElement('canvas').getContext('2d');
    ctx.fillStyle = css;
    const hex = ctx.fillStyle; // browser normalises to #rrggbb
    if (/^#[0-9a-fA-F]{6}$/.test(hex)) return hex;
  } catch { /* ignore */ }
  return '#000000';
}

function hexToRgb(hex) {
  const cleaned = hex.replace(/^#/, '');
  let r, g, b;
  if (cleaned.length === 3) {
    r = parseInt(cleaned[0] + cleaned[0], 16);
    g = parseInt(cleaned[1] + cleaned[1], 16);
    b = parseInt(cleaned[2] + cleaned[2], 16);
  } else if (cleaned.length === 6 || cleaned.length === 8) {
    r = parseInt(cleaned.substring(0, 2), 16);
    g = parseInt(cleaned.substring(2, 4), 16);
    b = parseInt(cleaned.substring(4, 6), 16);
  } else {
    return { r: 128, g: 128, b: 128 };
  }
  return { r, g, b };
}

function rgbToHex({ r, g, b }) {
  const clamp = (val) => Math.max(0, Math.min(255, Math.round(val)));
  return '#' + [clamp(r), clamp(g), clamp(b)].map(x => x.toString(16).padStart(2, '0')).join('');
}

function getLuminance({ r, g, b }) {
  const a = [r, g, b].map(function (v) {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function mix(color1, color2, weight) {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  return {
    r: rgb1.r * (1 - weight) + rgb2.r * weight,
    g: rgb1.g * (1 - weight) + rgb2.g * weight,
    b: rgb1.b * (1 - weight) + rgb2.b * weight
  };
}

function rgbToHsl({ r, g, b }) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToRgb({ h, s, l }) {
  h /= 360; s /= 100; l /= 100;
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return { r: r * 255, g: g * 255, b: b * 255 };
}

function hexToRgba(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function calculateDerivedColors(bg, accent, indicator) {
  if (!bg) bg = '#000000';
  if (!accent) accent = '#ffffff';
  if (!indicator) indicator = '#ffffff';

  // Ensure colors are in hex form before performing math
  const bgHex = cssToHex(bg);
  const accentHex = cssToHex(accent);
  const indicatorHex = cssToHex(indicator);

  const bgRgb = hexToRgb(bgHex);
  const bgLum = getLuminance(bgRgb);
  const isDark = bgLum < 0.5;

  // 1. Text color (off-white tinted by indicator if dark, off-black if light)
  const text = isDark
    ? rgbToHex(mix('#ffffff', indicatorHex, 0.04))
    : rgbToHex(mix('#000000', indicatorHex, 0.08));

  // 2. Dim / muted text
  const dim = isDark
    ? rgbToHex(mix(bgHex, text, 0.65))
    : rgbToHex(mix(bgHex, text, 0.55));

  // 3. Secondary surface
  const secondary = isDark
    ? rgbToHex(mix(bgHex, '#ffffff', 0.09))
    : rgbToHex(mix(bgHex, '#000000', 0.07));

  // 4. Glass color
  const glass = isDark
    ? rgbToHex(mix(bgHex, '#ffffff', 0.05))
    : rgbToHex(mix(bgHex, '#000000', 0.04));

  // 5. Cooldown color
  const indHsl = rgbToHsl(hexToRgb(indicatorHex));
  let coolRgb;
  if (indHsl.s < 10) {
    coolRgb = hslToRgb({ h: indHsl.h, s: indHsl.s, l: 48 });
  } else {
    const hueShift = (indHsl.h >= 100 && indHsl.h <= 250) ? 30 : -30;
    let targetHue = (indHsl.h + hueShift + 360) % 360;
    coolRgb = hslToRgb({
      h: targetHue,
      s: Math.max(20, indHsl.s * 0.85),
      l: Math.max(30, Math.min(indHsl.l * 0.8, 65))
    });
  }
  const cooldown = rgbToHex(coolRgb);

  // 6. Sidebar / Mobile Nav backgrounds (semi-transparent glass)
  const sidebarBg = hexToRgba(glass, 0.7);
  const mobileNavBg = hexToRgba(glass, 0.7);

  // 7. Sidebar / Mobile Nav borders (subtle accent tint)
  const sidebarBorder = hexToRgba(accentHex, 0.12);
  const mobileNavBorder = hexToRgba(accentHex, 0.12);

  return {
    text,
    dim,
    secondary,
    glass,
    cooldown,
    sidebarBg,
    sidebarBorder,
    mobileNavBg,
    mobileNavBorder
  };
}

/** Whether the value is a plain hex color (picker can control fully). */
const isPlainHex = (v = '') => /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(v);

/** Parse px value for the blur slider. */
const blurToPx = (v = '0px') => parseInt(v) || 0;
const pxToBlur = (n) => (n === 0 ? '0px' : `${n}px`);

// ─────────────────────────────────────────────────────────────────────────────
// ColorRow — one token editor
// ─────────────────────────────────────────────────────────────────────────────

function ColorRow({ tokenKey, label, hint, value, onChange, error }) {
  const plain = isPlainHex(value);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[0.7rem] font-semibold uppercase tracking-widest text-text/60">
          {label}
        </span>
        {hint && (
          <span className="text-[0.6rem] text-dim/50 italic">{hint}</span>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Native color picker — primary control for solid colors */}
        <label
          className="relative shrink-0 cursor-pointer group"
          title={plain ? 'Click to pick color' : 'Enter hex in text field to enable picker'}
        >
          <div
            className="w-10 h-10 rounded-squircle-sm border-2 border-white/20 shadow-inner transition-all group-hover:border-accent"
            style={{ backgroundColor: value }}
          />
          <input
            type="color"
            value={cssToHex(value)}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            aria-label={`Pick color for ${label}`}
          />
        </label>

        {/* Raw CSS text — always editable for rgba, transparent, etc. */}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`flex-1 h-10 border rounded-squircle-sm px-3 text-sm font-mono focus:outline-none transition-all ${
            error
              ? 'border-red-500/60 text-red-400 bg-red-500/5'
              : 'border-white/20 text-text focus:border-accent'
          }`}
          style={{ background: 'rgba(255,255,255,0.07)' }}
          placeholder="#000000 or rgba(0,0,0,0.5)"
          spellCheck={false}
          aria-label={`CSS value for ${label}`}
        />
      </div>

      {error && (
        <p className="text-[0.65rem] text-red-400 mt-0.5">{error}</p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LivePreviewBar
// ─────────────────────────────────────────────────────────────────────────────

function LivePreviewBar({ colors }) {
  return (
    <div className="flex items-center gap-2 p-3 rounded-squircle-md border border-white/5 overflow-x-auto"
      style={{ backgroundColor: colors.bg }}>
      {/* Fake breathing ring */}
      <div
        className="w-8 h-8 rounded-full border-2 shrink-0"
        style={{ borderColor: colors.indicator }}
      />
      {/* Fake card */}
      <div
        className="flex-1 min-w-[100px] h-8 rounded-squircle-sm flex items-center px-3 gap-2"
        style={{ backgroundColor: colors.glass }}
      >
        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: colors.accent }} />
        <div className="h-1.5 flex-1 rounded-full" style={{ backgroundColor: colors.secondary }} />
      </div>
      {/* Swatches row */}
      <div className="flex gap-1.5 shrink-0">
        {['accent', 'indicator', 'dim', 'cooldown'].map((k) => (
          <div
            key={k}
            title={k}
            className="w-4 h-4 rounded-full border border-white/10"
            style={{ backgroundColor: colors[k] }}
          />
        ))}
      </div>
      {/* Text preview */}
      <span
        className="text-xs font-light shrink-0 hidden sm:block"
        style={{ color: colors.text }}
      >
        Breathe
      </span>
      <span
        className="text-[0.65rem] shrink-0 hidden sm:block"
        style={{ color: colors.dim }}
      >
        dim
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section collapse wrapper
// ─────────────────────────────────────────────────────────────────────────────

function Section({ icon: Icon, title, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-white/10 rounded-squircle-md" style={{ background: 'rgba(255,255,255,0.03)' }}>
      <button
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-all rounded-t-squircle-md"
        onClick={() => setOpen((p) => !p)}
      >
        <div className="flex items-center gap-3">
          <Icon size={16} className="text-accent/70" />
          <span className="text-[0.7rem] uppercase tracking-[0.2rem] text-text/70 font-semibold">
            {title}
          </span>
        </div>
        {open ? <ChevronDown size={14} className="text-dim/60" /> : <ChevronRight size={14} className="text-dim/60" />}
      </button>
      {open && (
        <div className="px-5 pt-4 pb-5 flex flex-col gap-5 border-t border-white/8">
          {children}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main ThemeEditor component
// ─────────────────────────────────────────────────────────────────────────────

export default function ThemeEditor({ isOpen, onClose, baseEntry, isBuiltin: isBuiltinProp, onSave }) {
  // ── Draft state ────────────────────────────────────────────────────────────
  const [name, setName]               = useState('');
  const [description, setDescription] = useState('');
  const [author, setAuthor]           = useState('');
  const [colors, setColors]           = useState({});
  const [typography, setTypography]   = useState({});
  const [errors, setErrors]           = useState({});   // fieldKey → message
  const [saving, setSaving]           = useState(false);
  const [livePreview, setLivePreview] = useState(false);

  // ── Reset draft when base entry changes ───────────────────────────────────
  useEffect(() => {
    if (!baseEntry || !isOpen) return;
    const def = baseEntry.definition;
    setName(isBuiltinProp ? `${def.name} (Custom)` : def.name);
    setDescription(def.description ?? '');
    setAuthor(def.author ?? '');
    
    const baseColors = { ...def.colors };
    const derived = calculateDerivedColors(baseColors.bg, baseColors.accent, baseColors.indicator);
    Object.assign(baseColors, derived);
    
    setColors(baseColors);
    setTypography({ ...(def.typography ?? {}) });
    setErrors({});
    setLivePreview(false);
  }, [baseEntry, isOpen, isBuiltinProp]);

  // ── Live preview — apply draft to DOM in real time ────────────────────────
  useEffect(() => {
    if (!livePreview || !isOpen) return;
    // Don't validate — just apply whatever is there; invalid values silently fail
    applyThemeToDom(colors, typography);
  }, [livePreview, colors, typography, isOpen]);

  // ── Restore original theme when preview is turned off / modal closed ──────
  const restoreOriginal = useCallback(() => {
    if (baseEntry) {
      applyThemeToDom(baseEntry.definition.colors, baseEntry.definition.typography);
    }
  }, [baseEntry]);

  useEffect(() => {
    if (!isOpen) restoreOriginal();
  }, [isOpen, restoreOriginal]);

  // ── Color setter ──────────────────────────────────────────────────────────
  const setColor = useCallback((key, val) => {
    setColors((prev) => {
      const next = { ...prev, [key]: val };
      if (key === 'bg' || key === 'accent' || key === 'indicator') {
        const derived = calculateDerivedColors(next.bg, next.accent, next.indicator);
        Object.assign(next, derived);
      }
      return next;
    });
    // Clear per-token error
    setErrors((prev) => {
      const next = { ...prev };
      delete next[`colors.${key}`];
      return next;
    });
  }, []);

  const setTypoField = useCallback((key, val) => {
    setTypography((prev) => ({ ...prev, [key]: val }));
  }, []);

  // ── Blur slider ───────────────────────────────────────────────────────────
  const setBlur = useCallback((key, pxVal) => {
    setColors((prev) => ({ ...prev, [key]: pxToBlur(pxVal) }));
  }, []);

  // ── Validate & save ───────────────────────────────────────────────────────
  const handleSave = useCallback(
    async (asNew) => {
      setSaving(true);
      const definition = {
        name: name.trim(),
        description: description.trim() || undefined,
        author: author.trim() || undefined,
        colors,
        typography: Object.keys(typography).length ? typography : undefined,
      };

      const result = ThemeDefinitionSchema.safeParse(definition);
      if (!result.success) {
        // Flatten Zod errors into a { fieldKey: message } map
        const flat = {};
        for (const issue of result.error.issues) {
          flat[issue.path.join('.')] = issue.message;
        }
        setErrors(flat);
        setSaving(false);
        return;
      }

      const saveResult = onSave(result.data, asNew ? null : baseEntry?.key);
      setSaving(false);
      if (saveResult?.ok) {
        restoreOriginal(); // let the hook re-apply the saved theme
        onClose();
      } else {
        setErrors({ _global: saveResult?.errors?.join(' ') ?? 'Save failed.' });
      }
    },
    [name, description, author, colors, typography, baseEntry, onSave, restoreOriginal, onClose]
  );

  if (!isOpen || !baseEntry) return null;

  const def = baseEntry.definition;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-stretch md:items-center justify-center bg-black/80 backdrop-blur-xl animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) { restoreOriginal(); onClose(); }
      }}
    >
      {/* Editor panel */}
      <div className="relative w-full md:w-[680px] md:max-h-[92vh] h-full md:h-auto flex flex-col bg-glass border border-white/8 md:rounded-squircle-lg shadow-2xl overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8 shrink-0">
          <div className="flex items-center gap-3">
            <Sliders size={18} className="text-accent" />
            <div>
              <h2 className="text-sm font-medium text-text tracking-wide">
                Customize Theme
              </h2>
              <p className="text-[0.65rem] text-dim/60 mt-0.5">
                Editing from <span className="text-dim font-medium">{def.name}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Live preview toggle */}
            <button
              onClick={() => {
                const next = !livePreview;
                setLivePreview(next);
                if (!next) restoreOriginal();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[0.65rem] uppercase tracking-widest font-medium transition-all ${
                livePreview
                  ? 'bg-accent text-bg'
                  : 'bg-white/5 text-dim hover:bg-white/10'
              }`}
              title="Toggle live preview on app"
            >
              <Eye size={12} />
              {livePreview ? 'Live' : 'Preview'}
            </button>
            <button
              onClick={() => { restoreOriginal(); onClose(); }}
              className="p-2 rounded-full text-dim hover:text-text hover:bg-white/10 transition-all"
              aria-label="Close editor"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-5 flex flex-col gap-5">

          {/* Global error */}
          {errors._global && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-squircle-sm bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {errors._global}
            </div>
          )}

          {/* Live preview bar */}
          <div className="flex flex-col gap-2">
            <span className="text-[0.65rem] uppercase tracking-widest text-dim/50">Preview</span>
            <LivePreviewBar colors={{ ...def.colors, ...colors }} />
          </div>

          {/* ── Identity ── */}
          <Section icon={Type} title="Identity" defaultOpen>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-text/60">
                  Theme Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setErrors((p) => { const n={...p}; delete n.name; return n; }); }}
                  className={`h-10 border rounded-squircle-sm px-3 text-sm text-text focus:outline-none focus:border-accent transition-all ${
                    errors.name ? 'border-red-500/60 bg-red-500/5' : 'border-white/20'
                  }`}
                  style={{ background: 'rgba(255,255,255,0.07)' }}
                  placeholder="My Custom Theme"
                  maxLength={60}
                />
                {errors.name && <p className="text-[0.65rem] text-red-400">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-text/60">
                    Description
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="h-10 border border-white/20 rounded-squircle-sm px-3 text-sm text-text focus:outline-none focus:border-accent transition-all"
                    style={{ background: 'rgba(255,255,255,0.07)' }}
                    placeholder="A brief description..."
                    maxLength={200}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-text/60">
                    Author
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="h-10 border border-white/20 rounded-squircle-sm px-3 text-sm text-text focus:outline-none focus:border-accent transition-all"
                    style={{ background: 'rgba(255,255,255,0.07)' }}
                    placeholder="Your name"
                    maxLength={80}
                  />
                </div>
              </div>
            </div>
          </Section>

          {/* ── Color groups ── */}
          {COLOR_GROUPS.map((group) => (
            <Section key={group.id} icon={Sliders} title={group.label} defaultOpen={true}>
              <div className="flex flex-col gap-5">
                {group.tokens?.map(({ key, label, hint }) => (
                  <ColorRow
                    key={key}
                    tokenKey={key}
                    label={label}
                    hint={hint}
                    value={colors[key] ?? def.colors[key] ?? ''}
                    onChange={(val) => setColor(key, val)}
                    error={errors[`colors.${key}`]}
                  />
                ))}

                {/* Blur slider */}
                {group.blur && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[0.7rem] font-medium uppercase tracking-widest text-dim">
                        {group.blur.label}
                      </span>
                      <span className="text-[0.7rem] font-mono text-accent">
                        {colors[group.blur.key] ?? def.colors[group.blur.key] ?? '0px'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={40}
                      step={2}
                      value={blurToPx(colors[group.blur.key] ?? def.colors[group.blur.key] ?? '0px')}
                      onChange={(e) => setBlur(group.blur.key, parseInt(e.target.value))}
                      className="w-full accent-accent h-1.5"
                    />
                  </div>
                )}
              </div>
            </Section>
          ))}

          {/* ── Typography ── */}
          <Section icon={Type} title="Typography" defaultOpen={true}>
            <div className="flex flex-col gap-5 pt-4">

              {/* Font family */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-text/60">
                  Font Family
                </label>
                <div className="relative">
                  <select
                    value={typography.fontFamily ?? ''}
                    onChange={(e) => setTypoField('fontFamily', e.target.value || undefined)}
                    className="w-full h-10 border border-white/20 rounded-squircle-sm px-3 text-sm text-text focus:outline-none focus:border-accent transition-all appearance-none pr-8 cursor-pointer"
                    style={{ background: 'rgba(255,255,255,0.07)' }}
                  >
                    <option value="">— default —</option>
                    {FONT_PRESETS.map((f) => (
                      <option key={f} value={f}>
                        {f.split(',')[0].trim()}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-dim/50 pointer-events-none" />
                </div>
              </div>

              {/* Weights */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 'bodyWeight', label: 'Body Weight' },
                  { key: 'headingWeight', label: 'Heading Weight' },
                ].map(({ key, label }) => (
                  <div key={key} className="flex flex-col gap-1.5">
                    <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-text/60">
                      {label}
                    </label>
                    <select
                      value={typography[key] ?? ''}
                      onChange={(e) => setTypoField(key, e.target.value ? Number(e.target.value) : undefined)}
                      className="h-10 border border-white/20 rounded-squircle-sm px-3 text-sm text-text focus:outline-none focus:border-accent transition-all appearance-none"
                      style={{ background: 'rgba(255,255,255,0.07)' }}
                    >
                      <option value="">— default —</option>
                      {FONT_WEIGHT_OPTIONS.map((w) => (
                        <option key={w} value={w}>{w}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {/* Letter spacing */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-text/60">
                  Heading Letter Spacing
                </label>
                <input
                  type="text"
                  value={typography.headingLetterSpacing ?? ''}
                  onChange={(e) => setTypoField('headingLetterSpacing', e.target.value || undefined)}
                  className="h-10 border border-white/20 rounded-squircle-sm px-3 text-sm font-mono text-text focus:outline-none focus:border-accent transition-all"
                  style={{ background: 'rgba(255,255,255,0.07)' }}
                  placeholder="normal  or  0.05em"
                />
              </div>

              {/* Line height */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-text/60">
                  Line Height
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={1}
                    max={2.5}
                    step={0.05}
                    value={parseFloat(typography.lineHeight) || 1.5}
                    onChange={(e) => setTypoField('lineHeight', parseFloat(e.target.value))}
                    className="flex-1 accent-accent h-1.5"
                  />
                  <span className="text-[0.75rem] font-mono text-accent w-10 text-right">
                    {(parseFloat(typography.lineHeight) || 1.5).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Corner Radius */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-text/60">
                    Corner Roundedness
                  </label>
                  <span className="text-[0.75rem] font-mono text-accent">
                    {typography.borderRadius !== undefined ? `${typography.borderRadius}px` : '16px (default)'}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={20}
                  step={2}
                  value={typography.borderRadius !== undefined ? typography.borderRadius : 16}
                  onChange={(e) => setTypoField('borderRadius', parseInt(e.target.value))}
                  className="w-full accent-accent h-1.5"
                />
              </div>

              {/* Glow Toggle */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-text/60">
                  Glow Effect
                </label>
                <div className="flex bg-white/5 border border-white/10 rounded-squircle-sm p-0.5">
                  <button
                    type="button"
                    onClick={() => setTypoField('glowEnabled', true)}
                    className={`flex-1 py-1.5 text-xs rounded-squircle-sm transition-all cursor-pointer ${
                      typography.glowEnabled !== false
                        ? 'bg-accent text-bg font-medium'
                        : 'text-text/60 hover:text-text hover:bg-white/5'
                    }`}
                  >
                    Enabled
                  </button>
                  <button
                    type="button"
                    onClick={() => setTypoField('glowEnabled', false)}
                    className={`flex-1 py-1.5 text-xs rounded-squircle-sm transition-all cursor-pointer ${
                      typography.glowEnabled === false
                        ? 'bg-accent text-bg font-medium'
                        : 'text-text/60 hover:text-text hover:bg-white/5'
                    }`}
                  >
                    Disabled
                  </button>
                </div>
              </div>
            </div>
          </Section>

          {/* Reset to base */}
          <button
            onClick={() => {
              setColors({ ...def.colors });
              setTypography({ ...(def.typography ?? {}) });
              setErrors({});
            }}
            className="flex items-center gap-2 self-start text-[0.65rem] uppercase tracking-widest text-dim/50 hover:text-dim transition-all"
          >
            <RotateCcw size={12} />
            Reset to original
          </button>
        </div>

        {/* ── Footer — Save actions ── */}
        <div className="shrink-0 border-t border-white/8 px-6 py-4 flex flex-col sm:flex-row gap-3">
          {/* Update (only for non-builtins) */}
          {!isBuiltinProp && (
            <button
              disabled={saving}
              onClick={() => handleSave(false)}
              className="flex-1 flex items-center justify-center gap-2 h-11 bg-white/8 border border-white/10 rounded-squircle-md text-sm font-light text-text hover:bg-white/12 hover:border-accent/30 transition-all disabled:opacity-40"
            >
              <Save size={16} />
              Update Theme
            </button>
          )}

          {/* Save as new */}
          <button
            disabled={saving}
            onClick={() => handleSave(true)}
            className="flex-1 flex items-center justify-center gap-2 h-11 bg-accent text-bg rounded-squircle-md text-sm font-medium hover:opacity-90 transition-all disabled:opacity-40 shadow-lg"
          >
            <Plus size={16} />
            Save as New Theme
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
