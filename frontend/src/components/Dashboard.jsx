import { lazy, Suspense, useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Clock, Trophy, Wind, PictureInPicture2, Save } from 'lucide-react';
import DailyProgress from './DailyProgress';
import ConsciousEating from './ConsciousEating';
import ConsciousWalking from './ConsciousWalking';
import { Card, Button, Modal, Textarea } from './common';
const WeeklyGraph = lazy(() => import('./WeeklyGraph'));

function Dashboard({ historyStats, methods, openMethodModal, challengeActive, challengeStartDate, startChallenge, refreshStats, saveHistory }) {
  const navigate = useNavigate();

  const lastSessions = historyStats.lastSessions || [];

  // Freestyle PiP Logic
  const pipCanvasRef = useRef(null);
  const pipVideoRef = useRef(null);
  const [isFreestyleActive, setIsFreestyleActive] = useState(false);
  const freestyleStateRef = useRef({
    active: false,
    startTime: 0,
    countdown: 3
  });
  const workerRef = useRef(null);

  // Summary Modal State
  const [showSummary, setShowSummary] = useState(false);
  const [freestyleDuration, setFreestyleDuration] = useState(0);
  const [sessionRating, setSessionRating] = useState(0);
  const [currentNote, setCurrentNote] = useState('');
  const [showNotesInput, setShowNotesInput] = useState(false);

  // Worker for accurate background tracking
  useEffect(() => {
    const blob = new Blob([`
      let t;
      self.onmessage = function(e) {
        if (e.data === 'start') {
          t = setInterval(() => postMessage('tick'), 1000);
        } else if (e.data === 'stop') {
          clearInterval(t);
        }
      };
    `], { type: 'application/javascript' });
    workerRef.current = new Worker(URL.createObjectURL(blob));

    workerRef.current.onmessage = () => {
      const state = freestyleStateRef.current;
      if (!state.active) return;
      
      if (state.countdown > 0) {
        state.countdown -= 1;
      }
    };

    return () => workerRef.current.terminate();
  }, []);

  // PiP Canvas Rendering Loop
  useEffect(() => {
    if (!pipCanvasRef.current || !pipVideoRef.current) return;
    const canvas = pipCanvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = 300;
    canvas.height = 300;

    let rafId;

    const renderPip = () => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const state = freestyleStateRef.current;
      
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      if (!state.active) {
        ctx.font = '300 24px sans-serif';
        ctx.fillText('FREESTYLE', canvas.width / 2, canvas.height / 2);
      } else if (state.countdown > 0) {
        ctx.font = '300 24px sans-serif';
        ctx.fillText('GET READY', canvas.width / 2, canvas.height / 2 - 30);
        ctx.font = '600 56px sans-serif';
        ctx.fillText(state.countdown.toString(), canvas.width / 2, canvas.height / 2 + 20);
      } else {
        ctx.font = '300 28px sans-serif';
        ctx.fillText('Session in', canvas.width / 2, canvas.height / 2 - 15);
        ctx.fillText('progress', canvas.width / 2, canvas.height / 2 + 25);
      }
    };

    renderPip();
    rafId = setInterval(renderPip, 1000 / 30);

    if (!pipVideoRef.current.srcObject) {
      pipVideoRef.current.srcObject = canvas.captureStream(30);
    }

    return () => clearInterval(rafId);
  }, []);

  const stopFreestyle = async () => {
    const state = freestyleStateRef.current;
    if (!state.active) return;

    const duration = state.countdown > 0 ? 0 : Math.floor((Date.now() - state.startTime) / 1000) - 3;
    
    state.active = false;
    setIsFreestyleActive(false);
    workerRef.current.postMessage('stop');

    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture().catch(console.error);
    }

    if (duration > 0 && saveHistory) {
      setFreestyleDuration(duration);
      setSessionRating(0);
      setCurrentNote('');
      setShowNotesInput(false);
      setShowSummary(true);
    }
  };

  const handleSaveSession = async () => {
    if (saveHistory) {
      await saveHistory(freestyleDuration, 'Freestyle', currentNote, 0, 0, sessionRating, 0, 0, 0, 0);
      if (refreshStats) refreshStats();
    }
    setShowSummary(false);
  };

  const startFreestyle = async () => {
    if (!pipVideoRef.current) return;

    freestyleStateRef.current = {
      active: true,
      startTime: Date.now(),
      countdown: 3
    };
    setIsFreestyleActive(true);
    workerRef.current.postMessage('start');

    try {
      const playPromise = pipVideoRef.current.play();
      if (playPromise !== undefined) playPromise.catch(console.error);

      if (pipVideoRef.current.requestPictureInPicture) {
        await pipVideoRef.current.requestPictureInPicture();
      } else if (pipVideoRef.current.webkitSetPresentationMode) {
        pipVideoRef.current.webkitSetPresentationMode('picture-in-picture');
      }

      if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('pause', stopFreestyle);
        navigator.mediaSession.setActionHandler('stop', stopFreestyle);
      }
    } catch (err) {
      console.error("PiP failed", err);
      stopFreestyle();
    }
  };

  const formatTime = (seconds) => {
    const minutes = seconds / 60;
    if (minutes === 0) return { total: 0, unit: 'mins' };
    const total = minutes % 1 === 0 ? minutes : parseFloat(minutes.toFixed(1));
    return { total, unit: 'mins' };
  };

  const formatSessionDuration = (session) => {
    if (session.pattern?.startsWith('Conscious')) {
      const mins = Math.round(session.duration / 60);
      return `${mins} minute${mins !== 1 ? 's' : ''}`;
    }
    return `${session.duration}s`;
  };

  // Calculate Stats using historyStats from backend
  const challengeStats = challengeActive ? (Object.values(historyStats.practicedDates || {})
    .filter(duration => duration >= 1800).length) : 0;

  const stats = challengeActive ? [
    {
      label: 'Total Conscious Time',
      ...formatTime(historyStats.totalSeconds),
      color: 'text-accent'
    },
    {
      label: 'Unlearning Streak',
      total: Math.min(challengeStats, 30),
      color: 'text-text',
      unit: '/ 30 days'
    },
    {
      label: 'COOLDOWN TIME',
      ...formatTime(historyStats.totalCooldownSeconds || 0),
      color: 'text-accent'
    },
    {
      label: 'Total AUMs',
      total: historyStats.totalAums,
      color: 'text-accent',
      unit: 'chants'
    }
  ] : [
    {
      label: 'Total Conscious Time',
      ...formatTime(historyStats.overallDuration),
      color: 'text-accent'
    },
    {
      label: 'Completed Sessions',
      total: historyStats.totalSessions || 0,
      color: 'text-text',
      unit: 'sessions'
    },
    {
      label: 'COOLDOWN TIME',
      ...formatTime(historyStats.totalCooldownSeconds || 0),
      color: 'text-accent'
    },
    {
      label: 'Total AUMs',
      total: historyStats.totalAums || 0,
      color: 'text-accent',
      unit: 'chants'
    }
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleBeginClick = () => {
    openMethodModal();
  };

  const greeting = getGreeting();

  return (
    <div className="w-full max-w-7xl md:max-w-[1400px] py-4 md:py-8 px-4 md:px-8 relative isolate">
      {/* Hidden PiP Elements */}
      <canvas ref={pipCanvasRef} style={{ position: 'fixed', bottom: 0, right: 0, width: '300px', height: '300px', zIndex: -9999, pointerEvents: 'none', opacity: 0.001 }} />
      <video ref={pipVideoRef} muted playsInline autoPlay style={{ position: 'fixed', bottom: 0, right: 0, width: '300px', height: '300px', zIndex: -9999, pointerEvents: 'none', opacity: 0.001 }} />
      
      {/* Background Blob Mesh (Atmospheric Layer) - Optimized with radial gradients, no blur filters */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
        <div 
          className="absolute top-[-10%] left-[-10%] w-[120vw] h-[120vw] md:w-[80vw] md:h-[80vw]" 
          style={{ 
            background: 'radial-gradient(circle, var(--color-accent) 0%, transparent 70%)', 
            opacity: 0.05,
            willChange: 'transform',
            transform: 'translate3d(0,0,0)'
          }} 
        />
        <div 
          className="absolute bottom-[-10%] right-[-10%] w-[100vw] h-[100vw] md:w-[70vw] md:h-[70vw]" 
          style={{ 
            background: 'radial-gradient(circle, var(--color-accent) 0%, transparent 70%)', 
            opacity: 0.03,
            willChange: 'transform',
            transform: 'translate3d(0,0,0)'
          }} 
        />
        <div 
          className="absolute top-[40%] right-[-5%] w-[80vw] h-[80vw]" 
          style={{ 
            background: 'radial-gradient(circle, #3f51b5 0%, transparent 70%)', 
            opacity: 0.025,
            willChange: 'transform',
            transform: 'translate3d(0,0,0)'
          }} 
        />
      </div>

      <header className="mb-10 md:mb-16 relative z-10">
        <h1 className="text-4xl md:text-7xl font-thin tracking-tight mb-4">{greeting}</h1>
        <p className="text-lg md:text-xl font-light text-dim tracking-wide">
          {challengeActive ? 'You are on your 30-day journey.' : 'Find your center and breathe.'}
        </p>
      </header>

      {!challengeActive ? (
        /* Full-Width "Start Challenge" Banner Only when challenge not active */
        <div className="w-full max-w-4xl mx-auto relative z-10 mt-8 animate-fadeIn">
          <Card 
            as="section" 
            variant="accent" 
            padding="lg" 
            className="overflow-hidden group animate-card-breath-glow"
          >
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 py-4">
              <div className="text-center md:text-left flex-1">
                <div className="flex items-center gap-3 mb-4 justify-center md:justify-start">
                  <Trophy className="text-accent animate-trophy-glow" size={28} />
                  <h2 className="text-2xl md:text-3xl font-light tracking-tight">The Unlearn Yourself Challenge</h2>
                </div>
                <p className="text-base font-light text-text/80 leading-relaxed max-w-xl">
                  30 days of consistency, 30 minutes of deep presence. 
                  <span className="block mt-2 italic text-accent/80">"Your future self is waiting for you to click this button."</span>
                </p>
              </div>
              
              <Button 
                variant="primary"
                size="none"
                className="min-w-[200px] md:min-w-[240px] py-5 text-base shadow-[0_0_30px_rgba(var(--color-accent-rgb),0.3)] hover:scale-102 transition-all duration-500 flex items-center justify-center gap-2"
                onClick={startChallenge}
              >
                <Play size={16} fill="currentColor" />
                Start Challenge
              </Button>
            </div>
          </Card>
        </div>
      ) : (
        /* Full Asymmetric Grid Layout when challenge is active */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10 relative z-10">
          
          {/* Left Column (2/3 width on desktop) - Breathing CTA, Analytics, Metrics, and Rituals */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            
            {/* Ready to Begin Banner */}
            <Card 
              as="section" 
              variant="default" 
              padding="lg" 
            >
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="text-center md:text-left">
                  <h2 className="text-2xl font-light mb-2 tracking-tight">Ready to Begin?</h2>
                  <p className="text-sm font-light text-text/80 leading-relaxed">
                    Start your breathing journey with your selected method and find instant clarity.
                  </p>
                </div>
                <Button 
                  variant="primary"
                  className="min-w-[200px] md:min-w-[240px] py-4"
                  onClick={handleBeginClick}
                >
                  <Play size={16} fill="currentColor" />
                  Begin Breathing
                </Button>
              </div>
            </Card>

            {/* Flow Graph */}
            <Suspense fallback={
              <Card variant="flat" padding="md" className="h-[240px] flex items-center justify-center text-dim text-xs tracking-widest uppercase animate-pulse">
                Loading Flow Graph...
              </Card>
            }>
              <WeeklyGraph practicedDates={historyStats.practicedDates || {}} challengeStartDate={challengeStartDate} />
            </Suspense>

            {/* Core Telemetry Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {stats.map((stat, i) => (
                <Card 
                  key={i} 
                  variant="hoverable" 
                  padding="sm" 
                  className="flex flex-col justify-between h-32 relative overflow-hidden"
                >
                  <span className="text-[0.65rem] uppercase tracking-widest text-dim font-medium">{stat.label}</span>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className={`text-3xl md:text-4xl font-extralight tracking-tight ${stat.color || 'text-text'}`}>
                      {stat.total}
                    </span>
                    {stat.unit && (
                      <span className="text-xs font-light text-dim lowercase">{stat.unit}</span>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {/* Daily Rituals (Activity Hub) */}
            <div>
              <h2 className="text-xs uppercase tracking-[0.25rem] text-dim mb-6 pl-2 font-medium">Daily Rituals</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ConsciousEating refreshStats={refreshStats} />
                <ConsciousWalking refreshStats={refreshStats} />
              </div>
            </div>

          </div>

          {/* Right Column (1/3 width on desktop) - Streaks, Quick Start, and Recent History */}
          <div className="lg:col-span-1 flex flex-col gap-8">

            {/* Daily Progress Calendar */}
            <Card 
              as="section" 
              variant="hoverable" 
              padding="lg" 
              className="min-h-[300px]"
            >
              <DailyProgress 
                practicedDates={historyStats.practicedDates || {}} 
                challengeStartDate={challengeStartDate}
              />
            </Card>

            {/* Breathing Techniques Quick Start Card */}
            <Card 
              as="section" 
              variant="hoverable" 
              padding="lg" 
              className="flex flex-col gap-6"
            >
              <div className="flex items-center gap-2">
                <Wind size={16} className="text-accent" />
                <h3 className="text-xs uppercase tracking-[0.25rem] text-dim font-medium">Quick Start Practices</h3>
              </div>
              
              <div className="flex flex-col gap-3">
                {Object.entries(methods).map(([key, method]) => {
                  const routeMap = {
                    '478': '/practice/4-7-8',
                    'box': '/practice/box',
                    'chakraAscent': '/practice/chakra-ascent',
                    'completeBreath': '/practice/complete-breath',
                    'resonance': '/practice/resonance',
                    'aum': '/practice/aum'
                  };
                  
                  return (
                    <button 
                      key={key}
                      onClick={() => navigate(routeMap[key] || '/')}
                      className="w-full text-left p-3.5 rounded-xl bg-white/5 border border-white/5 hover:border-accent/30 hover:bg-accent/5 hover:scale-[1.01] transition-all duration-300 group flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-light text-text group-hover:text-accent transition-colors">{method.name}</span>
                        <span className="text-[0.65rem] text-dim font-mono mt-1">
                          {key === 'chakraAscent' ? 'Guided Chakra Journey' : `${method.pattern.join('-')}s Pattern`}
                        </span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-accent group-hover:text-bg transition-all duration-300 flex items-center justify-center flex-shrink-0 text-text">
                        <Play size={12} fill="currentColor" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* Freestyle Dedicated PiP */}
            <Card 
              as="section" 
              variant="accent" 
              padding="lg" 
              className="flex flex-col gap-4 overflow-hidden relative group"
            >
              <div className="flex items-center gap-2 relative z-10">
                <PictureInPicture2 size={18} className="text-accent group-hover:scale-110 transition-transform" />
                <h3 className="text-sm uppercase tracking-widest font-medium">Freestyle</h3>
              </div>
              <p className="text-xs text-text/80 font-light relative z-10">
                A dedicated unguided session in a floating window. No numbers, no instructions. Just breathe.
              </p>
              <Button 
                variant="primary"
                className="w-full py-4 mt-2 relative z-10 flex items-center justify-center gap-2"
                onClick={isFreestyleActive ? stopFreestyle : startFreestyle}
              >
                {isFreestyleActive ? (
                  <>
                    <Clock size={16} fill="currentColor" />
                    End Session
                  </>
                ) : (
                  <>
                    <Play size={16} fill="currentColor" />
                    Begin Session
                  </>
                )}
              </Button>
            </Card>


          </div>
          
        </div>
      )}

      {/* Freestyle Summary Modal */}
      <Modal
        isOpen={showSummary}
        onClose={() => {}} // Force user to use buttons
        maxWidth="md"
        zIndex="z-[100]"
        backdropBlur="sm"
      >
        <div className="flex flex-col items-center text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-thin tracking-tight mb-2">Session Complete</h2>
          <p className="text-dim text-sm tracking-wide">Freestyle breathing</p>
        </div>

        <div className="flex justify-center gap-4 mb-8 text-sm md:text-base font-light tracking-widest uppercase">
          <span>{freestyleDuration}s</span>
          <span className="opacity-20 text-[0.6rem]">•</span>
          <span>Freestyle</span>
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
            onClick={handleSaveSession}
            disabled={sessionRating === 0}
            variant="primary"
            size="none"
            className="w-full py-4 font-medium flex items-center justify-center gap-2"
          >
            <Save size={18} />
            <span>Save Journey</span>
          </Button>
          <Button 
            onClick={() => setShowSummary(false)} 
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

export default Dashboard;

