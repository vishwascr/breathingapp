import { useState, useEffect } from 'react';
import { Palette, Timer, Info, Save, Github, Trophy, RefreshCcw } from 'lucide-react';

const PHASE_LABELS = ['Inhale', 'Hold', 'Exhale', 'Hold'];

function MethodSettings({ methodKey, method, onSave }) {
  const [localPattern, setLocalPattern] = useState(method.pattern);

  // Check if pattern is uniform (all non-zero phases are equal)
  const nonZeroPhases = method.pattern.filter(v => v > 0);
  const isUniform = nonZeroPhases.every(v => v === nonZeroPhases[0]);

  const [uniformValue, setUniformValue] = useState(nonZeroPhases[0] || 4);

  useEffect(() => {
    setLocalPattern(method.pattern);
    const nz = method.pattern.filter(v => v > 0);
    setUniformValue(nz[0] || 4);
  }, [method]);

  const handleUniformChange = (val) => {
    const num = parseInt(val) || 0;
    setUniformValue(num);
    const newPattern = method.pattern.map(v => v > 0 ? num : 0);
    setLocalPattern(newPattern);
  };

  const handlePhaseChange = (idx, val) => {
    const num = parseInt(val) || 0;
    const newPattern = [...localPattern];
    newPattern[idx] = num;
    setLocalPattern(newPattern);
  };

  const handleSave = () => {
    onSave(methodKey, localPattern);
    alert(`${method.name} settings updated!`);
  };

  return (
    <section className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-squircle-lg p-6 md:p-8 shadow-xl">
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
        {isUniform ? (
          <div className="flex flex-col gap-2">
            <label className="text-[0.65rem] md:text-sm font-light text-dim/80 ml-1 uppercase tracking-wider">Duration per phase (seconds)</label>
            <div className="flex gap-4">
              <input 
                type="number" 
                value={uniformValue} 
                onChange={(e) => handleUniformChange(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-squircle-sm px-4 text-text text-center text-xl font-light focus:outline-none focus:border-accent transition-all h-[60px]"
              />
              <button 
                onClick={handleSave} 
                className="btn-primary tracking-wide h-[60px] flex items-center justify-center gap-2 px-6 md:px-10 whitespace-nowrap"
              >
                <Save size={18} />
                <span>Save</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {localPattern.map((val, idx) => (
                val > 0 || method.pattern[idx] > 0 ? (
                  <div key={idx} className="flex flex-col gap-2">
                    <label className="text-[0.65rem] font-light text-dim/80 ml-1 uppercase tracking-wider">
                      {(method.phases && method.phases[idx]) || PHASE_LABELS[idx]}
                    </label>
                    <input 
                      type="number" 
                      value={val} 
                      onChange={(e) => handlePhaseChange(idx, e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-squircle-sm px-4 text-text text-center text-lg font-light focus:outline-none focus:border-accent transition-all h-[50px]"
                    />
                  </div>
                ) : null
              ))}
            </div>
            <button 
              onClick={handleSave} 
              className="btn-primary tracking-wide h-[60px] flex items-center justify-center gap-2 w-full shadow-lg"
            >
              <Save size={18} />
              <span>Save Pattern</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function Settings({ methods, updateMethodPattern, currentTheme, setTheme, themes, challengeActive, resetChallenge }) {
  const handleResetChallenge = () => {
    if (window.confirm('Are you sure you want to reset your 30-day challenge? This will remove your challenge progress and return you to the standard dashboard.')) {
      resetChallenge();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-4xl font-extralight mb-12 tracking-tight">Settings</h1>
      
      <div className="flex flex-col gap-10">
        <section className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-squircle-lg p-6 md:p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-8">
            <Palette size={18} className="text-dim" />
            <h3 className="text-xs uppercase tracking-[0.2rem] text-dim font-medium">Theme</h3>
          </div>
          <div className="flex flex-wrap gap-4">
            {Object.entries(themes).map(([key, themeInfo]) => (
              <button
                key={key}
                className={`flex-1 min-w-[140px] p-4 rounded-squircle-md border transition-all duration-300 ${
                  currentTheme === key 
                  ? 'bg-accent border-white/20 text-bg shadow-lg opacity-100' 
                  : 'bg-white/5 border-transparent text-dim opacity-60 hover:opacity-100 hover:bg-white/10'
                }`}
                onClick={() => setTheme(key)}
              >
                {themeInfo.name}
              </button>
            ))}
          </div>
        </section>

        {challengeActive && (
          <section className="bg-accent/5 backdrop-blur-3xl border border-accent/20 rounded-squircle-lg p-6 md:p-8 shadow-xl animate-fadeIn">
            <div className="flex items-center gap-3 mb-8">
              <Trophy size={18} className="text-accent" />
              <h3 className="text-xs uppercase tracking-[0.2rem] text-accent font-medium">Active Challenge</h3>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <p className="text-lg font-light text-text/80 leading-relaxed">
                  Your 30-Day / 30-Hour Meditation Challenge is currently in progress. 
                </p>
                <p className="text-sm font-light text-dim mt-2">
                  Resetting will deactivate the challenge tracking on your dashboard.
                </p>
              </div>
              <button 
                onClick={handleResetChallenge}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-white/5 border border-white/10 rounded-squircle-md text-dim hover:text-white hover:bg-red-500/20 hover:border-red-500/30 transition-all duration-500 whitespace-nowrap"
              >
                <RefreshCcw size={18} />
                Reset Challenge
              </button>
            </div>
          </section>
        )}

        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-3 px-2">
            <Timer size={18} className="text-dim" />
            <h3 className="text-xs uppercase tracking-[0.2rem] text-dim font-medium">Breathing Techniques</h3>
          </div>
          {Object.entries(methods).map(([key, method]) => (
            <MethodSettings 
              key={key} 
              methodKey={key} 
              method={method} 
              onSave={updateMethodPattern} 
            />
          ))}
        </div>

        <section className="bg-white/5 border border-white/5 rounded-squircle-lg p-6 md:p-8">
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
        </section>
      </div>
    </div>
  );
}

export default Settings;
