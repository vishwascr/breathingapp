import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play, Square, Save, X, CheckCircle2, Maximize, Minimize, Info } from 'lucide-react'

const PHASES = ['Inhale', 'Hold', 'Exhale', 'Hold'];

const GUIDANCE = {
  'Inhale': 'Breathe in through your nose deeply.',
  'Hold': 'Maintain the breath gently.',
  'Exhale': 'Exhale slowly through your mouth.'
};

function Practice({ selectedMethod, methods, saveHistory, setIsSessionActive }) {
  const navigate = useNavigate();
  
  // Use a safer way to get initial time left
  const initialTime = (selectedMethod && methods[selectedMethod]) ? methods[selectedMethod].pattern[0] : 4;

  const [isActive, setIsActive] = useState(false);
  const [phaseState, setPhaseState] = useState({ index: 0, cumulativeIndex: 0 });
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [sessionTime, setSessionTime] = useState(0);
  const [headPosition, setHeadPosition] = useState({ x: 225, y: 2 });
  const [showSummary, setShowSummary] = useState(false);
  const [showNotesInput, setShowNotesInput] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [lastSession, setLastSession] = useState(null);
  const [currentNote, setCurrentNote] = useState('');
  const [sessionRating, setSessionRating] = useState(0);
  const [guidanceVisible, setGuidanceVisible] = useState(true);
  const [completedCycles, setCompletedCycles] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [isCooldown, setIsCooldown] = useState(false);

  const sessionTimerRef = useRef(null);
  const pathRef = useRef(null);
  const animationRef = useRef(null);
  const phaseStartTimeRef = useRef(null);
  const cooldownStartTimeRef = useRef(null);
  const containerRef = useRef(null);
  const timeDisplayRef = useRef(null);

  // Countdown timer logic
  useEffect(() => {
    if (countdown === null) return;
    
    if (countdown > 1) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 1) {
      const timer = setTimeout(() => {
        // Start the actual session
        setSessionTime(0);
        setPhaseState({ index: 0, cumulativeIndex: 1 });
        setTimeLeft(methods[selectedMethod].pattern[0]);
        setCompletedCycles(0);
        setIsActive(true);
        setCountdown(null);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, selectedMethod, methods]);

  // Sync with global session state
  useEffect(() => {
    setIsSessionActive(isActive);
    return () => setIsSessionActive(false);
  }, [isActive, setIsSessionActive]);

  // Redirect logic
  useEffect(() => {
    if (!selectedMethod) {
      navigate('/');
    }
  }, [selectedMethod, navigate]);

  // Session timer
  useEffect(() => {
    if (isActive) {
      sessionTimerRef.current = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(sessionTimerRef.current);
    }
    return () => clearInterval(sessionTimerRef.current);
  }, [isActive]);

  useEffect(() => {
    if (!isActive || !isCooldown) return;

    let startTime = Date.now();
    let intervalId = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      if (timeDisplayRef.current) {
        timeDisplayRef.current.innerText = elapsed.toString();
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isActive, isCooldown]);

  // Animation for the head position
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const focusAreaRef = useRef(null);

  // Auto-scroll to hide header on mobile when journey begins
  useEffect(() => {
    if (isActive && window.innerWidth < 768 && focusAreaRef.current) {
      focusAreaRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isActive]);

  useEffect(() => {
    if (!isActive || selectedMethod !== 'box' || !pathRef.current) return;

    let start = null;
    const duration = methods[selectedMethod].pattern[phaseState.index] * 1000;
    const startLen = (phaseState.cumulativeIndex - 1) * 25;

    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      
      const currentLen = (startLen + (progress * 25)) % 100;
      
      const totalPixelLength = pathRef.current.getTotalLength();
      const pixelPoint = pathRef.current.getPointAtLength((currentLen / 100) * totalPixelLength);
      
      setHeadPosition({ x: pixelPoint.x, y: pixelPoint.y });

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(step);
      }
    };

    animationRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationRef.current);
  }, [isActive, phaseState, selectedMethod, methods]);

  // Core breathing logic
  useEffect(() => {
    if (!isActive || isCooldown || !selectedMethod || !methods[selectedMethod]) return;

    const currentPattern = methods[selectedMethod].pattern;
    const currentDur = currentPattern[phaseState.index];
    const startTime = Date.now();
    phaseStartTimeRef.current = startTime;
    
    // Use requestAnimationFrame to update the countdown directly in the DOM, avoiding React state re-renders
    let countdownAnimationFrameId;
    const updateCountdown = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      const remaining = Math.max(1, Math.ceil(currentDur - elapsed));
      if (timeDisplayRef.current && timeDisplayRef.current.innerText !== remaining.toString()) {
        timeDisplayRef.current.innerText = remaining;
      }
      countdownAnimationFrameId = requestAnimationFrame(updateCountdown);
    };
    updateCountdown();

    let transitionTimeoutId;
    const phaseTimeout = setTimeout(() => {
      let nextIndex = (phaseState.index + 1) % 4;
      while (currentPattern[nextIndex] === 0 && nextIndex !== phaseState.index) {
        nextIndex = (nextIndex + 1) % 4;
      }

      // Start fade out slightly before transition
      setGuidanceVisible(false);

      transitionTimeoutId = setTimeout(() => {
        setTimeLeft(currentPattern[nextIndex]);

        if (nextIndex === 0) {
          setCompletedCycles(c => c + 1);
        }

        setPhaseState(prev => {
          return { 
            index: nextIndex, 
            cumulativeIndex: prev.cumulativeIndex + 1 
          };
        });
        setGuidanceVisible(true);
      }, 300); // Wait for fade out
    }, Math.max(0, (currentDur * 1000) - 300));

    return () => {
      cancelAnimationFrame(countdownAnimationFrameId);
      clearTimeout(phaseTimeout);
      clearTimeout(transitionTimeoutId);
    };
  }, [isActive, phaseState.index, selectedMethod, methods]);

  if (!selectedMethod || !methods[selectedMethod]) {
    return (
      <div className="w-full h-dvh flex items-center justify-center">
        <div className="text-dim font-light tracking-widest animate-pulse uppercase text-sm">Redirecting...</div>
      </div>
    );
  }

  const handleStartStop = () => {
    if (isActive || countdown !== null) {
      const methodName = methods[selectedMethod].name;
      const pattern = methods[selectedMethod].pattern;
      
      const inhale = pattern[0];
      const hold = pattern[1];
      const exhale = selectedMethod === 'aum' ? (pattern[1] + pattern[2] + pattern[3]) : pattern[2];

      let finalCooldownSeconds = 0;
      if (isCooldown && cooldownStartTimeRef.current) {
        finalCooldownSeconds = Number(Math.floor((Date.now() - cooldownStartTimeRef.current) / 1000));
      } else if (!isCooldown && cooldownStartTimeRef.current) {
        // This case handles if cooldown was active but toggled off before stopping
        finalCooldownSeconds = Number(Math.floor((Date.now() - cooldownStartTimeRef.current) / 1000));
      }

      setLastSession({ 
        duration: Number(sessionTime), 
        pattern: methodName, 
        cycles: Number(completedCycles),
        cooldownSeconds: finalCooldownSeconds,
        inhale,
        hold,
        exhale
      });
      setIsActive(false);
      setCountdown(null);
      setIsCooldown(false);
      cooldownStartTimeRef.current = null;
      if (isActive) {
        setShowSummary(true);
      }
    } else {
      setCountdown(3);
      setCurrentNote('');
      setShowNotesInput(false);
      setIsCooldown(false);
      setSessionRating(0);
    }
  };

  const handleSaveSession = () => {
    if (sessionRating === 0) return;
    saveHistory(lastSession.duration, lastSession.pattern, currentNote, lastSession.cycles, lastSession.cooldownSeconds, sessionRating, lastSession.inhale, lastSession.hold, lastSession.exhale);
    setShowSummary(false);
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    navigate('/history');
  };

  const getCircleStyle = () => {
    // 1. Determine State Flags
    const isPreparing = countdown !== null || !isActive;
    
    // 2. Base Properties
    let backgroundColor = isPreparing ? '#FFFFFF' : 'var(--color-bg)';
    let color = isPreparing ? '#000000' : '#FFFFFF';
    let targetScale = 1;
    let transitionDuration = 0.5; // Default transition seconds
    let timingFunction = 'ease-out';

    // 3. Scale & Timing Logic
    if (isCooldown) {
      targetScale = 1;
      backgroundColor = 'var(--color-cooldown)';
      color = 'var(--color-bg)';
      transitionDuration = 1.5;
      timingFunction = 'ease-in-out';
    } else if (countdown !== null) {
      targetScale = 1;
      transitionDuration = 0.3;
    } else if (!isActive) {
      targetScale = 1;
    } else {
      // Active Session
      const currentPattern = methods[selectedMethod].pattern;
      transitionDuration = currentPattern[phaseState.index];
      timingFunction = 'linear';

      if (selectedMethod === 'aum') {
        if (phaseState.index === 0) {
          targetScale = 2.5; 
        } else {
          // Phases 1, 2, 3 are exhalation (A, U, M)
          const totalExhale = currentPattern[1] + currentPattern[2] + currentPattern[3];
          const elapsedExhale = currentPattern.slice(1, phaseState.index + 1).reduce((a, b) => a + b, 0);
          targetScale = 2.5 - (1.5 * (elapsedExhale / totalExhale));
        }
      } else {
        targetScale = (phaseState.index === 0 || phaseState.index === 1) ? 2.5 : 1;
      }
    }

    return {
      backgroundColor,
      color,
      transform: `scale(${targetScale})`,
      transition: `transform ${transitionDuration}s ${timingFunction}, background-color ${transitionDuration}s ease, color ${transitionDuration}s ease, box-shadow ${transitionDuration}s ease`
    };
  };

  const currentPhase = isCooldown ? 'Cooldown' : ((methods[selectedMethod].phases && methods[selectedMethod].phases[phaseState.index]) || PHASES[phaseState.index]);

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col pt-4 pb-24 px-6 md:pt-12 md:pb-12 relative bg-[var(--color-bg)]">
      <header className="w-full max-w-5xl mx-auto mb-4 md:mb-6 flex justify-between items-start shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="text-[1.1rem] uppercase tracking-widest opacity-60 md:text-4xl md:font-extralight md:tracking-tight md:opacity-100 md:normal-case text-text text-left">
            {methods[selectedMethod].name}
          </h2>
          <button 
            onClick={() => setShowInfo(true)}
            className="p-1.5 md:p-2 rounded-full bg-white/5 hover:bg-white/10 text-dim transition-all shrink-0"
            title="Technique Details"
          >
            <Info size={18} className="md:size-[24px]" />
          </button>
        </div>
        <button 
          onClick={toggleFullscreen}
          className="hidden md:flex p-3 rounded-full bg-white/5 hover:bg-white/10 text-dim transition-all items-center justify-center shrink-0"
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
        </button>
      </header>

      <div ref={focusAreaRef} className="flex-1 flex flex-col items-center justify-center gap-4 md:gap-14 w-full max-w-5xl mx-auto min-h-0 pt-12 md:pt-0">

        <div className="relative w-[250px] h-[250px] md:w-[450px] md:h-[450px] flex justify-center items-center shrink-0">
          <div 
            className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent backdrop-blur-2xl border border-white/10 rounded-squircle-lg shadow-2xl transition-opacity duration-500"
            style={{ opacity: selectedMethod === 'box' ? 1 : 0 }}
          ></div>
          
          {selectedMethod === 'box' && (
            <svg className="absolute inset-0 w-full h-full z-[5] pointer-events-none overflow-visible" viewBox="0 0 450 450">
              <defs>
                <filter id="head-glow-filter" x="-200%" y="-200%" width="500%" height="500%">
                  <feGaussianBlur stdDeviation="5" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <rect 
                ref={pathRef}
                x="0" y="0" width="450" height="450" rx="46"
                className="fill-none stroke-none"
              />

              {isActive && (
                <>
                  {[...Array(phaseState.cumulativeIndex + 1)].map((_, i) => {
                    const cum = i;
                    if (cum === 0 || cum < phaseState.cumulativeIndex - 1) return null;

                    const isCurrent = cum === phaseState.cumulativeIndex;
                    const isPrev = cum === phaseState.cumulativeIndex - 1;
                    const currentDur = (selectedMethod && methods[selectedMethod]) ? methods[selectedMethod].pattern[phaseState.index] : 4;

                    let style = { opacity: 0 };
                    let className = "fill-none stroke-[6px] stroke-linecap-round stroke-text";

                    if (isCurrent) {
                      style = {
                        strokeDashoffset: -(cum - 1) * 25,
                        animationDuration: `${currentDur}s`,
                        opacity: 1
                      };
                      className += " growing-stroke";
                    } else if (isPrev) {
                      style = {
                        strokeDashoffset: -cum * 25,
                        transition: `stroke-dashoffset ${currentDur}s linear`,
                        animationDuration: `${currentDur}s`,
                        opacity: 1
                      };
                      className += " retracting-stroke";
                    }

                    return (
                      <rect 
                        key={`stroke-${cum}`}
                        x="0" y="0" width="450" height="450" rx="46" pathLength="100"
                        className={className}
                        style={style}
                      />
                    );
                  })}

                  <circle 
                    cx={headPosition.x} 
                    cy={headPosition.y} 
                    r="4" 
                    className="fill-accent"
                    filter="url(#head-glow-filter)"
                    style={{ transition: 'none' }}
                  />
                </>
              )}
            </svg>
          )}

          <div 
            onClick={() => {
              if (isActive && !isCooldown) {
                setIsCooldown(true);
                cooldownStartTimeRef.current = Date.now();
              } else if (isCooldown) {
                handleStartStop();
              }
            }}
            className={`absolute w-20 h-20 md:w-40 md:h-40 breath-glow rounded-full z-[2] flex justify-center items-center text-[2.5rem] md:text-[3.5rem] font-light cursor-pointer transition-all duration-1000 ${isCooldown ? 'cooldown-active' : ''}`}
            style={getCircleStyle()}
          >
            {countdown !== null ? countdown : (isActive ? <span ref={timeDisplayRef}>{timeLeft}</span> : '')}
          </div>
        </div>

        <div className="flex flex-col items-center w-full max-w-xs mx-auto gap-4 md:gap-10 mb-2 md:mb-0">
          {/* Unified Vertical Stack - Space Reserved */}
          <div className={`flex flex-col items-center text-center gap-2 transition-all duration-500 min-h-[120px] md:min-h-[160px] justify-center ${isActive ? 'opacity-100' : 'opacity-0 invisible'}`}>
            {/* 1. Phase Text */}
            <div className="text-[1.2rem] md:text-[1.8rem] font-thin text-text uppercase tracking-[0.6rem] md:tracking-[1rem] whitespace-nowrap mb-1">
              {currentPhase}
            </div>
            
            {/* 2. Detailed Guidance */}
            <div 
              className={`text-accent font-light tracking-wider text-sm md:text-base filter drop-shadow-[0_0_8px_var(--color-accent)] transition-opacity duration-500 ${
                guidanceVisible ? 'opacity-80' : 'opacity-0'
              }`}
            >
              {isCooldown ? 'Hold your breath as long as comfortable.' : (methods[selectedMethod].guidance ? methods[selectedMethod].guidance[phaseState.index] : (GUIDANCE[currentPhase] || ' '))}
            </div>

            {/* 3. Cycles/Chants Stat */}
            <div className="text-dim font-light tracking-wide text-xs md:text-sm mt-1">
              {selectedMethod === 'aum' ? 'Chants' : 'Cycles'}: {completedCycles}
            </div>
          </div>

          {/* 4. Action Button */}
          <button onClick={handleStartStop} className="btn-primary text-lg md:text-xl font-light tracking-widest flex items-center gap-3 shrink-0">
            {isActive || countdown !== null ? <Square size={18} md:size={20} fill="currentColor" /> : <Play size={18} md:size={20} fill="currentColor" />}
            {isActive || countdown !== null ? 'Stop Session' : 'Begin Journey'}
          </button>
        </div>
      </div>

      {/* Summary Modal */}
      {showSummary && lastSession && (
        <div className="absolute inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 md:p-6">
          <div className="w-full max-w-sm bg-white/5 backdrop-blur-3xl border border-white/10 rounded-squircle-lg p-8 md:p-10 shadow-2xl animate-fadeIn overflow-y-auto max-h-[90vh]">
            <div className="flex flex-col items-center mb-6 md:mb-8 text-center">
              <CheckCircle2 size={32} className="text-accent mb-3" />
              <h2 className="text-xl md:text-3xl font-thin tracking-tight">Session Complete</h2>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mb-8 text-sm md:text-base font-light text-text/80 tracking-wide text-center">
              <span>{lastSession.duration}s</span>
              <span className="opacity-20 text-[0.6rem]">•</span>
              <span>{lastSession.pattern}</span>
              <span className="opacity-20 text-[0.6rem]">•</span>
              <span>{lastSession.inhale}-{lastSession.hold}-{lastSession.exhale}s</span>
              <span className="opacity-20 text-[0.6rem]">•</span>
              <span>{lastSession.cycles} {selectedMethod === 'aum' ? 'Chants' : 'Cycles'}</span>
            </div>
            
            <div className="mb-6 flex flex-col items-center gap-3">
              <span className="text-[0.65rem] md:text-xs uppercase tracking-[0.2rem] text-dim font-medium">How was your session?</span>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button 
                    key={num}
                    onClick={() => setSessionRating(num)}
                    className={`transition-all duration-300 ${sessionRating >= num ? 'text-accent scale-110' : 'text-dim/40 hover:text-dim hover:scale-105'}`}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill={sessionRating >= num ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8 flex flex-col items-center">
              {!showNotesInput ? (
                <button 
                  onClick={() => setShowNotesInput(true)}
                  className="text-[0.65rem] md:text-xs uppercase tracking-[0.2rem] text-accent/60 hover:text-accent hover:bg-white/5 border border-white/10 rounded-full px-6 py-2.5 transition-all"
                >
                  + Add a note
                </button>
              ) : (
                <div className="w-full animate-fadeIn">
                  <textarea 
                    autoFocus
                    value={currentNote}
                    onChange={(e) => setCurrentNote(e.target.value)}
                    placeholder="How do you feel?"
                    className="w-full bg-white/5 border border-white/10 rounded-squircle-md p-4 text-text focus:outline-none focus:border-accent min-h-[80px] md:min-h-[100px] resize-none transition-all placeholder:text-dim/30 text-sm md:text-base"
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={handleSaveSession}
                disabled={sessionRating === 0}
                className="w-full bg-accent text-bg py-4 rounded-squircle-md font-medium hover:bg-indicator transition-all duration-300 flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={18} />
                Save Journey
              </button>
              <button 
                onClick={() => setShowSummary(false)} 
                className="w-full py-3 rounded-squircle-md text-xs uppercase tracking-widest text-dim hover:text-white transition-all duration-300"
              >
                Discard Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Technique Info Modal */}
      {showInfo && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 md:p-6">
          <div className="w-full max-w-2xl bg-white/5 backdrop-blur-3xl border border-white/10 rounded-squircle-lg p-6 md:p-10 shadow-2xl animate-fadeIn overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl md:text-3xl font-thin tracking-tight">{methods[selectedMethod].name}</h2>
              <button onClick={() => setShowInfo(false)} className="p-2 hover:bg-white/10 rounded-full transition-all">
                <X size={24} className="text-dim" />
              </button>
            </div>

            <div className="space-y-8">
              <div>
                <h3 className="text-xs uppercase tracking-[0.2rem] text-accent font-medium mb-3">About</h3>
                <p className="text-lg font-light text-text/80 leading-relaxed">
                  {methods[selectedMethod].description}
                </p>
              </div>

              {methods[selectedMethod].steps && (
                <div>
                  <h3 className="text-xs uppercase tracking-[0.2rem] text-accent font-medium mb-4">Steps</h3>
                  <div className="space-y-4">
                    {methods[selectedMethod].steps.map((step, idx) => (
                      <div key={idx} className="flex gap-4 items-start">
                        <span className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs flex-shrink-0 mt-1">
                          {idx + 1}
                        </span>
                        <p className="text-text/70 font-light leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={() => setShowInfo(false)}
              className="mt-10 w-full py-4 bg-white/5 border border-white/10 rounded-squircle-md font-light hover:bg-white/10 transition-all text-dim uppercase tracking-widest text-xs"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Practice;
