import { useState } from 'react';
import { Palette, Timer, Info, Save, Github } from 'lucide-react';

function Settings({ methods, updateBoxDuration, updateAumDuration, currentTheme, setTheme, themes }) {
  const [boxPattern, setBoxPattern] = useState(methods.box.pattern);
  const [aumBase, setAumBase] = useState(methods.aum.pattern[0]);

  const handleChange = (value) => {
    const val = parseInt(value) || 0;
    setBoxPattern([val, val, val, val]);
  };

  const handleSave = () => {
    const val = boxPattern[0];
    if (val < 4 || val > 6) {
      alert('Box breathing duration must be between 4 and 6 seconds.');
      return;
    }
    updateBoxDuration(boxPattern);
    alert('Box breathing duration updated!');
  };

  const handleAumSave = () => {
    const val = parseInt(aumBase);
    if (val < 2 || val > 6) {
      alert('Aum chanting base duration must be between 2 and 6 seconds.');
      return;
    }
    updateAumDuration(val);
    alert('Aum chanting duration updated!');
  };

  const labels = ['Inhale', 'Hold (Full)', 'Exhale', 'Hold (Empty)'];

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

        <section className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-squircle-lg p-6 md:p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-8">
            <Timer size={18} className="text-dim" />
            <h3 className="text-xs uppercase tracking-[0.2rem] text-dim font-medium">Box Breathing Durations (seconds)</h3>
          </div>
          <div className="flex items-end gap-3 md:gap-6">
            <div className="flex flex-col gap-2 flex-1 min-w-0">
              <label className="text-[0.65rem] md:text-sm font-light text-dim/80 ml-1 uppercase tracking-wider truncate">Seconds per phase (4-6s)</label>
              <input 
                type="number" 
                value={boxPattern[0]} 
                onChange={(e) => handleChange(e.target.value)}
                min="4"
                max="6"
                className="w-full bg-white/5 border border-white/10 rounded-squircle-sm px-4 text-text text-center text-xl font-light focus:outline-none focus:border-accent transition-all h-[60px]"
              />
            </div>
            <button 
              onClick={handleSave} 
              className="btn-primary tracking-wide h-[60px] flex items-center justify-center gap-2 text-sm md:text-base px-6 md:px-10 whitespace-nowrap"
            >
              <Save size={18} className="flex-shrink-0" />
              <span className="hidden sm:inline">Save Pattern</span>
              <span className="sm:hidden">Save</span>
            </button>
          </div>
        </section>

        <section className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-squircle-lg p-6 md:p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-8">
            <Timer size={18} className="text-dim" />
            <h3 className="text-xs uppercase tracking-[0.2rem] text-dim font-medium">Aum Chanting Durations (seconds)</h3>
          </div>
          <div className="flex items-end gap-3 md:gap-6">
            <div className="flex flex-col gap-2 flex-1 min-w-0">
              <label className="text-[0.65rem] md:text-sm font-light text-dim/80 ml-1 uppercase tracking-wider truncate">Base seconds (Aaa/Uuu length)</label>
              <input 
                type="number" 
                value={aumBase} 
                onChange={(e) => setAumBase(e.target.value)}
                min="2"
                max="6"
                className="w-full bg-white/5 border border-white/10 rounded-squircle-sm px-4 text-text text-center text-xl font-light focus:outline-none focus:border-accent transition-all h-[60px]"
              />
            </div>
            <button 
              onClick={handleAumSave} 
              className="btn-primary tracking-wide h-[60px] flex items-center justify-center gap-2 text-sm md:text-base px-6 md:px-10 whitespace-nowrap"
            >
              <Save size={18} className="flex-shrink-0" />
              <span className="hidden sm:inline">Save Pattern</span>
              <span className="sm:hidden">Save</span>
            </button>
          </div>
        </section>

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
