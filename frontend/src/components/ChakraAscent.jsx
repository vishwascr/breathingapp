import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, CheckCircle2, 
  Sparkles, 
  ChevronRight, ChevronLeft, PenTool, 
  Clock, HelpCircle, Save
} from 'lucide-react';
import { Button, Textarea, Modal } from './common';

const CHAKRAS = [
  {
    id: 1,
    name: "Root Chakra",
    sanskritName: "Muladhara",
    location: "Base of Spine",
    meaning: "Root Support & Stability",
    mantra: "Lam",
    colorName: "Red",
    colorClasses: {
      bg: "from-red-950/30 via-red-900/10 to-black",
      accent: "text-red-400",
      accentBg: "bg-red-500/10",
      border: "border-red-500/20",
      shadow: "shadow-[0_0_80px_rgba(239,68,68,0.25)]",
      glowColor: "rgba(239,68,68,0.2)",
      gradient: "from-red-500 to-rose-600"
    },
    questions: [
      "What are you running from right now?",
      "What would happen if you did nothing for the next 10 minutes?"
    ]
  },
  {
    id: 2,
    name: "Sacral Chakra",
    sanskritName: "Svadhisthana",
    location: "Below the Navel",
    meaning: "One's Own Abode, Desire & Emotion",
    mantra: "Vam",
    colorName: "Orange",
    colorClasses: {
      bg: "from-orange-950/30 via-orange-900/10 to-black",
      accent: "text-orange-400",
      accentBg: "bg-orange-500/10",
      border: "border-orange-500/20",
      shadow: "shadow-[0_0_80px_rgba(249,115,22,0.25)]",
      glowColor: "rgba(249,115,22,0.2)",
      gradient: "from-orange-500 to-amber-600"
    },
    questions: [
      "Where do you feel this urge in your body?",
      "Is this craving or simply energy?"
    ]
  },
  {
    id: 3,
    name: "Solar Plexus Chakra",
    sanskritName: "Manipura",
    location: "Upper Abdomen / Stomach",
    meaning: "City of Jewels, Personal Will & Power",
    mantra: "Ram",
    colorName: "Yellow",
    colorClasses: {
      bg: "from-yellow-950/30 via-yellow-900/10 to-black",
      accent: "text-yellow-400",
      accentBg: "bg-yellow-500/10",
      border: "border-yellow-500/20",
      shadow: "shadow-[0_0_80px_rgba(234,179,8,0.25)]",
      glowColor: "rgba(234,179,8,0.2)",
      gradient: "from-yellow-400 to-amber-500"
    },
    questions: [
      "What would your strongest self choose right now?",
      "Are you reacting or deciding?"
    ]
  },
  {
    id: 4,
    name: "Heart Chakra",
    sanskritName: "Anahata",
    location: "Center of Chest",
    meaning: "Unstruck, Love & Compassion",
    mantra: "Yam",
    colorName: "Green",
    colorClasses: {
      bg: "from-emerald-950/30 via-emerald-900/10 to-black",
      accent: "text-emerald-400",
      accentBg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      shadow: "shadow-[0_0_80px_rgba(16,185,129,0.25)]",
      glowColor: "rgba(16,185,129,0.2)",
      gradient: "from-emerald-500 to-teal-600"
    },
    questions: [
      "Can you be kind to yourself without giving in?",
      "What do you actually need at this moment?"
    ]
  },
  {
    id: 5,
    name: "Throat Chakra",
    sanskritName: "Vishuddha",
    location: "Throat",
    meaning: "Pure, Communication & Truth",
    mantra: "Ham",
    colorName: "Blue",
    colorClasses: {
      bg: "from-sky-950/30 via-sky-900/10 to-black",
      accent: "text-sky-400",
      accentBg: "bg-sky-500/10",
      border: "border-sky-500/20",
      shadow: "shadow-[0_0_80px_rgba(14,165,233,0.25)]",
      glowColor: "rgba(14,165,233,0.2)",
      gradient: "from-sky-400 to-blue-600"
    },
    questions: [
      "What is the truth?",
      "What story are you telling yourself?"
    ]
  },
  {
    id: 6,
    name: "Third Eye Chakra",
    sanskritName: "Ajna",
    location: "Between the Brows",
    meaning: "Command / Perceive, Intuition & Wisdom",
    mantra: "Om",
    colorName: "Indigo",
    colorClasses: {
      bg: "from-indigo-950/30 via-indigo-900/10 to-black",
      accent: "text-indigo-400",
      accentBg: "bg-indigo-500/10",
      border: "border-indigo-500/20",
      shadow: "shadow-[0_0_80px_rgba(99,102,241,0.25)]",
      glowColor: "rgba(99,102,241,0.2)",
      gradient: "from-indigo-500 to-violet-600"
    },
    questions: [
      "Can you observe the craving without becoming it?",
      "Who is noticing this thought?"
    ]
  },
  {
    id: 7,
    name: "Crown Chakra",
    sanskritName: "Sahasrara",
    location: "Top of Head",
    meaning: "Thousand-Fold, Pure Awareness",
    mantra: "Silence",
    colorName: "Violet",
    colorClasses: {
      bg: "from-purple-950/30 via-purple-900/10 to-black",
      accent: "text-purple-400",
      accentBg: "bg-purple-500/10",
      border: "border-purple-500/20",
      shadow: "shadow-[0_0_80px_rgba(168,85,247,0.25)]",
      glowColor: "rgba(168,85,247,0.2)",
      gradient: "from-purple-500 to-fuchsia-600"
    },
    questions: [
      "If this urge disappears tomorrow, what remains?",
      "What kind of person are you becoming?"
    ]
  }
];

const getBreathingPattern = (cIndex, isUniversal) => {
  if (isUniversal) {
    return [
      { phase: 'Inhale', duration: 5 },
      { phase: 'Exhale', duration: 6 }
    ];
  }

  // Chakra-specific patterns
  switch (cIndex) {
    case 0: // Root (Muladhara)
      return [
        { phase: 'Inhale', duration: 4 },
        { phase: 'Exhale', duration: 6 }
      ];
    case 1: // Sacral (Svadhisthana)
      return [
        { phase: 'Inhale', duration: 5 },
        { phase: 'Exhale', duration: 5 }
      ];
    case 2: // Solar Plexus (Manipura)
      return [
        { phase: 'Inhale', duration: 6 },
        { phase: 'Hold', duration: 2 },
        { phase: 'Exhale', duration: 6 }
      ];
    case 3: // Heart (Anahata)
      return [
        { phase: 'Inhale', duration: 4 },
        { phase: 'Hold', duration: 4 },
        { phase: 'Exhale', duration: 6 }
      ];
    case 4: // Throat (Vishuddha)
      return [
        { phase: 'Inhale', duration: 5 },
        { phase: 'Exhale', duration: 7, note: 'Optional humming (Ham) during exhale' }
      ];
    case 5: // Third Eye (Ajna)
      return [
        { phase: 'Inhale', duration: 6 },
        { phase: 'Hold', duration: 6 },
        { phase: 'Exhale', duration: 6 }
      ];
    case 6: // Crown (Sahasrara)
    default:
      return [
        { phase: 'Natural', duration: 9999 } // Natural breathing, no countdown
      ];
  }
};

function ChakraAscent({ initialStage = 'intro', setIsSessionActive, saveHistory }) {
  const navigate = useNavigate();
  
  // State
  const [stage, setStage] = useState(initialStage); // 'intro' | 'meditating' | 'transition' | 'complete'
  const [countdownVal, setCountdownVal] = useState(0);
  const [chakraIndex, setChakraIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [responseText, setResponseText] = useState('');
  const [answers, setAnswers] = useState([]); // Array of { chakra, question, response }
  const [name, setName] = useState('Vishwas');
  const [sessionRating, setSessionRating] = useState(0);
  const sessionStartTimeRef = useRef(null);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [completedLevels, setCompletedLevels] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [currentNote, setCurrentNote] = useState('');
  const [showNotesInput, setShowNotesInput] = useState(false);

  // Sync with global session state and initialize session start time pure-style inside effect
  useEffect(() => {
    if (setIsSessionActive) {
      setIsSessionActive(stage === 'meditating' || stage === 'transition');
    }
    if (initialStage === 'meditating' && sessionStartTimeRef.current === null) {
      sessionStartTimeRef.current = Date.now();
    }
    return () => {
      if (setIsSessionActive) setIsSessionActive(false);
    };
  }, [stage, setIsSessionActive, initialStage]);
  
  // Breathing animation states
  const [patternIndex, setPatternIndex] = useState(0);
  const [universalMode, setUniversalMode] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(() => {
    const pattern = getBreathingPattern(0, false);
    const phase = pattern[0];
    return phase ? (phase.phase === 'Natural' ? 9999 : phase.duration) : 5;
  });

  // Sync state on prop/state changes (derived state resets)
  const [prevChakraIndex, setPrevChakraIndex] = useState(chakraIndex);
  const [prevUniversalMode, setPrevUniversalMode] = useState(universalMode);
  const [prevPatternIndex, setPrevPatternIndex] = useState(patternIndex);

  if (chakraIndex !== prevChakraIndex || universalMode !== prevUniversalMode || patternIndex !== prevPatternIndex) {
    setPrevChakraIndex(chakraIndex);
    setPrevUniversalMode(universalMode);
    setPrevPatternIndex(patternIndex);

    let nextPatternIndex = patternIndex;
    if (chakraIndex !== prevChakraIndex || universalMode !== prevUniversalMode) {
      setPatternIndex(0);
      nextPatternIndex = 0;
    }

    const pattern = getBreathingPattern(chakraIndex, universalMode);
    const phase = pattern[nextPatternIndex];
    if (phase) {
      setSecondsLeft(phase.phase === 'Natural' ? 9999 : phase.duration);
    }
  }
  
  const breathTimerRef = useRef(null);

  const activeChakra = CHAKRAS[chakraIndex];

  // Calculate dynamic breathing parameters (Derived)
  const currentPattern = getBreathingPattern(chakraIndex, universalMode);
  const currentPhaseObj = currentPattern[patternIndex] || currentPattern[0];
  const currentPhase = currentPhaseObj?.phase || 'Inhale';
  const currentPhaseDuration = currentPhaseObj?.duration || 5;

  const scale = stage !== 'meditating' 
    ? 1.0 
    : (countdownVal > 0 ? 1.0 : (currentPhase === 'Inhale' || currentPhase === 'Hold' ? 2.5 : (currentPhase === 'Natural' ? 1.5 : 1.0)));

  // Breathing loop timer (chakra-specific dynamic counts and phases)
  useEffect(() => {
    if (stage !== 'meditating' || countdownVal > 0) {
      if (breathTimerRef.current) clearInterval(breathTimerRef.current);
      return;
    }

    const pattern = getBreathingPattern(chakraIndex, universalMode);
    const phase = pattern[patternIndex];
    if (!phase || phase.phase === 'Natural') {
      return;
    }

    let currentSeconds = phase.duration;

    breathTimerRef.current = setInterval(() => {
      currentSeconds -= 1;
      if (currentSeconds <= 0) {
        clearInterval(breathTimerRef.current);
        setPatternIndex((prevIdx) => (prevIdx + 1) % pattern.length);
      } else {
        setSecondsLeft(currentSeconds);
      }
    }, 1000);

    return () => clearInterval(breathTimerRef.current);
  }, [stage, chakraIndex, universalMode, patternIndex, countdownVal]);



  const navigateToChakra = useCallback((newIndex) => {
    if (newIndex >= 0 && newIndex < CHAKRAS.length) {
      setChakraIndex(newIndex);
      setQuestionIndex(0);
      setResponseText('');
      setPatternIndex(0);
      setCountdownVal(0); // Cancel countdown on manual transition
    } else if (newIndex === CHAKRAS.length) {
      setStage('complete');
    }
  }, []);

  // Countdown Timer Logic (Integrated directly inside meditating stage)
  useEffect(() => {
    if (stage !== 'meditating' || countdownVal <= 0) return;

    const timer = setTimeout(() => {
      setCountdownVal(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [stage, countdownVal]);

  // Keyboard navigation logic for chakras
  useEffect(() => {
    if (stage !== 'meditating') return;
    const handleChakraKeys = (e) => {
      if (
        document.activeElement.tagName === 'INPUT' || 
        document.activeElement.tagName === 'TEXTAREA'
      ) {
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        navigateToChakra(chakraIndex - 1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        navigateToChakra(chakraIndex + 1);
      }
    };
    window.addEventListener('keydown', handleChakraKeys);
    return () => window.removeEventListener('keydown', handleChakraKeys);
  }, [stage, chakraIndex, navigateToChakra]);

  const handleStartAscent = () => {
    setAnswers([]);
    setChakraIndex(0);
    setQuestionIndex(0);
    setResponseText('');
    setStage('meditating');
    setCountdownVal(3);
    setSessionRating(0);
    sessionStartTimeRef.current = Date.now();
  };

  const handleSaveHistory = async () => {
    if (sessionRating === 0) return;

    // Format all reflections into notes
    const formattedNotes = answers.map(ans => `${ans.chakra}: Q: "${ans.question}" -> A: "${ans.response}"`).join(' | ');
    const finalNote = currentNote.trim() 
      ? `${currentNote.trim()} | Reflections: ${formattedNotes}` 
      : formattedNotes;

    try {
      if (saveHistory) {
        await saveHistory(
          sessionDuration,
          'Chakra Ascent',
          finalNote,
          completedLevels,
          0,
          sessionRating,
          5,
          0,
          6,
          0
        );
      } else {
        const response = await fetch('/api/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            duration: sessionDuration,
            pattern: 'Chakra Ascent',
            inhale: 5,
            inhaleHold: 0,
            exhale: 6,
            exhaleHold: 0,
            cycles: completedLevels,
            notes: finalNote,
            cooldownSeconds: 0,
            rating: sessionRating
          })
        });
        if (response.ok) {
          setShowSummary(false);
          navigate('/history');
        }
      }
    } catch (e) {
      console.error("Failed to save Chakra Ascent session to history:", e);
    }
  };

  const handleNextStep = async () => {
    const currentChakra = CHAKRAS[chakraIndex];
    const currentQuestion = currentChakra.questions[questionIndex];
    
    const userResponse = responseText.trim() || "(Reflected in silence)";
    
    const updatedAnswers = [
      ...answers,
      {
        chakra: currentChakra.name,
        question: currentQuestion,
        response: userResponse
      }
    ];
    setAnswers(updatedAnswers);

    try {
      await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chakra: currentChakra.name,
          question: currentQuestion,
          response: userResponse
        })
      });
    } catch (e) {
      console.error("Failed to save journal entry to server:", e);
    }

    setResponseText('');

    if (questionIndex < 1) {
      setQuestionIndex(1);
    } else {
      if (chakraIndex < 6) {
        setStage('transition');
        setTimeout(() => {
          setChakraIndex(prev => prev + 1);
          setQuestionIndex(0);
          setStage('meditating');
        }, 2200);
      } else {
        const duration = sessionStartTimeRef.current 
          ? Math.round((Date.now() - sessionStartTimeRef.current) / 1000) 
          : 300;
        setSessionDuration(duration);
        setCompletedLevels(chakraIndex + 1);
        setShowSummary(true);
        setStage('intro');
      }
    }
  };

  return (
    <div 
      className="w-full h-full flex flex-col pt-4 pb-24 px-6 md:pt-4 md:pb-4 relative bg-[var(--color-bg)] select-none"
      style={{
        background: `radial-gradient(circle at center, ${stage === 'meditating' ? activeChakra.colorClasses.glowColor : 'rgba(255,255,255,0.01)'} 0%, rgba(0,0,0,0) 70%)`
      }}
    >
      {/* Header toolbar matching Practice.jsx */}
      <header className="w-full max-w-5xl mx-auto mb-2 md:mb-2 flex justify-between items-start shrink-0 z-20">
        <div className="flex items-center gap-3">
          <h2 className="text-[1.1rem] uppercase tracking-widest opacity-60 md:text-4xl md:font-extralight md:tracking-tight md:opacity-100 md:normal-case text-text text-left">
            Chakra Ascent
          </h2>
          {stage === 'meditating' && (
            <span className={`text-[0.65rem] md:text-xs uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 ${activeChakra.colorClasses.accent} font-medium`}>
              {activeChakra.name}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-3 shrink-0">
          {/* Universal Mode toggle */}
          {['intro', 'meditating'].includes(stage) && (
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-[0.7rem] md:text-xs text-dim">
              <span className={`transition-colors duration-200 ${!universalMode ? 'text-accent font-medium' : ''}`}>Chakra Cycles</span>
              <button
                onClick={() => setUniversalMode(prev => !prev)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                  universalMode ? 'bg-accent' : 'bg-white/10'
                }`}
                title="Toggle Universal Mode"
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-300 ${
                    universalMode ? 'translate-x-[18px]' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`transition-colors duration-200 ${universalMode ? 'text-accent font-medium' : ''}`}>Universal</span>
            </div>
          )}
        </div>
      </header>

      {/* Main content body structured exactly like Practice.jsx's focusArea */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 md:gap-14 w-full max-w-5xl mx-auto min-h-0 pt-12 md:pt-0 z-10">
        
        {/* STAGE 1: INTRO */}
        {stage === 'intro' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 max-w-xl mx-auto text-center animate-fadeIn py-6">
            <div className="flex justify-center mb-2">
              <div className="w-16 h-16 rounded-full bg-accent/15 flex items-center justify-center animate-pulse">
                <Sparkles className="text-accent w-8 h-8" />
              </div>
            </div>

            <h1 className="text-3xl md:text-6xl font-thin tracking-widest text-text">Chakra Ascent</h1>
            <p className="text-dim font-light text-base md:text-lg leading-relaxed max-w-sm mx-auto">
              A premium mindfulness experience blending conscious breathing, self-inquiry, and ancient Indian chakra observation.
            </p>

            <div className="w-full flex flex-col gap-3 my-4 text-left">
              <div className="flex items-start gap-4 p-4 rounded-squircle-sm bg-white/[0.02] border border-white/5">
                <Clock className="text-accent w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-xs text-dim font-light leading-relaxed">
                  Sequentially breathe through <strong>7 energy centers</strong> (Root to Crown) with slow 5s inhale/exhale pacing.
                </p>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-squircle-sm bg-white/[0.02] border border-white/5">
                <PenTool className="text-accent w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-xs text-dim font-light leading-relaxed">
                  Log your thoughts as deep self-reflection journal entries.
                </p>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-squircle-sm bg-white/[0.02] border border-white/5">
                <HelpCircle className="text-accent w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-xs text-dim font-light leading-relaxed">
                  Specifically designed to observe and dismantle cravings, overthinking, anxiety, or procrastination in real time.
                </p>
              </div>
            </div>

            {/* Customizer Name */}
            <div className="w-full flex flex-col gap-2 items-center mb-4">
              <label className="text-[0.65rem] uppercase tracking-widest text-dim/60">Your Name (for personalization)</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full max-w-xs text-center border-b border-white/20 focus:border-accent py-2 text-text font-light bg-transparent focus:outline-none"
              />
            </div>

            <Button 
              onClick={handleStartAscent}
              variant="primary"
              size="none"
              className="w-full py-5 text-base tracking-widest"
            >
              <span>Begin the Ascent</span>
              <ArrowRight size={18} />
            </Button>
          </div>
        )}

        {/* STAGE 2: MEDITATING */}
        {stage === 'meditating' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 md:gap-8 w-full max-w-5xl mx-auto min-h-0">
            
            {/* Navigation & Pulsing Breathing Ring Layout */}
            <div className="flex items-center justify-center gap-4 md:gap-12 w-full max-w-4xl min-h-0 select-none">
              {/* Left Arrow Button */}
              <button
                onClick={() => navigateToChakra(chakraIndex - 1)}
                disabled={chakraIndex === 0}
                className={`p-2.5 md:p-3.5 rounded-full border transition-all cursor-pointer ${
                  chakraIndex === 0 
                    ? 'border-white/5 text-dim/15 cursor-not-allowed opacity-30' 
                    : 'border-white/10 text-dim hover:text-text hover:bg-white/5 hover:border-white/20'
                }`}
                title="Previous Chakra (Left Arrow)"
              >
                <ChevronLeft size={20} className="md:w-6 md:h-6" />
              </button>

              {/* Pulsing Breathing Ring matching size/layout in Practice.jsx */}
              <div className="relative w-[210px] h-[210px] md:w-[min(500px,55vh)] md:h-[min(500px,55vh)] flex justify-center items-center shrink-0">
                {/* Core scale circle mirroring Practice.jsx exactly */}
                <div 
                  className="absolute w-20 h-20 md:w-44 md:h-44 rounded-full flex flex-col justify-center items-center text-center font-extralight border border-white/10 z-10 bg-black/50 text-white"
                  style={{
                    transform: `scale(${scale})`,
                    transition: countdownVal > 0 ? 'transform 0.3s ease-out' : (currentPhase === 'Natural' ? 'transform 4s ease-in-out' : `transform ${currentPhaseDuration}s ease-in-out`),
                    boxShadow: `0 0 15px 2px ${activeChakra.colorClasses.glowColor}, 0 0 50px 8px ${activeChakra.colorClasses.glowColor}, inset 0 0 10px rgba(255, 255, 255, 0.1)`
                  }}
                >
                  {countdownVal > 0 ? (
                    <span className="text-[2.5rem] md:text-[3.5rem] font-light leading-none animate-fadeIn text-white">
                      {countdownVal}
                    </span>
                  ) : currentPhase === 'Natural' ? (
                    <Sparkles className={`w-8 h-8 md:w-12 md:h-12 ${activeChakra.colorClasses.accent} animate-pulse`} />
                  ) : (
                    <span className="text-[2rem] md:text-[3.5rem] font-light leading-none animate-fadeIn">
                      {secondsLeft}
                    </span>
                  )}
                </div>
              </div>

              {/* Right Arrow Button */}
              <button
                onClick={() => navigateToChakra(chakraIndex + 1)}
                className="p-2.5 md:p-3.5 rounded-full border border-white/10 text-dim hover:text-text hover:bg-white/5 hover:border-white/20 transition-all cursor-pointer"
                title={chakraIndex === 6 ? "Complete Ascent" : "Next Chakra (Right Arrow)"}
              >
                <ChevronRight size={20} className="md:w-6 md:h-6" />
              </button>
            </div>

            {/* Inquiries and Input Stack matching Practice.jsx text stack */}
            <div className="flex flex-col items-center w-full max-w-xl mx-auto gap-3 md:gap-4 shrink-0">
              
              {/* Unified Vertical Stack - Space Reserved */}
              <div className="flex flex-col items-center text-center gap-2 min-h-[100px] md:min-h-[110px] justify-center">
                {/* Dynamic Breath Phase & Mantra */}
                <div className="text-[1.2rem] md:text-[1.8rem] font-thin text-text uppercase tracking-[0.6rem] md:tracking-[1rem] whitespace-nowrap mb-1">
                  {countdownVal > 0 ? 'PREPARE' : `${currentPhase} — ${activeChakra.mantra}`}
                </div>
                
                {/* Optional humming notice for Throat Chakra Exhale */}
                {chakraIndex === 4 && currentPhase === 'Exhale' && (
                  <div className="text-xs text-accent animate-pulse font-light tracking-wide mt-1">
                    (Optional: hum the sound "Ham" during exhale)
                  </div>
                )}

                {/* Chakra info */}
                <div className="text-[0.65rem] md:text-[0.75rem] font-medium tracking-[0.2rem] text-dim uppercase">
                  {activeChakra.location} • {activeChakra.meaning}
                </div>
                
                {/* Question / Inquiry */}
                <div className="text-lg md:text-2xl font-light tracking-wide text-text max-w-md mx-auto leading-relaxed my-2">
                  {activeChakra.questions[questionIndex]}
                </div>
                
                {/* Subtitle / Tip */}
                <div className="text-[0.65rem] uppercase tracking-widest text-dim/50">
                  Chakra {activeChakra.id} of 7 — Question {questionIndex + 1} of 2
                </div>
              </div>

              {/* Text reflection input */}
              <div className="w-full max-w-sm px-4">
                <Textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Type your reflection (optional)"
                  className="text-center placeholder:text-dim/20 py-2.5 px-4 text-xs md:text-sm"
                  rows={1}
                />
              </div>

              {/* Action Buttons: Reflect in Silence & End Session */}
              <div className="flex items-center gap-3 w-full max-w-md px-4 justify-center mt-2 md:mt-6">
                {responseText.trim() === '' && (
                  <Button
                    onClick={() => {
                      const duration = sessionStartTimeRef.current 
                        ? Math.round((Date.now() - sessionStartTimeRef.current) / 1000) 
                        : 300;
                      setSessionDuration(duration);
                      setCompletedLevels(chakraIndex + 1);
                      setShowSummary(true);
                      setStage('intro');
                    }}
                    variant="secondary"
                    size="none"
                    className="text-sm md:text-base tracking-widest shrink-0 border-rose-500/20 hover:border-rose-500/40 text-rose-400 hover:bg-rose-500/5 cursor-pointer font-light px-5 py-3.5"
                  >
                    <span>End Session</span>
                  </Button>
                )}
                <Button 
                  onClick={handleNextStep} 
                  variant="primary"
                  size="none"
                  className="text-sm md:text-base tracking-widest shrink-0 flex-1 py-3.5 cursor-pointer"
                >
                  <span>{responseText.trim() === '' ? 'Reflect in Silence' : 'Save & Continue'}</span>
                  <ChevronRight size={18} />
                </Button>
              </div>
              
            </div>
          </div>
        )}

        {/* STAGE 3: TRANSITION */}
        {stage === 'transition' && (
          <div className="flex flex-col items-center justify-center text-center animate-fadeIn py-16 gap-6">
            <div className="relative w-24 h-24 flex items-center justify-center">
              {/* Outer pulsing color ring */}
              <div 
                className="absolute inset-0 rounded-full animate-pulse border border-white/10"
                style={{
                  boxShadow: `0 0 40px 10px ${CHAKRAS[chakraIndex + 1]?.colorClasses.glowColor || 'var(--color-accent)'}`,
                  backgroundColor: `${(CHAKRAS[chakraIndex + 1]?.colorClasses.glowColor || 'var(--color-accent)').replace('0.2', '0.05')}`
                }}
              ></div>
              {/* Core tiny center color light */}
              <div 
                className="w-4 h-4 rounded-full"
                style={{
                  backgroundColor: CHAKRAS[chakraIndex + 1]?.colorClasses.glowColor.replace('0.2', '1') || 'var(--color-accent)'
                }}
              ></div>
            </div>

            <div className="flex flex-col gap-2 mt-4">
              <span className="text-[0.65rem] uppercase tracking-widest text-dim/40 font-medium">Ascending to next energy center</span>
              <h2 className="text-2xl md:text-4xl font-extralight tracking-widest text-text">
                {CHAKRAS[chakraIndex + 1]?.name}
              </h2>
              <span className="text-xs italic text-dim/50">"I am not my impulses. I am the observer."</span>
            </div>
          </div>
        )}
        
      </div>

      {/* Session Complete Summary Modal */}
      <Modal
        isOpen={showSummary}
        onClose={() => {
          setShowSummary(false);
          setStage('intro');
        }}
        maxWidth="sm"
        zIndex="z-[110]"
        backdropBlur="md"
        backdropOpacity="bg-black/80"
      >
        <div className="flex flex-col items-center mb-6 md:mb-8 text-center">
          <CheckCircle2 size={32} className="text-accent mb-3" />
          <h2 className="text-xl md:text-3xl font-thin tracking-tight">Session Complete</h2>
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mb-8 text-sm md:text-base font-light text-text/80 tracking-wide text-center">
          <span>{sessionDuration}s</span>
          <span className="opacity-20 text-[0.6rem]">•</span>
          <span>Chakra Ascent</span>
          <span className="opacity-20 text-[0.6rem]">•</span>
          <span>7 Levels</span>
          <span className="opacity-20 text-[0.6rem]">•</span>
          <span>{completedLevels} Levels Completed</span>
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
            <Button 
              onClick={() => setShowNotesInput(true)}
              variant="secondary"
              size="none"
              rounded="full"
              className="text-[0.65rem] md:text-xs tracking-[0.2rem] text-accent/60 hover:text-accent px-6 py-2.5"
            >
              + Add a note
            </Button>
          ) : (
            <div className="w-full animate-fadeIn">
              <Textarea 
                autoFocus
                value={currentNote}
                onChange={(e) => setCurrentNote(e.target.value)}
                placeholder="How do you feel?"
                className="min-h-[80px] md:min-h-[100px]"
              />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <Button 
            onClick={handleSaveHistory}
            disabled={sessionRating === 0}
            variant="primary"
            size="none"
            className="w-full py-4 font-medium"
          >
            <Save size={18} />
            <span>Save Journey</span>
          </Button>
          <Button 
            onClick={() => {
              setShowSummary(false);
              setStage('intro');
            }} 
            variant="secondary"
            size="none"
            className="w-full py-3 text-xs tracking-widest font-light"
          >
            Discard Session
          </Button>
        </div>
      </Modal>

    </div>
  );
}

export default ChakraAscent;
