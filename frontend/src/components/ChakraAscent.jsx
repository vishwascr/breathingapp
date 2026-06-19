import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Play, ArrowRight, CheckCircle2, RotateCcw, 
  Volume2, VolumeX, Sparkles, AlertCircle, 
  HelpCircle, Compass, ChevronRight, PenTool, 
  BookOpen, Droplet, Music, Footprints, Clock
} from 'lucide-react';

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

function ChakraAscent() {
  const navigate = useNavigate();
  
  // State
  const [stage, setStage] = useState('intro'); // 'intro' | 'meditating' | 'transition' | 'complete'
  const [chakraIndex, setChakraIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [responseText, setResponseText] = useState('');
  const [answers, setAnswers] = useState([]); // Array of { chakra, question, response }
  const [name, setName] = useState(() => localStorage.getItem('breath-username') || 'Vishwas');
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Breathing animation states
  const [isInhaling, setIsInhaling] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(5);
  const [isPaused, setIsPaused] = useState(false);
  
  // Post-meditation action modes
  const [activeAction, setActiveAction] = useState(null); // null | 'timer' | 'music' | 'walk' | 'water'
  const [focusTimer, setFocusTimer] = useState(1500); // 25 minutes default
  const [timerRunning, setTimerRunning] = useState(false);

  const timerRef = useRef(null);
  const breathTimerRef = useRef(null);

  const activeChakra = CHAKRAS[chakraIndex];

  // Save username to localStorage when changed
  useEffect(() => {
    localStorage.setItem('breath-username', name);
  }, [name]);

  // Audio synthesis helper for Tibetan Singing Bowl
  const playBowlSound = (frequency = 180, toneType = 'sine', duration = 3) => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      
      // Main fundamental tone
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.type = toneType;
      osc1.frequency.setValueAtTime(frequency, audioCtx.currentTime);
      
      // Harmonic overtone 1 (Tibetan bowls have rich overtones)
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(frequency * 1.5, audioCtx.currentTime);

      // Harmonic overtone 2 (High shimmer)
      const osc3 = audioCtx.createOscillator();
      const gain3 = audioCtx.createGain();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(frequency * 2, audioCtx.currentTime);

      // Node configuration
      gain1.gain.setValueAtTime(0.25, audioCtx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

      gain2.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration - 0.5);

      gain3.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain3.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration - 1);

      osc1.connect(gain1);
      osc2.connect(gain2);
      osc3.connect(gain3);

      gain1.connect(audioCtx.destination);
      gain2.connect(audioCtx.destination);
      gain3.connect(audioCtx.destination);

      osc1.start();
      osc2.start();
      osc3.start();

      osc1.stop(audioCtx.currentTime + duration);
      osc2.stop(audioCtx.currentTime + duration);
      osc3.stop(audioCtx.currentTime + duration);
    } catch (err) {
      console.warn("Singing bowl audio context failed:", err);
    }
  };

  // Sound triggering on step change
  useEffect(() => {
    if (stage === 'meditating') {
      // Play a deeper ground tone for root chakra, higher as you ascend
      const frequencies = [144, 162, 180, 216, 240, 270, 324];
      const toneFreq = frequencies[chakraIndex] || 180;
      playBowlSound(toneFreq, 'sine', 4);
    } else if (stage === 'complete') {
      // Celestial finish tone
      playBowlSound(324, 'sine', 6);
      playBowlSound(486, 'triangle', 4);
    }
  }, [stage, chakraIndex]);

  // Breathing loop timer (5s inhale, 5s exhale)
  useEffect(() => {
    if (stage !== 'meditating' || isPaused) {
      if (breathTimerRef.current) clearInterval(breathTimerRef.current);
      return;
    }

    breathTimerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsInhaling((inhale) => {
            // Play subtle tone on breath state transition
            if (soundEnabled) {
              const transitionFreq = !inhale ? 220 : 165;
              playBowlSound(transitionFreq, 'sine', 1.5);
            }
            return !inhale;
          });
          return 5;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(breathTimerRef.current);
  }, [stage, isPaused, soundEnabled]);

  // Focus Timer Logic (for the Post-Ascent Focus Session)
  useEffect(() => {
    if (timerRunning && focusTimer > 0) {
      timerRef.current = setInterval(() => {
        setFocusTimer(prev => prev - 1);
      }, 1000);
    } else if (focusTimer === 0) {
      setTimerRunning(false);
      playBowlSound(440, 'triangle', 4); // Chime on completion
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [timerRunning, focusTimer]);

  const handleStartAscent = () => {
    setAnswers([]);
    setChakraIndex(0);
    setQuestionIndex(0);
    setResponseText('');
    setStage('meditating');
  };

  const handleNextStep = async () => {
    const currentChakra = CHAKRAS[chakraIndex];
    const currentQuestion = currentChakra.questions[questionIndex];
    
    // Save response locally and push to db if provided
    const userResponse = responseText.trim() || "(Reflected in silence)";
    
    // 1. Update local array
    const updatedAnswers = [
      ...answers,
      {
        chakra: currentChakra.name,
        question: currentQuestion,
        response: userResponse
      }
    ];
    setAnswers(updatedAnswers);

    // 2. Push to backend API
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

    // Reset input
    setResponseText('');

    // Advance flow
    if (questionIndex < 1) {
      // Go to second question of current chakra
      setQuestionIndex(1);
    } else {
      // End of this chakra's questions. Advance chakra or finish.
      if (chakraIndex < 6) {
        // Go to next chakra
        setStage('transition');
        setTimeout(() => {
          setChakraIndex(prev => prev + 1);
          setQuestionIndex(0);
          setStage('meditating');
        }, 2200); // Transitions with visual break
      } else {
        // Complete the ascent
        setStage('complete');
      }
    }
  };

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div 
      className="w-full max-w-5xl mx-auto min-h-dvh flex flex-col relative transition-all duration-1000 ease-in-out p-6 md:p-12 select-none"
      style={{
        background: `radial-gradient(circle at center, ${stage === 'meditating' ? activeChakra.colorClasses.glowColor : 'rgba(255,255,255,0.01)'} 0%, rgba(0,0,0,0) 70%)`
      }}
    >
      {/* Header toolbar */}
      <header className="flex justify-between items-center w-full z-20 mb-8 md:mb-12 shrink-0">
        <div className="flex items-center gap-3">
          <Compass className="text-dim/60 w-6 h-6 animate-spin-slow" />
          <h2 className="text-xs uppercase tracking-[0.25rem] text-dim/60 font-light">Chakra Ascent</h2>
        </div>
        
        <button 
          onClick={() => setSoundEnabled(prev => !prev)}
          className="p-3 bg-white/5 border border-white/5 rounded-full hover:bg-white/10 hover:border-white/10 text-dim transition-all flex items-center justify-center cursor-pointer"
          title={soundEnabled ? "Mute Bell" : "Unmute Bell"}
        >
          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>
      </header>

      {/* Main content body */}
      <div className="flex-1 flex flex-col justify-center items-center w-full relative z-10 min-h-0">
        
        {/* STAGE 1: INTRO */}
        {stage === 'intro' && (
          <div className="w-full max-w-xl bg-white/5 backdrop-blur-2xl border border-white/10 rounded-squircle-lg p-8 md:p-12 shadow-2xl flex flex-col text-center animate-fadeIn">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-accent/15 flex items-center justify-center animate-pulse">
                <Sparkles className="text-accent w-8 h-8" />
              </div>
            </div>

            <h1 className="text-4xl font-extralight tracking-widest text-text mb-4">Chakra Ascent</h1>
            <p className="text-dim font-light text-base leading-relaxed mb-8 max-w-sm mx-auto">
              A premium meditation ritual. Connect with the observer within, dismantle urges through deep consciousness, and realign with your superior self.
            </p>

            <div className="space-y-4 mb-8 text-left max-w-md mx-auto">
              <div className="flex items-start gap-4 p-4 rounded-squircle-sm bg-white/[0.02] border border-white/5">
                <Clock className="text-accent w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-xs text-dim font-light leading-relaxed">
                  Sequence through <strong>7 chakras</strong> with slow, structured breathing.
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
                  Designed to overcome overthinking, cravings, procrastination, and anxiety.
                </p>
              </div>
            </div>

            {/* Customizer Name */}
            <div className="mb-8 flex flex-col gap-2 items-center">
              <label className="text-[0.65rem] uppercase tracking-widest text-dim/60">Your Name (for personalization)</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full max-w-xs text-center border-b border-white/20 focus:border-accent py-2 text-text font-light"
              />
            </div>

            <button 
              onClick={handleStartAscent}
              className="btn-primary w-full py-5 text-base uppercase tracking-widest flex items-center justify-center gap-3"
            >
              <span>Begin the Ascent</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* STAGE 2: MEDITATING */}
        {stage === 'meditating' && (
          <div className="w-full flex flex-col items-center justify-center gap-6 md:gap-10 animate-fadeIn text-center">
            
            {/* Chakra details header */}
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <span className={`text-[0.65rem] md:text-xs uppercase tracking-[0.25rem] font-bold ${activeChakra.colorClasses.accent}`}>
                Chakra {activeChakra.id} of 7 • {activeChakra.location}
              </span>
              <h2 className="text-3xl md:text-5xl font-light tracking-tight text-text">
                {activeChakra.name} <span className="opacity-40 italic">({activeChakra.sanskritName})</span>
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[0.7rem] uppercase tracking-widest text-dim/60">Mantra: <strong>{activeChakra.mantra}</strong></span>
                <span className="text-dim/30">•</span>
                <span className="text-[0.7rem] uppercase tracking-widest text-dim/60">Meaning: <em>{activeChakra.meaning}</em></span>
              </div>
            </div>

            {/* Pulsing Breathing Ring */}
            <div className="w-[180px] h-[180px] md:w-[260px] md:h-[260px] relative flex justify-center items-center shrink-0 my-4">
              {/* Outer pulsing energy field */}
              <div 
                className={`absolute inset-0 rounded-full transition-transform ease-linear border border-white/5 backdrop-blur-[2px] ${
                  isInhaling ? 'scale-150 duration-[5000ms]' : 'scale-100 duration-[5000ms]'
                }`}
                style={{
                  boxShadow: `0 0 40px 5px ${activeChakra.colorClasses.glowColor}`,
                  backgroundColor: `${activeChakra.colorClasses.glowColor.replace('0.2', '0.04')}`
                }}
              ></div>
              
              {/* Center solid core ring */}
              <div 
                className={`absolute w-24 h-24 md:w-32 md:h-32 rounded-full flex flex-col justify-center items-center text-center font-extralight border border-white/10 z-10 transition-all duration-[5000ms] ease-linear bg-black/40 ${
                  isInhaling ? 'scale-125' : 'scale-95'
                }`}
                style={{
                  boxShadow: `inset 0 0 20px ${activeChakra.colorClasses.glowColor}`
                }}
              >
                <span className={`text-[0.6rem] uppercase tracking-widest font-medium opacity-65 ${activeChakra.colorClasses.accent}`}>
                  {isInhaling ? 'Inhale' : 'Exhale'}
                </span>
                <span className="text-2xl font-light mt-0.5">{secondsLeft}</span>
              </div>

              {/* Breath Pause Button overlays ring subtly on hover */}
              <button 
                onClick={() => setIsPaused(!isPaused)}
                className="absolute inset-0 rounded-full opacity-0 hover:opacity-100 hover:bg-black/60 z-20 flex items-center justify-center text-xs text-dim uppercase tracking-widest transition-all duration-300 font-light cursor-pointer"
              >
                {isPaused ? "Resume breathing" : "Pause breathing"}
              </button>
            </div>

            {/* Reflection Question Panel */}
            <div className="w-full max-w-lg bg-white/5 backdrop-blur-2xl border border-white/10 rounded-squircle-lg p-6 md:p-8 shadow-xl flex flex-col gap-6 text-left">
              <div className="flex items-center gap-3">
                <HelpCircle className={`w-5 h-5 shrink-0 ${activeChakra.colorClasses.accent}`} />
                <span className="text-[0.65rem] uppercase tracking-widest text-dim/60 font-bold">Reflective Inquiry ({questionIndex + 1}/2)</span>
              </div>

              <h3 className="text-xl md:text-2xl font-light tracking-tight text-text leading-snug">
                {activeChakra.questions[questionIndex]}
              </h3>

              {/* Text Response input */}
              <div className="flex flex-col gap-2">
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Type your reflection here... (or leave blank to contemplate in silence)"
                  className="w-full min-h-[90px] bg-white/[0.03] border border-white/10 rounded-squircle-sm p-4 text-text placeholder:text-dim/20 focus:outline-none focus:border-accent text-sm md:text-base resize-none transition-all"
                />
              </div>

              {/* Continue Actions */}
              <div className="flex gap-4">
                <button
                  onClick={handleNextStep}
                  className={`flex-1 py-4 font-light text-sm uppercase tracking-widest border border-white/10 hover:border-white/20 hover:bg-white/5 rounded-squircle-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    responseText.trim() === '' ? 'text-dim' : 'text-accent'
                  }`}
                >
                  <span>{responseText.trim() === '' ? 'Reflect in Silence' : 'Save Reflection'}</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STAGE 3: TRANSITION */}
        {stage === 'transition' && (
          <div className="flex flex-col items-center justify-center text-center animate-fadeIn py-16 gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border border-white/15 animate-ping opacity-25"></div>
              <Compass className="w-16 h-16 text-accent/60 absolute inset-0 m-auto animate-spin-slow" />
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[0.65rem] uppercase tracking-widest text-dim/40 font-medium">Ascending to next energy center</span>
              <h2 className="text-2xl md:text-4xl font-extralight tracking-widest text-text">
                {CHAKRAS[chakraIndex + 1]?.name}
              </h2>
              <span className="text-xs italic text-dim/50">"I am not my impulses. I am the observer."</span>
            </div>
          </div>
        )}

        {/* STAGE 4: COMPLETE SUMMARY CARD */}
        {stage === 'complete' && (
          <div className="w-full max-w-3xl flex flex-col gap-8 md:gap-10 animate-fadeIn">
            
            {/* Completion Intro Card */}
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-squircle-lg p-8 md:p-12 shadow-2xl text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-emerald-500 to-purple-500"></div>
              
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-accent/15 flex items-center justify-center animate-trophy-glow">
                  <CheckCircle2 className="text-accent w-8 h-8" />
                </div>
              </div>

              <h1 className="text-4xl font-extralight tracking-widest mb-4">Ascent Accomplished</h1>
              <p className="text-lg text-dim font-light max-w-lg mx-auto leading-relaxed">
                You have traversed the seven gates. Your breathing has slowed, your mind has gained altitude, and you stand as the clear observer of your impulses.
              </p>
            </div>

            {/* Current Self vs Superior Self */}
            <div className="bg-white/5 border border-white/10 rounded-squircle-lg p-6 md:p-10 shadow-xl flex flex-col gap-8">
              <div className="border-b border-white/5 pb-4 flex justify-between items-center">
                <h3 className="text-xl font-light tracking-tight text-text">Current Self vs Superior Self</h3>
                <span className="text-[0.65rem] uppercase tracking-widest bg-accent/15 text-accent border border-accent/20 px-3 py-1 rounded-full font-bold">Dual Aspect Reflection</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Column 1: Current Impulse / Mind State */}
                <div className="flex flex-col gap-4 bg-white/[0.01] border border-white/5 rounded-squircle-md p-6">
                  <span className="text-[0.65rem] uppercase tracking-widest text-rose-400 font-bold">Current Self / The Impulse</span>
                  <p className="text-sm font-light text-dim leading-relaxed">
                    Feels the immediate push of cravings, overthinking, anxiety, or procrastination. Reacts to external triggers. Views impulses as part of identity.
                  </p>
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <span className="text-[0.6rem] uppercase tracking-widest text-dim/60 block mb-2 font-bold">Your session reflections:</span>
                    <div className="max-h-[220px] overflow-y-auto pr-2 custom-scrollbar space-y-4">
                      {answers.map((ans, idx) => (
                        <div key={idx} className="text-xs font-light border-b border-white/5 pb-3">
                          <span className="text-accent block text-[0.65rem] uppercase tracking-widest font-semibold mb-1">{ans.chakra}</span>
                          <p className="text-dim/80 mb-1 italic">Q: "{ans.question}"</p>
                          <p className="text-text font-normal">A: "{ans.response}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Column 2: Superior Self */}
                <div className="flex flex-col gap-4 bg-white/[0.02] border border-accent/10 rounded-squircle-md p-6 relative">
                  <span className="text-[0.65rem] uppercase tracking-widest text-accent font-bold">Superior Self / The Observer</span>
                  <p className="text-sm font-light text-dim leading-relaxed">
                    Watches the waves of impulse arise and fall without action. Decides intentionally. Recognizes: <em>"I am not my impulses. I am the observer."</em>
                  </p>

                  <div className="mt-4 pt-4 border-t border-white/5 flex flex-col gap-4">
                    <span className="text-[0.65rem] uppercase tracking-widest text-accent font-semibold">Superior {name}'s Directives:</span>
                    <ul className="text-xs font-light text-text/80 space-y-3 pl-0 list-none m-0">
                      <li className="flex items-start gap-3">
                        <ChevronRight size={14} className="text-accent shrink-0 mt-0.5" />
                        <span><strong>What would Superior {name} do next?</strong> Choose the proactive path, not the reactive loop.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <ChevronRight size={14} className="text-accent shrink-0 mt-0.5" />
                        <span><strong>What aligns with the person you want to become?</strong> Invest in actions that pay compound interest to your character.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* ACTION CENTER */}
            <div className="bg-white/5 border border-white/10 rounded-squircle-lg p-6 md:p-10 shadow-xl flex flex-col gap-6">
              <div className="flex flex-col gap-1">
                <span className="text-[0.65rem] uppercase tracking-widest text-accent font-bold">Action Center</span>
                <h3 className="text-xl font-light tracking-tight text-text">Choose your next conscious action</h3>
                <p className="text-xs text-dim font-light">Ground yourself and anchor your focus in the real world.</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <button
                  onClick={() => {
                    setActiveAction('timer');
                    setFocusTimer(1500);
                    setTimerRunning(false);
                  }}
                  className={`flex flex-col items-center justify-center p-4 border rounded-squircle-md text-center transition-all cursor-pointer ${
                    activeAction === 'timer' ? 'bg-accent/15 border-accent text-accent' : 'bg-white/5 border-white/10 text-dim hover:text-text hover:bg-white/10'
                  }`}
                >
                  <Clock className="mb-2" size={24} />
                  <span className="text-xs font-light uppercase tracking-widest">Focus Session</span>
                </button>

                <button
                  onClick={() => setActiveAction('walk')}
                  className={`flex flex-col items-center justify-center p-4 border rounded-squircle-md text-center transition-all cursor-pointer ${
                    activeAction === 'walk' ? 'bg-accent/15 border-accent text-accent' : 'bg-white/5 border-white/10 text-dim hover:text-text hover:bg-white/10'
                  }`}
                >
                  <Footprints className="mb-2" size={24} />
                  <span className="text-xs font-light uppercase tracking-widest">Take a Walk</span>
                </button>

                <button
                  onClick={() => setActiveAction('music')}
                  className={`flex flex-col items-center justify-center p-4 border rounded-squircle-md text-center transition-all cursor-pointer ${
                    activeAction === 'music' ? 'bg-accent/15 border-accent text-accent' : 'bg-white/5 border-white/10 text-dim hover:text-text hover:bg-white/10'
                  }`}
                >
                  <Music className="mb-2" size={24} />
                  <span className="text-xs font-light uppercase tracking-widest">Listen to Music</span>
                </button>

                <button
                  onClick={() => setActiveAction('water')}
                  className={`flex flex-col items-center justify-center p-4 border rounded-squircle-md text-center transition-all cursor-pointer ${
                    activeAction === 'water' ? 'bg-accent/15 border-accent text-accent' : 'bg-white/5 border-white/10 text-dim hover:text-text hover:bg-white/10'
                  }`}
                >
                  <Droplet className="mb-2" size={24} />
                  <span className="text-xs font-light uppercase tracking-widest">Drink Water</span>
                </button>

                <button
                  onClick={handleStartAscent}
                  className="flex flex-col items-center justify-center p-4 bg-white/5 border border-white/10 rounded-squircle-md text-center transition-all cursor-pointer hover:bg-white/10 text-dim hover:text-text col-span-2 md:col-span-1"
                >
                  <RotateCcw className="mb-2" size={24} />
                  <span className="text-xs font-light uppercase tracking-widest">Restart Ascent</span>
                </button>
              </div>

              {/* Action content panels */}
              {activeAction && (
                <div className="mt-4 p-6 bg-white/[0.02] border border-white/5 rounded-squircle-md animate-fadeIn">
                  
                  {activeAction === 'timer' && (
                    <div className="flex flex-col items-center text-center gap-4">
                      <span className="text-xs uppercase tracking-widest text-accent font-semibold">Focus Session Timer (Pomodoro)</span>
                      <h4 className="text-5xl md:text-6xl font-thin tracking-tighter text-text">
                        {formatTimer(focusTimer)}
                      </h4>
                      <div className="flex gap-4">
                        <button
                          onClick={() => setTimerRunning(!timerRunning)}
                          className="px-6 py-2.5 bg-accent text-bg font-semibold rounded-squircle-sm hover:bg-indicator transition-all"
                        >
                          {timerRunning ? 'Pause' : 'Start'}
                        </button>
                        <button
                          onClick={() => {
                            setTimerRunning(false);
                            setFocusTimer(1500);
                          }}
                          className="px-6 py-2.5 border border-white/15 text-dim rounded-squircle-sm hover:bg-white/5 transition-all"
                        >
                          Reset
                        </button>
                      </div>
                      <p className="text-xs text-dim/60 font-light mt-1">Focus on a single, intentional task for 25 minutes. No multi-tasking, no checking notifications.</p>
                    </div>
                  )}

                  {activeAction === 'walk' && (
                    <div className="flex flex-col gap-2">
                      <span className="text-xs uppercase tracking-widest text-accent font-semibold">Intentional Mindful Walking</span>
                      <p className="text-sm font-light text-dim leading-relaxed">
                        Step away from your screen. Step outside if possible. Walk slowly for 5 to 10 minutes.
                      </p>
                      <ul className="text-xs font-light text-text/80 space-y-2 mt-2 list-none p-0">
                        <li className="flex items-center gap-2">
                          <ChevronRight size={14} className="text-accent" />
                          <span>Notice the contact of the soles of your feet with the ground.</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <ChevronRight size={14} className="text-accent" />
                          <span>Observe 3 things you can see, 2 you can hear, and 1 you can touch.</span>
                        </li>
                      </ul>
                    </div>
                  )}

                  {activeAction === 'music' && (
                    <div className="flex flex-col gap-2 text-center items-center py-4">
                      <Music className="text-accent animate-pulse w-8 h-8 mb-2" />
                      <span className="text-xs uppercase tracking-widest text-accent font-semibold">Soundscape Grounding</span>
                      <p className="text-sm font-light text-dim leading-relaxed max-w-md">
                        Listen to slow-tempo, ambient, or classical music. Close your eyes and follow the flow of a single instrument. Let thoughts drift by like clouds.
                      </p>
                    </div>
                  )}

                  {activeAction === 'water' && (
                    <div className="flex flex-col gap-2">
                      <span className="text-xs uppercase tracking-widest text-accent font-semibold">Hydration Awareness Ritual</span>
                      <p className="text-sm font-light text-dim leading-relaxed">
                        Pour a glass of water. Drink it slowly and mindfully.
                      </p>
                      <ul className="text-xs font-light text-text/80 space-y-2 mt-2 list-none p-0">
                        <li className="flex items-center gap-2">
                          <ChevronRight size={14} className="text-accent" />
                          <span>Feel the coolness of the water as it touches your lips and moves down your throat.</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <ChevronRight size={14} className="text-accent" />
                          <span>Contemplate how this simple nourishment cleanses and sustains your system.</span>
                        </li>
                      </ul>
                    </div>
                  )}
                  
                </div>
              )}
            </div>

            {/* Back button */}
            <div className="flex justify-center mt-4">
              <button
                onClick={() => navigate('/')}
                className="px-8 py-3 bg-white/5 border border-white/10 text-dim uppercase tracking-widest text-xs hover:text-white hover:bg-white/10 rounded-full transition-all cursor-pointer"
              >
                Return to Dashboard
              </button>
            </div>
            
          </div>
        )}
        
      </div>
    </div>
  );
}

export default ChakraAscent;
