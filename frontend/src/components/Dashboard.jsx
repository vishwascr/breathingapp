import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, ChevronDown, Clock, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';

function Dashboard({ history, methods, selectedMethod, onMethodChange }) {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [activeStatIndex, setActiveStatIndex] = useState(0);

  const lastSession = history.length > 0 ? history[0] : null;
  
  // Calculate Stats
  const stats = [
    {
      label: 'Overall Focus Time',
      total: history.reduce((total, session) => total + session.duration, 0),
      color: 'text-text'
    },
    ...Object.entries(methods).map(([key, method]) => ({
      label: `${method.name} Total`,
      total: history
        .filter(session => session.pattern === method.name)
        .reduce((total, session) => total + session.duration, 0),
      color: 'text-text'
    }))
  ].filter(stat => stat.total > 0 || stat.label === 'Overall Focus Time');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBeginClick = () => {
    if (window.innerWidth < 768) {
      navigate('/methods');
    } else {
      setIsDropdownOpen(!isDropdownOpen);
    }
  };

  const nextStat = () => setActiveStatIndex((prev) => (prev + 1) % stats.length);
  const prevStat = () => setActiveStatIndex((prev) => (prev - 1 + stats.length) % stats.length);

  const greeting = getGreeting();

  return (
    <div className="w-full max-w-6xl py-4 md:py-8 relative isolate">
      <header className="mb-10 md:mb-16 relative z-10">
        <h1 className="text-4xl md:text-7xl font-thin tracking-tight mb-4">{greeting}</h1>
        <p className="text-lg md:text-xl font-light text-dim tracking-wide">Find your center and breathe.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
        <section className={`relative bg-white/5 backdrop-blur-3xl border border-white/10 rounded-squircle-lg p-8 md:p-10 shadow-2xl transition-all duration-500 ${isDropdownOpen ? 'z-30' : 'z-10'}`}>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <h2 className="text-3xl md:text-4xl font-light mb-4 tracking-tight">Ready to Begin?</h2>
              <p className="text-base md:text-lg font-light text-text/80 max-w-sm leading-relaxed">
                Start your breathing journey with your selected method and find instant clarity.
              </p>
            </div>
            
            <div className="mt-8 flex relative" ref={dropdownRef}>
              <button 
                className="btn-primary min-w-[200px] md:min-w-[240px] flex items-center justify-center gap-2"
                onClick={handleBeginClick}
              >
                <Play size={18} fill="currentColor" />
                Begin Breathing
                <ChevronDown size={18} className="hidden md:inline-block ml-1" />
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-3 w-72 bg-[#1A1A17] border border-white/10 rounded-squircle-md shadow-2xl z-50 overflow-hidden animate-fadeIn origin-top hidden md:block">
                  <div className="p-2 flex flex-col gap-1">
                    <div className="px-4 py-2 text-[0.65rem] uppercase tracking-widest text-dim border-b border-white/5 mb-1 font-medium">Select Technique</div>
                    {Object.entries(methods).map(([key, method]) => (
                      <button
                        key={key}
                        className="w-full text-left p-4 rounded-squircle-md transition-all duration-200 text-sm text-text hover:bg-white/5"
                        onClick={() => {
                          onMethodChange(key);
                          setIsDropdownOpen(false);
                          navigate('/practice');
                        }}
                      >
                        {method.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {lastSession ? (
          <section className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-squircle-lg p-8 md:p-10 shadow-xl flex flex-col justify-between hover:bg-white/10 transition-all duration-300">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Clock size={16} className="text-dim" />
                <h3 className="text-xs uppercase tracking-[0.2rem] text-dim font-medium">Last Session</h3>
              </div>
              <div className="flex gap-12 mb-8">
                <div>
                  <span className="block text-[0.65rem] uppercase tracking-widest text-dim mb-1">Method</span>
                  <span className="text-xl md:text-2xl font-light">{lastSession.pattern}</span>
                </div>
                <div>
                  <span className="block text-[0.65rem] uppercase tracking-widest text-dim mb-1">Duration</span>
                  <span className="text-xl md:text-2xl font-light">{lastSession.duration}s</span>
                </div>
              </div>
              {lastSession.notes && (
                <div className="pt-6 border-t border-white/5">
                  <span className="block text-[0.65rem] uppercase tracking-widest text-dim mb-2">Note</span>
                  <p className="text-text/80 font-light italic leading-relaxed line-clamp-3">"{lastSession.notes}"</p>
                </div>
              )}
            </div>
            {!lastSession.notes && (
              <div className="text-dim/30 font-light italic text-sm">No notes from your last session.</div>
            )}
          </section>
        ) : (
          <section className="bg-white/5 backdrop-blur-3xl border border-white/10 border-dashed rounded-squircle-lg p-8 md:p-10 flex flex-col items-center justify-center text-center opacity-60">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <Clock size={20} className="text-dim" />
            </div>
            <h3 className="text-sm uppercase tracking-widest text-dim font-medium mb-2">No History</h3>
            <p className="text-sm font-light text-text/60 max-w-[200px]">Complete your first session to see your stats here.</p>
          </section>
        )}

        <section className="relative bg-white/5 backdrop-blur-3xl border border-white/10 rounded-squircle-lg p-8 md:p-10 shadow-xl flex flex-col justify-between hover:bg-white/10 transition-all duration-300 min-h-[220px]">
          <button 
            onClick={prevStat}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/5 hover:bg-white/10 text-dim transition-all z-20"
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            onClick={nextStat}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/5 hover:bg-white/10 text-dim transition-all z-20"
          >
            <ChevronRight size={24} />
          </button>

          <div className="px-8 flex flex-col items-center text-center h-full justify-center">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-xs uppercase tracking-[0.2rem] text-dim font-medium">{stats[activeStatIndex].label}</h3>
            </div>
            <div className="flex items-baseline justify-center gap-3">
              <span className={`text-5xl md:text-6xl font-thin tracking-tighter ${stats[activeStatIndex].color}`}>
                {stats[activeStatIndex].total}
              </span>
              <span className="text-lg md:text-xl font-light text-dim uppercase tracking-widest">seconds</span>
            </div>
            
            {/* Pagination Dots */}
            <div className="flex gap-2 mt-8">
              {stats.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveStatIndex(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    activeStatIndex === i ? 'bg-accent w-4' : 'bg-white/20'
                  }`}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white/5 backdrop-blur-2xl border border-white/5 rounded-squircle-lg p-8 md:p-10 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={16} className="text-dim" />
            <h3 className="text-sm uppercase tracking-widest text-dim font-medium">Why Breathe?</h3>
          </div>
          <p className="text-base md:text-lg font-light text-text/70 leading-relaxed">
            Controlled breathing helps regulate your nervous system, reduces cortisol levels, and improves focus. Just 5 minutes can transform your day and restore your inner balance.
          </p>
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
