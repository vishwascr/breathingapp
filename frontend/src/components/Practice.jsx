import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play, Square, Save, X, Info, CheckCircle2 } from 'lucide-react'

const PHASES = ['Inhale', 'Hold', 'Exhale', 'Hold'];
const INSTRUCTIONS = {
  'Inhale': 'Breathe in through your nose deeply.',
  'Hold': 'Maintain the breath gently.',
  'Exhale': 'Release the breath slowly through your mouth.',
};

function Practice({ selectedMethod, methods, saveHistory, setIsSessionActive }) {
  const navigate = useNavigate();
  
  // Use a safer way to get initial time left
  const initialTime = (selectedMethod && methods[selectedMethod]) ? methods[selectedMethod].pattern[0] : 4;

  const [isActive, setIsActive] = useState(false);
  const [phaseState, setPhaseState] = useState({ index: 0, resetting: false });
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [sessionTime, setSessionTime] = useState(0);
  const [showInstruction, setShowInstruction] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [lastSession, setLastSession] = useState(null);
  const [currentNote, setCurrentNote] = useState('');

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

  // Instruction visibility timer
  useEffect(() => {
    if (isActive && showInstruction) {
      const timer = setTimeout(() => setShowInstruction(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showInstruction, isActive]);

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

      if (nextIndex <= phaseState.index || currentPattern[nextIndex] === 0) {
        setPhaseState({ index: phaseState.index, resetting: true });
      } else {
        setTimeLeft(currentPattern[nextIndex]);
        setPhaseState({ index: nextIndex, resetting: false });
        setShowInstruction(true);
      }
    }, currentDur * 1000);

    return () => {
      clearInterval(textInterval);
      clearTimeout(phaseTimeout);
    };
  }, [isActive, phaseState, selectedMethod, methods]);

  if (!selectedMethod || !methods[selectedMethod]) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-dim font-light tracking-widest animate-pulse uppercase text-sm">Redirecting...</div>
      </div>
    );
  }

  const handleStartStop = () => {
    if (isActive) {
      const methodName = methods[selectedMethod].name;
      setLastSession({ duration: sessionTime, pattern: methodName });
      setIsActive(false);
      setShowSummary(true);
    } else {
      setSessionTime(0);
      setPhaseState({ index: 0, resetting: false });
      setTimeLeft(methods[selectedMethod].pattern[0]);
      setIsActive(true);
      setShowInstruction(true);
      setCurrentNote('');
    }
  };

  const handleSaveSession = () => {
    saveHistory(lastSession.duration, lastSession.pattern, currentNote);
    setShowSummary(false);
  };

  const getStrokeStyle = () => {
    if (!isActive || selectedMethod !== 'box') {
      return {
        strokeDasharray: pathLength,
        strokeDashoffset: pathLength,
        opacity: 0,
        transition: 'none'
      };
    }

    if (phaseState.resetting) {
      return {
        strokeDasharray: pathLength,
        strokeDashoffset: pathLength,
        opacity: 0,
        transition: 'none'
      };
    }

    const currentPattern = methods[selectedMethod].pattern;
    const currentDur = currentPattern[phaseState.index];
    
    const targets = [
      pathLength - step,
      pathLength - (step * 2),
      pathLength - (step * 3),
      0
    ];
    
    return {
      strokeDasharray: pathLength,
      strokeDashoffset: targets[phaseState.index],
      opacity: (phaseState.index === 3) ? 0 : 1,
      transition: `stroke-dashoffset ${currentDur}s linear, opacity ${currentDur}s ease-in`
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
    <div className="w-full h-full flex flex-col relative">
      <div className="absolute top-0 left-0 z-[5]">
        <h2 className="text-[2.5rem] font-thin mb-4 text-text">{methods[selectedMethod].name}</h2>
        {isActive && showInstruction && (
          <div className="p-6 max-w-[350px] animate-fadeIn border-l-4 border-indicator bg-white/5 backdrop-blur-3xl rounded-r-squircle-md">
            <div className="text-lg leading-relaxed font-light italic text-text">
              {INSTRUCTIONS[currentPhase]}
            </div>
          </div>
        )}
      </div>

      <div className="m-auto flex flex-col items-center justify-center gap-8 md:gap-12 w-full">
        <div className="relative w-[300px] h-[300px] md:w-[450px] md:h-[450px] flex justify-center items-center">
          <div 
            className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent backdrop-blur-2xl border border-white/10 rounded-squircle-lg shadow-2xl transition-opacity duration-500"
            style={{ opacity: selectedMethod === 'box' ? 1 : 0 }}
          ></div>
          <div className="absolute top-[-60px] md:top-[-80px] text-[1.5rem] md:text-[2.2rem] font-thin text-text uppercase tracking-[0.4rem] md:tracking-[0.8rem] whitespace-nowrap">
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
            className="absolute w-24 h-24 md:w-40 md:h-40 breath-glow rounded-full z-[2] flex justify-center items-center text-[2.5rem] md:text-[3.5rem] font-light text-black"
            style={getCircleStyle()}
          >
            {isActive ? timeLeft : ''}
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <button onClick={handleStartStop} className="btn-primary text-xl font-light tracking-widest flex items-center gap-3">
            {isActive ? <Square size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
            {isActive ? 'Stop Session' : 'Begin Journey'}
          </button>
          {isActive && <div className="text-dim font-light tracking-wide">Session: {sessionTime}s</div>}
        </div>
      </div>

      {showSummary && lastSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-6">
          <div className="w-full max-w-lg bg-white/5 backdrop-blur-3xl border border-white/10 rounded-squircle-lg p-10 shadow-2xl animate-fadeIn">
            <div className="flex flex-col items-center mb-8">
              <CheckCircle2 size={48} className="text-accent mb-4" />
              <h2 className="text-4xl font-thin text-center tracking-tight">Breathing Complete</h2>
            </div>
            
            <div className="flex justify-around mb-8 p-6 bg-white/5 rounded-squircle-md border border-white/5">
              <div className="text-center">
                <p className="text-xs uppercase tracking-widest text-dim mb-1">Duration</p>
                <p className="text-2xl font-light">{lastSession.duration}s</p>
              </div>
              <div className="text-center">
                <p className="text-xs uppercase tracking-widest text-dim mb-1">Method</p>
                <p className="text-2xl font-light">{lastSession.pattern}</p>
              </div>
            </div>
            
            <div className="mb-8">
              <label className="block text-sm font-light text-dim mb-3 ml-1 uppercase tracking-wider">Add a note about your session:</label>
              <textarea 
                value={currentNote}
                onChange={(e) => setCurrentNote(e.target.value)}
                placeholder="How do you feel?"
                className="w-full bg-white/5 border border-white/10 rounded-squircle-md p-5 text-text focus:outline-none focus:border-accent min-h-[120px] resize-none transition-all placeholder:text-dim/50"
              />
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setShowSummary(false)} 
                className="flex-1 border border-white/10 py-4 rounded-squircle-md font-light hover:bg-white/5 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <X size={18} />
                Discard
              </button>
              <button 
                onClick={handleSaveSession}
                className="flex-1 bg-text text-bg py-4 rounded-squircle-md font-medium hover:bg-indicator transition-all duration-300 flex items-center justify-center gap-2"
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
