import { lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Clock, Trophy, Wind } from 'lucide-react';
import DailyProgress from './DailyProgress';
import ConsciousEating from './ConsciousEating';
import ConsciousWalking from './ConsciousWalking';
import { Card, Button } from './common';
const WeeklyGraph = lazy(() => import('./WeeklyGraph'));

function Dashboard({ historyStats, methods, openMethodModal, challengeActive, challengeStartDate, startChallenge, refreshStats }) {
  const navigate = useNavigate();

  const lastSessions = historyStats.lastSessions || [];

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
              <WeeklyGraph practicedDates={historyStats.practicedDates || {}} />
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

            {/* Recent Sessions List */}
            {lastSessions.length > 0 ? (
              <Card 
                as="section" 
                variant="hoverable" 
                padding="lg" 
                className="flex flex-col gap-6"
              >
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-dim" />
                  <h3 className="text-xs uppercase tracking-[0.2rem] text-dim font-medium">Recent Sessions</h3>
                </div>
                
                <div className="space-y-6">
                  {lastSessions.map((session, idx) => (
                    <div key={session._id} className={idx !== 0 ? "pt-6 border-t border-white/5" : ""}>
                      <div className="flex flex-col gap-2 mb-3">
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-light">{session.pattern}</span>
                          {session.inhale !== undefined && (
                            <span className="text-[0.65rem] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-dim/60 uppercase tracking-tighter">
                              {session.inhale}-{session.inhaleHold}-{session.exhale}-{session.exhaleHold}s
                            </span>
                          )}
                        </div>
                        <div className="flex gap-4 text-[0.7rem] text-dim/80">
                          <div>
                            <span className="uppercase tracking-widest text-[0.6rem] text-dim mr-1">Duration:</span>
                            <span className="font-light">{formatSessionDuration(session)}</span>
                          </div>
                          {session.cooldownSeconds > 0 && (
                            <div>
                              <span className="uppercase tracking-widest text-[0.6rem] text-dim mr-1">Hold:</span>
                              <span className="font-light text-accent">{session.cooldownSeconds}s</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {session.notes && (
                        <p className="text-text/70 text-xs font-light italic leading-relaxed line-clamp-2">
                          "{session.notes}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            ) : (
              <Card 
                as="section" 
                variant="dashed" 
                padding="lg" 
                className="flex flex-col items-center justify-center text-center py-10"
              >
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-3">
                  <Clock size={18} className="text-dim" />
                </div>
                <h3 className="text-xs uppercase tracking-widest text-dim font-medium mb-1">No History</h3>
                <p className="text-xs font-light text-text/60 max-w-[200px]">Complete your first session to see your stats here.</p>
              </Card>
            )}

          </div>
          
        </div>
      )}
    </div>
  );
}

export default Dashboard;

