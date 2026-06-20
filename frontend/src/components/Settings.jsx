import { useState } from 'react';
import { Palette, Timer, Info, Save, Github, Trophy, RefreshCcw, Plus, Minus, ChevronDown } from 'lucide-react';
import { Card, Button, Textarea, Checkbox } from './common';

const PHASE_LABELS = ['Inhale', 'Hold', 'Exhale', 'Hold'];

function DurationPicker({ value, onChange, label }) {
  const options = Array.from({ length: 10 }, (_, i) => i + 1);

  const increment = () => onChange(Math.min(10, value + 1));
  const decrement = () => onChange(Math.max(1, value - 1));

  return (
    <div className="flex flex-col gap-2 w-full">
      {label && <label className="text-[0.65rem] font-light text-dim/80 ml-1 uppercase tracking-wider">{label}</label>}
      
      {/* Mobile: Native Select (Triggers iOS Wheel) */}
      <div className="relative md:hidden">
        <select 
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full bg-white/5 border border-white/10 rounded-squircle-sm h-[60px] px-6 text-xl font-light text-text appearance-none focus:outline-none focus:border-accent transition-all"
        >
          {options.map(num => (
            <option key={num} value={num}>{num} seconds</option>
          ))}
        </select>
        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-dim/50">
          <ChevronDown size={20} />
        </div>
      </div>

      {/* Desktop: Stepper UI */}
      <div className="hidden md:flex items-center bg-white/5 border border-white/10 rounded-squircle-sm h-[60px] overflow-hidden focus-within:border-accent transition-all">
        <button 
          onClick={decrement}
          disabled={value <= 1}
          className="h-full px-5 hover:bg-white/5 text-dim disabled:opacity-20 transition-all"
        >
          <Minus size={20} />
        </button>
        <div className="flex-1 text-center text-xl font-light border-x border-white/5 h-full flex items-center justify-center">
          {value}s
        </div>
        <button 
          onClick={increment}
          disabled={value >= 10}
          className="h-full px-5 hover:bg-white/5 text-dim disabled:opacity-20 transition-all"
        >
          <Plus size={20} />
        </button>
      </div>
    </div>
  );
}

function MethodSettings({ methodKey, method, onSave }) {
  const [localPattern, setLocalPattern] = useState(method.pattern);
  const [uniformValue, setUniformValue] = useState(() => {
    const nz = method.pattern.filter(v => v > 0);
    return nz[0] || 4;
  });
  const [prevMethod, setPrevMethod] = useState(method);

  if (method !== prevMethod) {
    setPrevMethod(method);
    setLocalPattern(method.pattern);
    const nz = method.pattern.filter(v => v > 0);
    setUniformValue(nz[0] || 4);
  }

  // Check if pattern is uniform (all non-zero phases are equal)
  const nonZeroPhases = localPattern.filter(v => v > 0);
  const isUniform = nonZeroPhases.every(v => v === nonZeroPhases[0]);

  const handleUniformChange = (val) => {
    setUniformValue(val);
    const newPattern = method.pattern.map(v => v > 0 ? val : 0);
    setLocalPattern(newPattern);
  };

  const handlePhaseChange = (idx, val) => {
    const newPattern = [...localPattern];
    newPattern[idx] = val;
    setLocalPattern(newPattern);
  };

  const handleAumChange = (val) => {
    const newPattern = [val, val, val, val + 1];
    setLocalPattern(newPattern);
  };

  const handleSave = () => {
    onSave(methodKey, localPattern);
    alert(`${method.name} settings updated!`);
  };

  const isAum = methodKey === 'aum';

  return (
    <Card as="section" variant="default" padding="md">
      <div className="flex items-center gap-3 mb-4">
        <Timer size={18} className="text-dim" />
        <h3 className="text-xs uppercase tracking-[0.2rem] text-dim font-medium">{method.name}</h3>
      </div>
      
      {method.description && (
        <p className="text-sm font-light text-dim/80 mb-8 leading-relaxed">
          {method.description}
        </p>
      )}

      <div className="flex flex-col gap-6">
        {isAum ? (
          <div className="flex flex-col sm:flex-row items-end gap-4">
            <DurationPicker 
              value={localPattern[0]} 
              onChange={handleAumChange}
              label="Inhale Duration (seconds)"
            />
            <Button 
              onClick={handleSave} 
              variant="primary"
              size="none"
              className="tracking-wide h-[60px] px-10 whitespace-nowrap w-full sm:w-auto shrink-0"
            >
              <Save size={18} />
              <span>Save</span>
            </Button>
          </div>
        ) : isUniform ? (
          <div className="flex flex-col sm:flex-row items-end gap-4">
            <DurationPicker 
              value={uniformValue} 
              onChange={handleUniformChange}
              label="Duration per phase (seconds)"
            />
            <Button 
              onClick={handleSave} 
              variant="primary"
              size="none"
              className="tracking-wide h-[60px] px-10 whitespace-nowrap w-full sm:w-auto shrink-0"
            >
              <Save size={18} />
              <span>Save</span>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {localPattern.map((val, idx) => (
                val > 0 || method.pattern[idx] > 0 ? (
                  <DurationPicker 
                    key={idx}
                    value={val}
                    onChange={(newVal) => handlePhaseChange(idx, newVal)}
                    label={(method.phases && method.phases[idx]) || PHASE_LABELS[idx]}
                  />
                ) : null
              ))}
            </div>
            <Button 
              onClick={handleSave} 
              variant="primary"
              size="none"
              className="tracking-wide h-[60px] w-full shadow-lg"
            >
              <Save size={18} />
              <span>Save Pattern</span>
            </Button>
          </div>
        )}
      </div>
      {isAum && (
        <p className="mt-4 text-[0.65rem] text-dim/50 uppercase tracking-wider">
          Chanting phases (Aaa, Uuu, Mmmm) are autocalculated.
        </p>
      )}
    </Card>
  );
}

function Settings({ methods, updateMethodPattern, currentTheme, setTheme, themes, challengeActive, resetChallenge }) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetNotes, setResetNotes] = useState('');
  const [generateCsv, setGenerateCsv] = useState(false);

  const handleResetChallenge = () => {
    resetChallenge(resetNotes, generateCsv);
    setShowResetConfirm(false);
    setResetNotes('');
  };

  const simulateExpiration = async () => {
    try {
      const res = await fetch('/api/debug/expire-challenge', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to simulate expiration');
      window.location.reload();
    } catch (err) {
      alert(err.message);
    }
  };

  const simulateCompletion = async () => {
    try {
      const res = await fetch('/api/debug/complete-challenge', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to simulate completion');
      window.location.reload();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-4xl font-extralight mb-12 tracking-tight">Settings</h1>
      
      <div className="flex flex-col gap-10">
        <Card as="section" variant="default" padding="md">
          <div className="flex items-center gap-3 mb-8">
            <Palette size={18} className="text-dim" />
            <h3 className="text-xs uppercase tracking-[0.2rem] text-dim font-medium">Theme</h3>
          </div>
          <div className="flex flex-col gap-3">
            {Object.entries(themes).map(([key, themeInfo]) => (
              <button
                key={key}
                className={`w-full p-5 rounded-squircle-md border transition-all duration-500 flex items-center justify-between group ${
                  currentTheme === key 
                  ? 'bg-accent border-white/20 text-bg shadow-xl' 
                  : 'bg-white/5 border-transparent text-dim hover:bg-white/10'
                }`}
                onClick={() => setTheme(key)}
              >
                <div className="flex flex-col items-start gap-1">
                  <span className={`text-lg font-light tracking-wide ${currentTheme === key ? 'text-bg' : 'text-text'}`}>
                    {themeInfo.name}
                  </span>
                  {currentTheme === key && (
                    <span className="text-[0.6rem] uppercase tracking-widest font-bold opacity-60">Active Theme</span>
                  )}
                </div>
                
                {/* Color Swatches */}
                <div className="flex gap-2 p-1.5 bg-black/10 rounded-full border border-white/5">
                  <div 
                    className="w-5 h-5 rounded-full border border-white/10 shadow-sm" 
                    style={{ backgroundColor: themeInfo.colors.bg }}
                    title="Background"
                  />
                  <div 
                    className="w-5 h-5 rounded-full border border-white/10 shadow-sm" 
                    style={{ backgroundColor: themeInfo.colors.accent }}
                    title="Accent"
                  />
                </div>
              </button>
            ))}
          </div>
        </Card>

        {challengeActive && (
          <Card as="section" variant="accent" padding="md" className="animate-fadeIn">
            <div className="flex items-center gap-3 mb-8">
              <Trophy size={18} className="text-accent" />
              <h3 className="text-xs uppercase tracking-[0.2rem] text-accent font-medium">Active Challenge</h3>
            </div>
            
            {!showResetConfirm ? (
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <p className="text-lg font-light text-text/80 leading-relaxed">
                    Your 30-Day / 30-Hour Meditation Challenge is currently in progress. 
                  </p>
                  <p className="text-sm font-light text-dim mt-2">
                    Resetting will deactivate the challenge tracking on your dashboard.
                  </p>
                </div>
                <Button 
                  onClick={() => setShowResetConfirm(true)}
                  variant="secondary"
                  size="none"
                  className="px-8 py-4 hover:bg-red-500/20 hover:border-red-500/30 whitespace-nowrap"
                >
                  <RefreshCcw size={18} />
                  Reset Challenge
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-6 animate-fadeIn">
                <div>
                  <h4 className="text-xl font-light mb-2">Are you sure you want to reset?</h4>
                  <p className="text-sm font-light text-dim leading-relaxed mb-4">
                    This will archive your current progress. Please share your final thoughts below (Closure notes for CSV).
                  </p>
                  <Textarea 
                    autoFocus
                    value={resetNotes}
                    onChange={(e) => setResetNotes(e.target.value)}
                    placeholder="Why are you resetting? What did you learn?"
                    className="min-h-[60px] mb-4"
                  />
                  <Checkbox 
                    checked={generateCsv}
                    onChange={(e) => setGenerateCsv(e.target.checked)}
                    label="Generate and download CSV report"
                    className="mb-2"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    onClick={handleResetChallenge}
                    variant="danger"
                    size="none"
                    className="flex-1 py-4 font-medium"
                  >
                    Confirm Reset
                  </Button>
                  <Button 
                    onClick={() => {
                      setShowResetConfirm(false);
                      setResetNotes('');
                    }}
                    variant="secondary"
                    size="none"
                    className="flex-1 py-4 font-light"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}

        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-3 px-2">
            <Timer size={18} className="text-dim" />
            <h3 className="text-xs uppercase tracking-[0.2rem] text-dim font-medium">Breathing Techniques</h3>
          </div>
          {Object.entries(methods)
            .filter(([key]) => !['478', 'completeBreath', 'chakraAscent'].includes(key))
            .map(([key, method]) => (
            <MethodSettings 
              key={key} 
              methodKey={key} 
              method={method} 
              onSave={updateMethodPattern} 
            />
          ))}
        </div>

        <Card as="section" variant="flat" padding="md">
          <div className="flex items-center gap-3 mb-4">
            <Info size={18} className="text-dim" />
            <h3 className="text-xs uppercase tracking-[0.2rem] text-dim font-medium">About</h3>
          </div>
          <p className="text-lg font-light text-text/60 leading-relaxed mb-6">
            Customise your breathing experience to suit your practice. These settings are saved locally to your session.
          </p>
          <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <p className="text-sm font-light text-dim uppercase tracking-widest">Built by Project Unlearn ⌘ • 2026</p>
            <a 
              href="https://github.com/vishwascr/breathingapp" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-dim hover:text-accent transition-colors duration-300"
            >
              <Github size={18} />
              <span className="text-sm font-light tracking-wide">View on GitHub</span>
            </a>
          </div>
        </Card>

        {/* Debug / Simulation Section */}
        <Card as="section" variant="dashed" padding="none" className="mt-8 p-6 opacity-40 hover:opacity-100 transition-opacity">
          <h3 className="text-[0.65rem] uppercase tracking-widest text-dim mb-4">Simulation (Debug Only)</h3>
          <div className="flex flex-wrap gap-4">
            <Button 
              onClick={simulateExpiration}
              variant="secondary"
              size="none"
              rounded="full"
              className="px-4 py-2 text-[0.65rem] tracking-widest"
            >
              Simulate 30 Days Passed
            </Button>
            <Button 
              onClick={simulateCompletion}
              variant="secondary"
              size="none"
              rounded="full"
              className="px-4 py-2 text-[0.65rem] tracking-widest"
            >
              Simulate 30 minute per day goal reached
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Settings;
