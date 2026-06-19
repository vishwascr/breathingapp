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
      const frequencies = [144, 162, 180, 216, 240, 270, 324];
      const toneFreq = frequencies[chakraIndex] || 180;
      playBowlSound(toneFreq, 'sine', 4);
    } else if (stage === 'complete') {
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
      playBowlSound(440, 'triangle', 4); 
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
      className="w-full h-full flex flex-col pt-4 pb-24 px-6 md:pt-12 md:pb-12 relative bg-[var(--color-bg)] select-none"
      style={{
        background: `radial-gradient(circle at center, ${stage === 'meditating' ? activeChakra.colorClasses.glowColor : 'rgba(255,255,255,0.01)'} 0%, rgba(0,0,0,0) 70%)`
      }}
    >
      {/* Header toolbar matching Practice.jsx */}
      <header className="w-full max-w-5xl mx-auto mb-4 md:mb-6 flex justify-between items-start shrink-0 z-20">
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
        
        <button 
          onClick={() => setSoundEnabled(prev => !prev)}
          className="p-3 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 text-dim transition-all flex items-center justify-center cursor-pointer shrink-0"
          title={soundEnabled ? "Mute Bowl" : "Unmute Bowl"}
        >
          {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>
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
          <div className="flex-1 flex flex-col items-center justify-center gap-4 md:gap-12 w-full max-w-5xl mx-auto min-h-0">
            
            {/* Pulsing Breathing Ring matching size/layout in Practice.jsx */}
            <div className="relative w-[250px] h-[250px] md:w-[450px] md:h-[450px] flex justify-center items-center shrink-0">
              {/* Outer pulsing energy field */}
              <div 
                className={`absolute inset-0 rounded-full transition-transform ease-linear border border-white/5 backdrop-blur-[2px] ${
                  isInhaling ? 'scale-[1.8] duration-[5000ms]' : 'scale-100 duration-[5000ms]'
                }`}
                style={{
                  boxShadow: `0 0 50px 10px ${activeChakra.colorClasses.glowColor}`,
                  backgroundColor: `${activeChakra.colorClasses.glowColor.replace('0.2', '0.05')}`
                }}
              ></div>
              
              {/* Center solid core ring */}
              <div 
                className={`absolute w-28 h-28 md:w-44 md:h-44 rounded-full flex flex-col justify-center items-center text-center font-extralight border border-white/10 z-10 transition-all duration-[5000ms] ease-linear bg-black/50 ${
                  isInhaling ? 'scale-110' : 'scale-90'
                }`}
                style={{
                  boxShadow: `inset 0 0 30px ${activeChakra.colorClasses.glowColor}`
                }}
              >
                <span className={`text-[0.65rem] uppercase tracking-widest font-bold opacity-65 ${activeChakra.colorClasses.accent}`}>
                  {activeChakra.mantra}
                </span>
                <span className="text-3xl md:text-5xl font-light mt-1">{secondsLeft}</span>
                <span className="text-[0.55rem] uppercase tracking-widest opacity-40 mt-1">
                  {isInhaling ? 'Inhale' : 'Exhale'}
                </span>
              </div>
            </div>

            {/* Inquiries and Input Stack matching Practice.jsx text stack */}
            <div className="flex flex-col items-center w-full max-w-xl mx-auto gap-4 md:gap-8 mb-2 md:mb-0">
              
              {/* Unified Vertical Stack - Space Reserved */}
              <div className="flex flex-col items-center text-center gap-2 min-h-[140px] md:min-h-[180px] justify-center">
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
              <div className="w-full max-w-md px-4">
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Type your reflection... (or leave blank to reflect in silence)"
                  className="w-full bg-white/5 backdrop-blur-sm border border-white/10 focus:border-accent text-text p-4 rounded-squircle-md text-center text-sm md:text-base focus:outline-none resize-none transition-all placeholder:text-dim/20"
                  rows={2}
                />
              </div>

              {/* Action Button */}
              <button 
                onClick={handleNextStep} 
                className="btn-primary text-base md:text-lg font-light tracking-widest flex items-center gap-3 shrink-0"
              >
                <span>{responseText.trim() === '' ? 'Reflect in Silence' : 'Save & Continue'}</span>
                <ChevronRight size={18} />
              </button>
              
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

        {/* STAGE 4: COMPLETE SUMMARY */}
        {stage === 'complete' && (
          <div className="w-full flex flex-col gap-8 md:gap-12 animate-fadeIn max-w-4xl mx-auto py-6">
            
            {/* Ascent Complete Header */}
            <div className="text-center flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-accent/15 flex items-center justify-center animate-trophy-glow">
                <CheckCircle2 className="text-accent w-8 h-8" />
              </div>
              <h1 className="text-3xl md:text-5xl font-thin tracking-widest text-text mt-2 font-extralight">Ascent Accomplished</h1>
              <p className="text-sm md:text-base text-dim font-light max-w-lg mx-auto leading-relaxed">
                You have traversed the seven gates. Your breathing is slow, your mind has gained altitude, and you stand as the clear observer of your impulses.
              </p>
            </div>

            {/* Current Self vs Superior Self Card */}
            <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-squircle-lg p-6 md:p-8 shadow-xl flex flex-col gap-6">
              <div className="border-b border-white/5 pb-3 flex justify-between items-center">
                <h3 className="text-lg font-light tracking-tight text-text">Current Self vs Superior Self</h3>
                <span className="text-[0.6rem] uppercase tracking-widest bg-accent/15 text-accent border border-accent/20 px-2 py-0.5 rounded-full font-bold">Dual Aspect reflection</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Column 1: Current Impulse / Mind State */}
                <div className="flex flex-col gap-3 bg-white/[0.01] border border-white/5 rounded-squircle-md p-5">
                  <span className="text-[0.65rem] uppercase tracking-widest text-rose-400 font-bold">Current Self / The Impulse</span>
                  <p className="text-xs font-light text-dim leading-relaxed">
                    Feels the immediate push of cravings, overthinking, anxiety, or procrastination. Reacts to external triggers. Views impulses as part of identity.
                  </p>
                  
                  <div className="mt-2 pt-3 border-t border-white/5">
                    <span className="text-[0.6rem] uppercase tracking-widest text-dim/60 block mb-2 font-bold">Your session reflections:</span>
                    <div className="max-h-[180px] overflow-y-auto pr-2 custom-scrollbar space-y-3">
                      {answers.map((ans, idx) => (
                        <div key={idx} className="text-[0.7rem] font-light border-b border-white/5 pb-2">
                          <span className="text-accent block text-[0.6rem] uppercase tracking-widest font-semibold mb-0.5">{ans.chakra}</span>
                          <p className="text-dim/80 mb-0.5 italic">Q: "{ans.question}"</p>
                          <p className="text-text font-normal">A: "{ans.response}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Column 2: Superior Self */}
                <div className="flex flex-col gap-3 bg-white/[0.02] border border-accent/15 rounded-squircle-md p-5">
                  <span className="text-[0.65rem] uppercase tracking-widest text-accent font-bold">Superior Self / The Observer</span>
                  <p className="text-xs font-light text-dim leading-relaxed">
                    Watches the waves of impulse arise and fall without action. Decides intentionally. Recognizes: <em>"I am not my impulses. I am the observer."</em>
                  </p>

                  <div className="mt-2 pt-3 border-t border-white/5 flex flex-col gap-3">
                    <span className="text-[0.65rem] uppercase tracking-widest text-accent font-semibold">Superior {name}'s Directives:</span>
                    <ul className="text-[0.7rem] font-light text-text/80 space-y-2 pl-0 list-none m-0">
                      <li className="flex items-start gap-2">
                        <ChevronRight size={12} className="text-accent shrink-0 mt-0.5" />
                        <span><strong>What would Superior {name} do next?</strong> Choose the proactive path, not the reactive loop.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight size={12} className="text-accent shrink-0 mt-0.5" />
                        <span><strong>What action aligns with the person you want to become?</strong> Invest in actions that pay compound interest to your character.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* ACTION CENTER */}
            <div className="bg-white/5 border border-white/10 rounded-squircle-lg p-6 md:p-8 shadow-xl flex flex-col gap-4">
              <div className="flex flex-col gap-0.5">
                <span className="text-[0.65rem] uppercase tracking-widest text-accent font-bold">Action Center</span>
                <h3 className="text-lg font-light tracking-tight text-text">Choose your next conscious action</h3>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <button
                  onClick={() => {
                    setActiveAction(activeAction === 'timer' ? null : 'timer');
                    setFocusTimer(1500);
                    setTimerRunning(false);
                  }}
                  className={`flex flex-col items-center justify-center p-3 border rounded-squircle-sm text-center transition-all cursor-pointer ${
                    activeAction === 'timer' ? 'bg-accent/15 border-accent text-accent' : 'bg-white/5 border-white/10 text-dim hover:text-text hover:bg-white/10'
                  }`}
                >
                  <Clock className="mb-1" size={20} />
                  <span className="text-[0.6rem] font-light uppercase tracking-widest">Focus</span>
                </button>

                <button
                  onClick={() => setActiveAction(activeAction === 'walk' ? null : 'walk')}
                  className={`flex flex-col items-center justify-center p-3 border rounded-squircle-sm text-center transition-all cursor-pointer ${
                    activeAction === 'walk' ? 'bg-accent/15 border-accent text-accent' : 'bg-white/5 border-white/10 text-dim hover:text-text hover:bg-white/10'
                  }`}
                >
                  <Footprints className="mb-1" size={20} />
                  <span className="text-[0.6rem] font-light uppercase tracking-widest">Walk</span>
                </button>

                <button
                  onClick={() => setActiveAction(activeAction === 'music' ? null : 'music')}
                  className={`flex flex-col items-center justify-center p-3 border rounded-squircle-sm text-center transition-all cursor-pointer ${
                    activeAction === 'music' ? 'bg-accent/15 border-accent text-accent' : 'bg-white/5 border-white/10 text-dim hover:text-text hover:bg-white/10'
                  }`}
                >
                  <Music className="mb-1" size={20} />
                  <span className="text-[0.6rem] font-light uppercase tracking-widest">Music</span>
                </button>

                <button
                  onClick={() => setActiveAction(activeAction === 'water' ? null : 'water')}
                  className={`flex flex-col items-center justify-center p-3 border rounded-squircle-sm text-center transition-all cursor-pointer ${
                    activeAction === 'water' ? 'bg-accent/15 border-accent text-accent' : 'bg-white/5 border-white/10 text-dim hover:text-text hover:bg-white/10'
                  }`}
                >
                  <Droplet className="mb-1" size={20} />
                  <span className="text-[0.6rem] font-light uppercase tracking-widest">Water</span>
                </button>

                <button
                  onClick={handleStartAscent}
                  className="flex flex-col items-center justify-center p-3 bg-white/5 border border-white/10 rounded-squircle-sm text-center transition-all cursor-pointer hover:bg-white/10 text-dim hover:text-text col-span-2 md:col-span-1"
                >
                  <RotateCcw className="mb-1" size={20} />
                  <span className="text-[0.6rem] font-light uppercase tracking-widest">Restart</span>
                </button>
              </div>

              {/* Action content panels */}
              {activeAction && (
                <div className="mt-2 p-5 bg-white/[0.02] border border-white/5 rounded-squircle-md animate-fadeIn">
                  
                  {activeAction === 'timer' && (
                    <div className="flex flex-col items-center text-center gap-3">
                      <span className="text-[0.65rem] uppercase tracking-widest text-accent font-semibold">Focus Session Timer (Pomodoro)</span>
                      <h4 className="text-4xl md:text-5xl font-thin tracking-tighter text-text">
                        {formatTimer(focusTimer)}
                      </h4>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setTimerRunning(!timerRunning)}
                          className="px-5 py-2 bg-accent text-bg font-semibold rounded-squircle-sm hover:bg-indicator transition-all text-xs"
                        >
                          {timerRunning ? 'Pause' : 'Start'}
                        </button>
                        <button
                          onClick={() => {
                            setTimerRunning(false);
                            setFocusTimer(1500);
                          }}
                          className="px-5 py-2 border border-white/15 text-dim rounded-squircle-sm hover:bg-white/5 transition-all text-xs"
                        >
                          Reset
                        </button>
                      </div>
                      <p className="text-[0.7rem] text-dim/60 font-light mt-1">Focus on a single, intentional task for 25 minutes. No multi-tasking, no checking notifications.</p>
                    </div>
                  )}

                  {activeAction === 'walk' && (
                    <div className="flex flex-col gap-1">
                      <span className="text-[0.65rem] uppercase tracking-widest text-accent font-semibold">Intentional Mindful Walking</span>
                      <p className="text-xs font-light text-dim leading-relaxed">
                        Step away from your screen. Step outside if possible. Walk slowly for 5 to 10 minutes.
                      </p>
                      <ul className="text-[0.7rem] font-light text-text/80 space-y-1.5 mt-2 list-none p-0">
                        <li className="flex items-center gap-2">
                          <ChevronRight size={12} className="text-accent" />
                          <span>Notice the contact of the soles of your feet with the ground.</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <ChevronRight size={12} className="text-accent" />
                          <span>Observe 3 things you can see, 2 you can hear, and 1 you can touch.</span>
                        </li>
                      </ul>
                    </div>
                  )}

                  {activeAction === 'music' && (
                    <div className="flex flex-col gap-1 text-center items-center py-2">
                      <Music className="text-accent animate-pulse w-6 h-6 mb-1" />
                      <span className="text-[0.65rem] uppercase tracking-widest text-accent font-semibold">Soundscape Grounding</span>
                      <p className="text-xs font-light text-dim leading-relaxed max-w-md">
                        Listen to slow-tempo, ambient, or classical music. Close your eyes and follow the flow of a single instrument. Let thoughts drift by like clouds.
                      </p>
                    </div>
                  )}

                  {activeAction === 'water' && (
                    <div className="flex flex-col gap-1">
                      <span className="text-[0.65rem] uppercase tracking-widest text-accent font-semibold">Hydration Awareness Ritual</span>
                      <p className="text-xs font-light text-dim leading-relaxed">
                        Pour a glass of water. Drink it slowly and mindfully.
                      </p>
                      <ul className="text-[0.7rem] font-light text-text/80 space-y-1.5 mt-2 list-none p-0">
                        <li className="flex items-center gap-2">
                          <ChevronRight size={12} className="text-accent" />
                          <span>Feel the coolness of the water as it touches your lips and moves down your throat.</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <ChevronRight size={12} className="text-accent" />
                          <span>Contemplate how this simple nourishment cleanses and sustains your system.</span>
                        </li>
                      </ul>
                    </div>
                  )}
                  
                </div>
              )}
            </div>

            {/* Return to Dashboard */}
            <div className="flex justify-center mt-2">
              <button
                onClick={() => navigate('/')}
                className="px-8 py-3 bg-white/5 border border-white/10 text-dim uppercase tracking-widest text-[0.65rem] hover:text-white hover:bg-white/10 rounded-full transition-all cursor-pointer"
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
