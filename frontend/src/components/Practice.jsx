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
  const [showInfo, setShowInfo] = useState(false);
  const [lastSession, setLastSession] = useState(null);
  const [currentNote, setCurrentNote] = useState('');
  const [guidanceVisible, setGuidanceVisible] = useState(true);
  const [completedCycles, setCompletedCycles] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const sessionTimerRef = useRef(null);
  const pathRef = useRef(null);
  const animationRef = useRef(null);
  const phaseStartTimeRef = useRef(null);
  const containerRef = useRef(null);
  const timeDisplayRef = useRef(null);

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
    if (!isActive || !selectedMethod || !methods[selectedMethod]) return;

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
        setPhaseState(prev => {
          if (nextIndex === 0) {
            setCompletedCycles(c => c + 1);
          }
          return { 
            index: nextIndex, 
            cumulativeIndex: prev.cumulativeIndex + 1 
          };
        });
        setGuidanceVisible(true);
      }, 300); // Wait for fade out
    }, (currentDur * 1000) - 300);

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
    if (isActive) {
      const methodName = methods[selectedMethod].name;
      const phaseDuration = (selectedMethod === 'box' || selectedMethod === 'aum') ? methods[selectedMethod].pattern[0] : null;
      setLastSession({ duration: sessionTime, pattern: methodName, phaseDuration, cycles: completedCycles });
      setIsActive(false);
      setShowSummary(true);
    } else {
      setSessionTime(0);
      setPhaseState({ index: 0, cumulativeIndex: 1 });
      setTimeLeft(methods[selectedMethod].pattern[0]);
      setCompletedCycles(0);
      setIsActive(true);
      setCurrentNote('');
    }
  };

  const handleSaveSession = () => {
    saveHistory(lastSession.duration, lastSession.pattern, currentNote, lastSession.phaseDuration, lastSession.cycles);
    setShowSummary(false);
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    navigate('/history');
  };

  const getCircleStyle = () => {
    if (!isActive) {
      return {
        transform: selectedMethod === 'aum' ? 'scale(2.5)' : 'scale(1)',
        transition: 'transform 0.5s ease-out'
      };
    }

    const currentPattern = methods[selectedMethod].pattern;
    const currentDur = currentPattern[phaseState.index];

    let targetScale;
    if (selectedMethod === 'aum') {
      // Aum: Continual deflation from 2.5 to 1.0 across phases 0, 1, 2
      // Then inflation from 1.0 to 2.5 during phase 3
      if (phaseState.index === 3) {
        targetScale = 2.5; 
      } else {
        const totalExhale = currentPattern[0] + currentPattern[1] + currentPattern[2];
        const elapsedExhale = currentPattern.slice(0, phaseState.index + 1).reduce((a, b) => a + b, 0);
        // Calculate target scale for the END of the current phase
        targetScale = 2.5 - (1.5 * (elapsedExhale / totalExhale));
      }
    } else {
      // Default: 0=Inhale, 1=Hold, 2=Exhale, 3=Hold
      if (phaseState.index === 0 || phaseState.index === 1) targetScale = 2.5; 
      else targetScale = 1;
    }

    return {
      transform: `scale(${targetScale})`,
      transition: `transform ${currentDur}s linear`
    };
  };

  const currentPhase = (methods[selectedMethod].phases && methods[selectedMethod].phases[phaseState.index]) || PHASES[phaseState.index];

  return (
    <div ref={containerRef} className="w-full min-h-dvh flex flex-col pt-4 pb-8 px-6 md:pt-8 md:pb-12 relative bg-[var(--color-bg)]">
      <header className="mb-8 md:mb-20 flex justify-between items-start">
        <div className="flex items-center gap-4">
          <h2 className="text-[1.5rem] md:text-[2.5rem] font-thin uppercase tracking-widest text-text text-left opacity-60">{methods[selectedMethod].name}</h2>
          <button 
            onClick={() => setShowInfo(true)}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-dim transition-all"
            title="Technique Details"
          >
            <Info size={24} />
          </button>
        </div>
        <button 
          onClick={toggleFullscreen}
          className="hidden md:flex p-3 rounded-full bg-white/5 hover:bg-white/10 text-dim transition-all items-center justify-center"
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
        </button>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center gap-4 md:gap-6 w-full">
        <div className="relative w-[300px] h-[300px] md:w-[450px] md:h-[450px] flex justify-center items-center">
          <div 
            className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent backdrop-blur-2xl border border-white/10 rounded-squircle-lg shadow-2xl transition-opacity duration-500"
            style={{ opacity: selectedMethod === 'box' ? 1 : 0 }}
          ></div>
          <div className="absolute top-[-50px] md:top-[-90px] text-[1.2rem] md:text-[2.2rem] font-thin text-text uppercase tracking-[0.8rem] md:tracking-[1.5rem] whitespace-nowrap">
            {isActive ? currentPhase : ''}
          </div>
          
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
            className="absolute w-24 h-24 md:w-40 md:h-40 breath-glow rounded-full z-[2] flex justify-center items-center text-[2.5rem] md:text-[3.5rem] font-light text-white"
            style={getCircleStyle()}
          >
            {isActive ? <span ref={timeDisplayRef}>{timeLeft}</span> : ''}
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 min-h-[120px] md:min-h-[160px]">
          <button onClick={handleStartStop} className="btn-primary text-xl font-light tracking-widest flex items-center gap-3">
            {isActive ? <Square size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
            {isActive ? 'Stop Session' : 'Begin Journey'}
          </button>
          <div className={`flex flex-col items-center gap-2 transition-all duration-500 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
            <div className="text-dim font-light tracking-wide">Session: {sessionTime}s</div>
            <div 
              className={`text-accent font-light tracking-wider text-sm md:text-base text-center max-w-xs transition-all duration-500 filter drop-shadow-[0_0_8px_var(--color-accent)] ${
                guidanceVisible ? 'opacity-80 translate-y-0' : 'opacity-0 translate-y-2'
              }`}
            >
              {methods[selectedMethod].guidance ? methods[selectedMethod].guidance[phaseState.index] : (GUIDANCE[currentPhase] || ' ')}
            </div>
          </div>
        </div>
      </div>

      {showSummary && lastSession && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 md:p-6">
          <div className="w-full max-w-lg bg-white/5 backdrop-blur-3xl border border-white/10 rounded-squircle-lg p-6 md:p-10 shadow-2xl animate-fadeIn overflow-y-auto max-h-[90vh]">
            <div className="flex flex-col items-center mb-6 md:mb-8">
              <CheckCircle2 size={40} className="text-accent mb-4" />
              <h2 className="text-2xl md:text-4xl font-thin text-center tracking-tight">Breathing Complete</h2>
            </div>
            
            <div className="flex justify-around mb-6 md:mb-8 p-4 md:p-6 bg-white/5 rounded-squircle-md border border-white/5">
              <div className="text-center">
                <p className="text-xs uppercase tracking-widest text-dim mb-1">Duration</p>
                <p className="text-2xl font-light">{lastSession.duration}s</p>
              </div>
              <div className="text-center">
                <p className="text-xs uppercase tracking-widest text-dim mb-1">Method</p>
                <p className="text-2xl font-light">{lastSession.pattern}</p>
              </div>
              {selectedMethod === 'aum' && (
                <div className="text-center">
                  <p className="text-xs uppercase tracking-widest text-dim mb-1">Total AUMs</p>
                  <p className="text-2xl font-light">{lastSession.cycles}</p>
                </div>
              )}
            </div>
            
            <div className="mb-6 md:mb-8">
              <label className="block text-sm font-light text-dim mb-3 ml-1 uppercase tracking-wider">Add a note about your session:</label>
              <textarea 
                value={currentNote}
                onChange={(e) => setCurrentNote(e.target.value)}
                placeholder="How do you feel?"
                className="w-full bg-white/5 border border-white/10 rounded-squircle-md p-5 text-text focus:outline-none focus:border-accent min-h-[100px] md:min-h-[120px] resize-none transition-all placeholder:text-dim/50"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => setShowSummary(false)} 
                className="flex-1 border border-white/10 py-3 md:py-4 rounded-squircle-md font-light hover:bg-white/5 transition-all duration-300 flex items-center justify-center gap-2 order-2 sm:order-1"
              >
                <X size={18} />
                Discard
              </button>
              <button 
                onClick={handleSaveSession}
                className="flex-1 bg-accent text-bg py-3 md:py-4 rounded-squircle-md font-medium hover:bg-indicator transition-all duration-300 flex items-center justify-center gap-2 order-1 sm:order-2 shadow-lg"
              >
                <Save size={18} />
                Save & Continue
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
