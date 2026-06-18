import { useState } from 'react';
import { Play, Clock, ChevronLeft, ChevronRight, Trophy } from 'lucide-react';
import DailyProgress from './DailyProgress';
import ConsciousEating from './ConsciousEating';
import WeeklyGraph from './WeeklyGraph';

function Dashboard({ historyStats, methods, openMethodModal, challengeActive, challengeStartDate, startChallenge, refreshStats }) {
  const [activeStatIndex, setActiveStatIndex] = useState(0);

  const lastSessions = historyStats.lastSessions || [];

  const formatTime = (seconds) => {
    if (seconds < 60) return { total: Math.round(seconds), unit: 'seconds' };
    if (seconds < 3600) return { total: (seconds / 60).toFixed(1), unit: 'minutes' };
    return { total: (seconds / 3600).toFixed(2), unit: 'hours' };
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
      label: 'Isha Streak',
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
      color: 'text-text'
    },
    {
      label: 'Total AUMs',
      total: historyStats.totalAums,
      color: 'text-accent',
      unit: 'chants'
    },
    {
      label: 'COOLDOWN TIME',
      ...formatTime(historyStats.totalCooldownSeconds || 0),
      color: 'text-accent'
    },
    ...Object.entries(methods).map(([, method]) => ({
      label: `${method.name} Total`,
      ...formatTime(historyStats.methodTotals[method.name] || 0),
      color: 'text-text'
    }))
  ].filter(stat => stat.total > 0 || stat.label === 'Total Conscious Time');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleBeginClick = () => {
    openMethodModal();
  };

  const nextStat = () => setActiveStatIndex((prev) => (prev + 1) % stats.length);
  const prevStat = () => setActiveStatIndex((prev) => (prev - 1 + stats.length) % stats.length);

  const greeting = getGreeting();

  return (
    <div className="w-full max-w-6xl py-4 md:py-8 relative isolate">
      <header className="mb-10 md:mb-16 relative z-10">
        <h1 className="text-4xl md:text-7xl font-thin tracking-tight mb-4">{greeting}</h1>
        <p className="text-lg md:text-xl font-light text-dim tracking-wide">
          {challengeActive ? 'You are on your 30-day journey.' : 'Find your center and breathe.'}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
        {(lastSessions.length > 0 || Object.keys(historyStats.practicedDates || {}).length > 0) && (
          <div className="lg:col-span-2">
            <WeeklyGraph practicedDates={historyStats.practicedDates || {}} />
          </div>
        )}

        {!challengeActive && (
          <section className="relative bg-accent/5 backdrop-blur-3xl border border-accent/20 rounded-squircle-lg p-8 md:p-10 shadow-2xl transition-all duration-500 z-10 lg:col-span-2 overflow-hidden group">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left">
                <div className="flex items-center gap-3 mb-4 justify-center md:justify-start">
                  <Trophy className="text-accent" size={24} />
                  <h2 className="text-3xl md:text-4xl font-light tracking-tight">The Isha Challenge</h2>
                </div>
                <p className="text-base md:text-lg font-light text-text/80 max-w-xl leading-relaxed">
                  30 days of consistency, 30 minutes of deep presence. 
                  <span className="block mt-2 italic text-accent/80">"Your future self is waiting for you to click this button."</span>
                </p>
              </div>
              
              <button 
                className="btn-primary min-w-[240px] flex items-center justify-center gap-3 py-6 text-lg shadow-[0_0_30px_rgba(var(--color-accent-rgb),0.3)] hover:scale-105 transition-all duration-500"
                onClick={startChallenge}
              >
                <Play size={20} fill="currentColor" />
                Start Challenge
              </button>
            </div>
          </section>
        )}

        {challengeActive && (
          <>
            <section className="relative bg-white/5 backdrop-blur-3xl border border-white/10 rounded-squircle-lg p-8 md:p-10 shadow-2xl transition-all duration-500 z-10 lg:col-span-2">
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 h-full">
                <div className="text-center md:text-left">
                  <h2 className="text-3xl md:text-4xl font-light mb-4 tracking-tight">Ready to Begin?</h2>
                  <p className="text-base md:text-lg font-light text-text/80 max-w-sm leading-relaxed">
                    Start your breathing journey with your selected method and find instant clarity.
                  </p>
                </div>
                
                <div className="flex relative">
                  <button 
                    className="btn-primary min-w-[200px] md:min-w-[240px] flex items-center justify-center gap-2"
                    onClick={handleBeginClick}
                  >
                    <Play size={18} fill="currentColor" />
                    Begin Breathing
                  </button>
                </div>
              </div>
            </section>

            <section className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-squircle-lg p-8 md:p-10 shadow-xl hover:bg-white/10 transition-all duration-300 min-h-[300px]">
              <DailyProgress 
                practicedDates={historyStats.practicedDates || {}} 
                challengeStartDate={challengeStartDate}
              />
            </section>

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
                  <h3 className="text-xs uppercase tracking-[0.2rem] text-dim font-medium">{stats[activeStatIndex]?.label}</h3>
                </div>
                <div className="flex items-baseline justify-center gap-3">
                  <span className={`text-5xl md:text-6xl font-thin tracking-tighter ${stats[activeStatIndex]?.color}`}>
                    {stats[activeStatIndex]?.total}
                  </span>
                  <span className="text-lg md:text-xl font-light text-dim uppercase tracking-widest">{stats[activeStatIndex]?.unit}</span>
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

            <ConsciousEating refreshStats={refreshStats} />

            {lastSessions.length > 0 ? (
              <section className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-squircle-lg p-8 md:p-10 shadow-xl flex flex-col gap-8 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-dim" />
                  <h3 className="text-xs uppercase tracking-[0.2rem] text-dim font-medium">Recent Sessions</h3>
                </div>
                
                <div className="space-y-8">
                  {lastSessions.map((session, idx) => (
                    <div key={session._id} className={idx !== 0 ? "pt-8 border-t border-white/5" : ""}>
                      <div className="flex flex-wrap gap-8 md:gap-12 mb-4">
                        <div>
                          <span className="block text-[0.65rem] uppercase tracking-widest text-dim mb-1">Method</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xl md:text-2xl font-light">{session.pattern}</span>
                            {session.inhale !== undefined && (
                              <span className="text-[0.65rem] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-dim/60 uppercase tracking-tighter">
                                {session.inhale}-{session.inhaleHold}-{session.exhale}-{session.exhaleHold}s
                              </span>
                            )}
                          </div>
                        </div>
                        <div>
                          <span className="block text-[0.65rem] uppercase tracking-widest text-dim mb-1">Duration</span>
                          <span className="text-xl md:text-2xl font-light">{session.duration}s</span>
                        </div>
                        {session.cooldownSeconds > 0 && (
                          <div>
                            <span className="block text-[0.65rem] uppercase tracking-widest text-dim mb-1">Breath-Hold</span>
                            <span className="text-xl md:text-2xl font-light text-accent">{session.cooldownSeconds}s</span>
                          </div>
                        )}
                      </div>
                      {session.notes && (
                        <div>
                          <span className="block text-[0.65rem] uppercase tracking-widest text-dim mb-2">Note</span>
                          <p className="text-text/80 font-light italic leading-relaxed line-clamp-3">"{session.notes}"</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
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
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;

