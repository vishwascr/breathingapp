/**
 * @file ThemeManager.jsx
 * @description Settings panel for browsing, selecting, importing, exporting,
 *              editing, and saving custom themes.
 *
 * Props:
 *   registry        – ThemeRegistryEntry[]
 *   activeKey       – string
 *   onSelect        – (key: string) => void
 *   onImport        – (jsonString: string) => { ok, key?, errors? }
 *   onExport        – (key: string) => void
 *   onRemove        – (key: string) => void
 *   onSaveCustom    – (definition, existingKey | null) => { ok, key?, errors? }
 *   isBuiltin       – (key: string) => boolean
 */

import { useRef, useState } from 'react';
import {
  Palette, Upload, Download, Trash2,
  CheckCircle2, AlertCircle, Sliders,
} from 'lucide-react';
import { Card, Button } from './common';
import ThemeEditor from './ThemeEditor';

// ─────────────────────────────────────────────────────────────────────────────
// Single theme row
// ─────────────────────────────────────────────────────────────────────────────

function ThemeRow({ entry, isActive, onSelect, onEdit, onExport, onRemove, isBuiltin }) {
  const { key, definition: def, source } = entry;

  return (
    <div
      className={`w-full p-4 rounded-squircle-md border transition-all duration-500 flex items-center gap-3 group ${
        isActive
          ? 'bg-accent border-white/20 shadow-xl'
          : 'bg-white/5 border-transparent hover:bg-white/8'
      }`}
    >
      {/* ── Clickable identity area (select theme) ── */}
      <button
        className="flex-1 flex items-center gap-3 text-left min-w-0"
        onClick={() => onSelect(key)}
        aria-pressed={isActive}
        aria-label={`Select theme ${def.name}`}
      >
        {/* Swatch strip */}
        <div className="flex gap-1.5 p-1.5 bg-black/15 rounded-full border border-white/5 shrink-0">
          {['bg', 'accent', 'indicator'].map((t) => (
            <div
              key={t}
              className="w-4 h-4 rounded-full border border-white/10"
              style={{ backgroundColor: def.colors[t] }}
              title={t}
            />
          ))}
        </div>

        {/* Name + badges */}
        <div className="flex flex-col min-w-0">
          <span className={`text-sm font-light tracking-wide truncate ${isActive ? 'text-bg' : 'text-text'}`}>
            {def.name}
          </span>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {isActive && (
              <span className="text-[0.55rem] uppercase tracking-widest font-bold opacity-60 text-bg">
                Active
              </span>
            )}
            {source === 'imported' && (
              <span className={`text-[0.55rem] uppercase tracking-widest font-medium ${isActive ? 'text-bg/50' : 'text-dim/50'}`}>
                Custom
              </span>
            )}
            {def.description && (
              <span className={`text-[0.6rem] truncate max-w-[140px] ${isActive ? 'text-bg/50' : 'text-dim/50'}`}>
                {def.description}
              </span>
            )}
          </div>
        </div>
      </button>

      {/* ── Action buttons ── */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Edit / Customize */}
        <button
          onClick={() => onEdit(entry)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[0.6rem] uppercase tracking-widest font-medium transition-all ${
            isActive
              ? 'bg-bg/20 text-bg hover:bg-bg/30'
              : 'bg-white/5 text-dim hover:bg-white/10 hover:text-accent'
          }`}
          title={`Customize "${def.name}"`}
          aria-label={`Edit ${def.name}`}
        >
          <Sliders size={11} />
          <span className="hidden sm:inline">Edit</span>
        </button>

        {/* Export */}
        <button
          onClick={() => onExport(key)}
          className={`p-2 rounded-full transition-all ${
            isActive
              ? 'text-bg/60 hover:text-bg hover:bg-bg/10'
              : 'text-dim hover:text-accent hover:bg-white/10'
          }`}
          title={`Export "${def.name}" as .theme`}
          aria-label={`Export ${def.name}`}
        >
          <Download size={14} />
        </button>

        {/* Remove (custom themes only) */}
        {!isBuiltin(key) && (
          <button
            onClick={() => onRemove(key)}
            className={`p-2 rounded-full transition-all ${
              isActive
                ? 'text-bg/60 hover:text-red-300 hover:bg-red-500/20'
                : 'text-dim hover:text-red-400 hover:bg-red-500/10'
            }`}
            title={`Remove "${def.name}"`}
            aria-label={`Remove ${def.name}`}
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

function ThemeManager({
  registry,
  activeKey,
  onSelect,
  onImport,
  onExport,
  onRemove,
  onSaveCustom,
  isBuiltin,
}) {
  const fileInputRef = useRef(null);
  const [importStatus, setImportStatus] = useState(null); // { ok, message }

  // Editor modal state
  const [editorEntry, setEditorEntry] = useState(null); // entry being edited

  const openEditor = (entry) => setEditorEntry(entry);
  const closeEditor = () => setEditorEntry(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    const text = await file.text();
    const result = onImport(text);

    setImportStatus(
      result.ok
        ? { ok: true, message: `"${file.name}" imported.` }
        : { ok: false, message: result.errors?.join(' ') ?? 'Import failed.' }
    );
    setTimeout(() => setImportStatus(null), 4000);
  };

  const builtins = registry.filter((e) => e.source === 'builtin');
  const custom   = registry.filter((e) => e.source === 'imported');

  return (
    <>
      <Card as="section" variant="default" padding="md">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Palette size={18} className="text-dim" />
            <h3 className="text-xs uppercase tracking-[0.2rem] text-dim font-medium">Theme</h3>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="none"
              className="px-3 py-2 text-[0.65rem] tracking-widest gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={13} />
              Import
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".theme,application/json"
              className="hidden"
              onChange={handleFileChange}
              aria-label="Import theme file"
            />
          </div>
        </div>

        {/* ── Import feedback ── */}
        {importStatus && (
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-squircle-sm mb-5 text-xs font-light transition-all animate-fadeIn ${
              importStatus.ok
                ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                : 'bg-red-500/10 border border-red-500/20 text-red-400'
            }`}
          >
            {importStatus.ok ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
            {importStatus.message}
          </div>
        )}

        {/* ── Built-in themes ── */}
        <div className="flex flex-col gap-2">
          {builtins.map((entry) => (
            <ThemeRow
              key={entry.key}
              entry={entry}
              isActive={activeKey === entry.key}
              onSelect={onSelect}
              onEdit={openEditor}
              onExport={onExport}
              onRemove={onRemove}
              isBuiltin={isBuiltin}
            />
          ))}
        </div>

        {/* ── Custom / Imported themes ── */}
        {custom.length > 0 && (
          <>
            <div className="flex items-center gap-3 mt-6 mb-3 px-1">
              <div className="h-px flex-1 bg-white/5" />
              <span className="text-[0.55rem] uppercase tracking-[0.2rem] text-dim/40">Custom</span>
              <div className="h-px flex-1 bg-white/5" />
            </div>

            <div className="flex flex-col gap-2">
              {custom.map((entry) => (
                <ThemeRow
                  key={entry.key}
                  entry={entry}
                  isActive={activeKey === entry.key}
                  onSelect={onSelect}
                  onEdit={openEditor}
                  onExport={onExport}
                  onRemove={onRemove}
                  isBuiltin={isBuiltin}
                />
              ))}
            </div>
          </>
        )}

        {/* ── Footer hint ── */}
        <p className="mt-5 text-[0.6rem] text-dim/35 uppercase tracking-wider">
          Click <strong className="font-medium text-dim/50">Edit</strong> on any theme to customise its colors and typography.
        </p>
      </Card>

      {/* ── Theme Editor Modal ── */}
      <ThemeEditor
        isOpen={!!editorEntry}
        onClose={closeEditor}
        baseEntry={editorEntry}
        isBuiltin={editorEntry ? isBuiltin(editorEntry.key) : true}
        onSave={onSaveCustom}
      />
    </>
  );
}

export default ThemeManager;
