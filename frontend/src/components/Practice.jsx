import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play, Square, Save, X, Info, CheckCircle2 } from 'lucide-react'

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
  const [phaseState, setPhaseState] = useState({ index: 0, resetting: false });
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [sessionTime, setSessionTime] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [lastSession, setLastSession] = useState(null);
  const [currentNote, setCurrentNote] = useState('');
  const [guidanceVisible, setGuidanceVisible] = useState(true);

  const sessionTimerRef = useRef(null);
  const pathLength = 1716;
  const step = pathLength / 4;

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

  // Core breathing logic
  useEffect(() => {
    if (!isActive || !selectedMethod || !methods[selectedMethod]) return;

    if (phaseState.resetting) {
      const resetTimeout = setTimeout(() => {
        const currentPattern = methods[selectedMethod].pattern;
        setTimeLeft(currentPattern[0]);
        setPhaseState({ index: 0, resetting: false });
      }, 50);
      return () => clearTimeout(resetTimeout);
    }

    const currentPattern = methods[selectedMethod].pattern;
    const currentDur = currentPattern[phaseState.index];
    
    const textInterval = setInterval(() => {
      setTimeLeft(prev => Math.max(1, prev - 1));
    }, 1000);

    const phaseTimeout = setTimeout(() => {
      let nextIndex = (phaseState.index + 1) % 4;
      while (currentPattern[nextIndex] === 0 && nextIndex !== phaseState.index) {
        nextIndex = (nextIndex + 1) % 4;
      }

      // Start fade out slightly before transition
      setGuidanceVisible(false);

      setTimeout(() => {
        if (nextIndex <= phaseState.index || currentPattern[nextIndex] === 0) {
          setPhaseState({ index: phaseState.index, resetting: true });
        } else {
          setTimeLeft(currentPattern[nextIndex]);
          setPhaseState({ index: nextIndex, resetting: false });
        }
        setGuidanceVisible(true);
      }, 300); // Wait for fade out
    }, (currentDur * 1000) - 300);

    return () => {
      clearInterval(textInterval);
      clearTimeout(phaseTimeout);
    };
  }, [isActive, phaseState, selectedMethod, methods]);

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
      const phaseDuration = selectedMethod === 'box' ? methods.box.pattern[0] : null;
      setLastSession({ duration: sessionTime, pattern: methodName, phaseDuration });
      setIsActive(false);
      setShowSummary(true);
    } else {
      setSessionTime(0);
      setPhaseState({ index: 0, resetting: false });
      setTimeLeft(methods[selectedMethod].pattern[0]);
      setIsActive(true);
      setCurrentNote('');
    }
  };

  const handleSaveSession = () => {
    saveHistory(lastSession.duration, lastSession.pattern, currentNote, lastSession.phaseDuration);
    setShowSummary(false);
  };

  const getStrokeStyle = () => {
    if (!isActive || selectedMethod !== 'box') {
      return {
        strokeDasharray: `0 ${pathLength}`,
        strokeDashoffset: 0,
        opacity: 0,
        transition: 'none'
      };
    }

    if (phaseState.resetting) {
      return {
        strokeDasharray: `0 ${pathLength}`,
        strokeDashoffset: 0,
        opacity: 0,
        transition: 'none'
      };
    }

    const currentPattern = methods[selectedMethod].pattern;
    const currentDur = currentPattern[phaseState.index];
    
    const offsets = [
      0,               // Phase 0: Grows in place
      -step,           // Phase 1: Travels
      -2 * step,       // Phase 2: Travels
      -3 * step        // Phase 3: Travels
    ];
    
    return {
      strokeDasharray: `${phaseState.index === 0 ? step : step} ${pathLength}`,
      strokeDashoffset: offsets[phaseState.index],
      opacity: 1,
      transition: `stroke-dashoffset ${currentDur}s linear, stroke-dasharray ${currentDur}s linear`
    };
  };

  const getCircleStyle = () => {
    if (!isActive) {
      return {
        transform: 'scale(1)',
        transition: 'transform 0.5s ease-out'
      };
    }

    if (phaseState.resetting) {
       return {
         transform: 'scale(1)',
         transition: 'none'
       };
    }

    const currentPattern = methods[selectedMethod].pattern;
    const currentDur = currentPattern[phaseState.index];

    let targetScale = 1;
    if (phaseState.index === 0) targetScale = 2.5; 
    else if (phaseState.index === 1) targetScale = 2.5; 
    else if (phaseState.index === 2) targetScale = 1; 
    else if (phaseState.index === 3) targetScale = 1; 

    return {
      transform: `scale(${targetScale})`,
      transition: `transform ${currentDur}s linear`
    };
  };

  const currentPhase = PHASES[phaseState.index];

  return (
    <div className="w-full min-h-dvh flex flex-col py-8 px-6 md:py-12 relative">
      <header className="mb-2 md:mb-4">
        <h2 className="text-[1.8rem] md:text-[3rem] font-thin tracking-tight text-text text-left">{methods[selectedMethod].name}</h2>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center gap-4 md:gap-6 w-full">
        <div className="relative w-[300px] h-[300px] md:w-[450px] md:h-[450px] flex justify-center items-center">
          <div 
            className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent backdrop-blur-2xl border border-white/10 rounded-squircle-lg shadow-2xl transition-opacity duration-500"
            style={{ opacity: selectedMethod === 'box' ? 1 : 0 }}
          ></div>
          <div className="absolute top-[-50px] md:top-[-80px] text-[1.2rem] md:text-[2.2rem] font-thin text-text uppercase tracking-[0.6rem] md:tracking-[1.2rem] whitespace-nowrap">
            {isActive ? currentPhase : ''}
          </div>
          
          {selectedMethod === 'box' && (
            <svg className="absolute inset-[-4px] md:inset-[-6px] w-[calc(100%+8px)] md:w-[calc(100%+12px)] h-[calc(100%+8px)] md:h-[calc(100%+12px)] z-[5] pointer-events-none overflow-visible" viewBox="0 0 450 450">
              <rect 
                x="2" y="2" width="446" height="446" rx="40"
                className="fill-none stroke-text stroke-[5px] stroke-linecap-round filter drop-shadow-[0_0_15px_var(--indicator-color)]"
                style={getStrokeStyle()}
              />
            </svg>
          )}

          <div 
            className="absolute w-24 h-24 md:w-40 md:h-40 breath-glow rounded-full z-[2] flex justify-center items-center text-[2.5rem] md:text-[3.5rem] font-light text-white"
            style={getCircleStyle()}
          >
            {isActive ? timeLeft : ''}
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
              {GUIDANCE[currentPhase] || ' '}
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
    </div>
  )
}

export default Practice;
