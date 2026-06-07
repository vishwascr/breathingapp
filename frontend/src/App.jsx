import { useState, useEffect, useCallback, useMemo, Suspense, lazy } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { Trophy, Clock, Calendar, Activity, CheckCircle2, Star, Target, Zap, RefreshCcw, Wind } from 'lucide-react'
import './App.css'

import Sidebar from './components/Sidebar'
const Dashboard = lazy(() => import('./components/Dashboard'));
const Practice = lazy(() => import('./components/Practice'));
const History = lazy(() => import('./components/History'));
const Settings = lazy(() => import('./components/Settings'));

import { INITIAL_METHODS, THEMES } from './constants'

function App() {
  const [methods, setMethods] = useState(() => {
    const saved = localStorage.getItem('breath-methods');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const merged = { ...INITIAL_METHODS };
        for (const key in parsed) {
          if (merged[key]) {
            merged[key] = { ...merged[key], pattern: parsed[key].pattern };
          }
        }
        return merged;
      } catch (e) {
        console.error('Failed to parse saved methods:', e);
        return INITIAL_METHODS;
      }
    }
    return INITIAL_METHODS;
  });
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyStats, setHistoryStats] = useState({
    totalSeconds: 0,
    totalCooldownSeconds: 0,
    totalAums: 0,
    overallDuration: 0,
    totalSessions: 0,
    methodTotals: {},
    lastSession: null,
    practicedDates: {}
  });
  const [hasMoreHistory, setHasMoreHistory] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [challengeActive, setChallengeActive] = useState(false);
  const [challengeStartDate, setChallengeStartDate] = useState(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [hasDismissedCompletion, setHasDismissedCompletion] = useState(false);
  const [completionStats, setCompletionStats] = useState(null);
  const [hasDismissedExpiration, setHasDismissedExpiration] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');
  const [expirationNotes, setExpirationNotes] = useState('');
  const [generateCsv, setGenerateCsv] = useState(false);

  const getChallengeStats = useCallback((statsOverride = null) => {
    if (!challengeActive || !challengeStartDate) return null;

    const statsToUse = statsOverride || historyStats;
    const totalHours = (statsToUse.totalSeconds / 3600).toFixed(2);

    const start = new Date(challengeStartDate);
    const now = new Date();
    const diffTime = Math.abs(now - start);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Calculate Most Practiced Method from stats
    const favoriteMethod = Object.entries(statsToUse.methodTotals)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

    return {
      hours: totalHours,
      days: Math.min(diffDays, 30),
      rawDays: diffDays,
      sessions: statsToUse.totalSessions,
      favoriteMethod,
      totalAums: statsToUse.totalAums
    };
  }, [challengeActive, challengeStartDate, historyStats]);

  const calculateChallengeCompletion = useCallback((statsOverride = null) => {
    const stats = getChallengeStats(statsOverride);
    if (stats && stats.rawDays > 30 && parseFloat(stats.hours) >= 30) {
      return stats;
    }
    return null;
  }, [getChallengeStats]);

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('breath-theme') || 'noir';
  });

  const [isSessionActive, setIsSessionActive] = useState(false);
  const [pendingNav, setPendingNav] = useState(null);
  const [isMethodModalOpen, setIsMethodModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const expirationStats = useMemo(() => {
    if (challengeActive && challengeStartDate && !isSessionActive && !hasDismissedExpiration) {
      const stats = getChallengeStats();
      if (stats && stats.rawDays > 30 && parseFloat(stats.hours) < 30) {
        return stats;
      }
    }
    return null;
  }, [challengeActive, challengeStartDate, isSessionActive, getChallengeStats, hasDismissedExpiration]);

  const showExpirationModal = !!expirationStats;

  useEffect(() => {
    if (challengeActive && challengeStartDate && !isSessionActive && !showCompletionModal && !hasDismissedCompletion) {
      const stats = calculateChallengeCompletion();
      if (stats && parseFloat(stats.hours) >= 30) {
        setCompletionStats(stats);
        setShowCompletionModal(true);
      }
    }
  }, [challengeActive, challengeStartDate, isSessionActive, calculateChallengeCompletion, showCompletionModal, historyStats.totalSeconds, hasDismissedCompletion]);

  const showStripes = ['/', '/history', '/settings'].includes(location.pathname);

  const confirmEndSession = () => {
    const target = pendingNav;
    setPendingNav(null);
    setIsSessionActive(false);
    if (target === 'MODAL') {
      setIsMethodModalOpen(true);
    } else {
      navigate(target);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const loadInitialData = async () => {
      try {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const [statsRes, historyRes, themeRes, challengeRes] = await Promise.all([
          fetch('/api/history/stats', { headers: { 'x-timezone': timezone } }),
          fetch('/api/history?page=1&limit=10'),
          fetch('/api/settings/theme'),
          fetch('/api/challenge/status')
        ]);

        const [statsData, historyData, themeData, challengeData] = await Promise.all([
          statsRes.json(),
          historyRes.json(),
          themeRes.json().catch(() => ({ theme: null })),
          challengeRes.json()
        ]);

        if (isMounted) {
          // Process Stats
          setHistoryStats(statsData);

          // Process History
          setHistory(historyData.data);
          setHasMoreHistory(historyData.hasMore);

          // Process Theme
          const loadedTheme = themeData.theme;
          if (loadedTheme) {
            setTheme(loadedTheme);
            localStorage.setItem('breath-theme', loadedTheme);
          }
          // If no theme from API, we already have it from localStorage or 'noir'

          // Process Challenge Status
          setChallengeActive(challengeData.challengeActive);
          setChallengeStartDate(challengeData.challengeStartDate);
        }
      } catch (err) {
        console.error('Failed to fetch initial data:', err);
      }
    };
    loadInitialData();
    return () => { isMounted = false; };
  }, []); // Run once on mount

  useEffect(() => {
    if (!theme) return;
    localStorage.setItem('breath-theme', theme);
    const root = document.documentElement;
    const colors = THEMES[theme].colors;
    root.style.setProperty('--color-bg', colors.bg);
    root.style.setProperty('--color-accent', colors.accent);
    root.style.setProperty('--indicator-color', colors.indicator);
    root.style.setProperty('--glass-color', colors.glass);
    root.style.setProperty('--color-text', colors.text);
    root.style.setProperty('--color-secondary', colors.secondary);
    root.style.setProperty('--color-dim', colors.dim);
    
    // Cooldown Specific Color (Scalable approach using theme constant)
    root.style.setProperty('--color-cooldown', colors.cooldown || colors.accent);
    
    // Sidebar & Navigation Specifics (for removing glass effects)
    root.style.setProperty('--sidebar-bg', colors.sidebarBg);
    root.style.setProperty('--sidebar-blur', colors.sidebarBlur);
    root.style.setProperty('--sidebar-border', colors.sidebarBorder);
    root.style.setProperty('--mobile-nav-bg', colors.mobileNavBg);
    root.style.setProperty('--mobile-nav-blur', colors.mobileNavBlur);
    root.style.setProperty('--mobile-nav-border', colors.mobileNavBorder);

    // Update meta theme-color for mobile browser chrome
    const updateMeta = (content) => {
      let meta = document.querySelector('meta[name="theme-color"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'theme-color');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };
    
    updateMeta(colors.bg);
  }, [theme]);

  const updateTheme = async (newTheme) => {
    try {
      setTheme(newTheme);
      localStorage.setItem('breath-theme', newTheme);
      await fetch('/api/settings/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: newTheme })
      });
    } catch (err) {
      console.error('Failed to save theme:', err);
    }
  };

  const fetchHistoryStats = async () => {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const response = await fetch('/api/history/stats', {
        headers: { 'x-timezone': timezone }
      });
      const data = await response.json();
      setHistoryStats(data);
      return data;
    } catch (err) {
      console.error('Failed to fetch history stats:', err);
    }
  };

  const fetchHistory = async (page = 1, append = false) => {
    try {
      const response = await fetch(`/api/history?page=${page}&limit=10`);
      const data = await response.json();
      
      if (append) {
        setHistory(prev => [...prev, ...data.data]);
      } else {
        setHistory(data.data);
      }
      
      setHasMoreHistory(data.hasMore);
      setHistoryPage(page);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  };

  const loadMoreHistory = () => {
    fetchHistory(historyPage + 1, true);
  };

  const saveHistory = async (duration, patternName, notes, cycles, cooldownSeconds, rating, inhale, inhaleHold, exhale, exhaleHold) => {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      await fetch('/api/history', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-timezone': timezone
        },
        body: JSON.stringify({ duration, pattern: patternName, notes, cycles, cooldownSeconds, rating, inhale, inhaleHold, exhale, exhaleHold })
      });
      
      // Refresh stats and first page of history
      const newStats = await fetchHistoryStats();
      fetchHistory(1, false);

      const compStats = calculateChallengeCompletion(newStats);
      if (compStats && !hasDismissedCompletion) {
        setCompletionStats(compStats);
        setShowCompletionModal(true);
      }
    } catch (err) {
      console.error('Failed to save history:', err);
    }
  };

  const deleteHistoryItem = async (id) => {
    try {
      const res = await fetch(`/api/history/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setHistory(prev => prev.filter(item => item._id !== id));
        fetchHistoryStats();
      }
    } catch (err) {
      console.error('Failed to delete history item:', err);
    }
  };

  const startChallenge = async () => {
    try {
      const res = await fetch('/api/challenge/start', { method: 'POST' });
      if (res.ok) {
        setHistory([]);
        setHistoryStats({
          totalSeconds: 0,
          totalCooldownSeconds: 0,
          totalAums: 0,
          overallDuration: 0,
          totalSessions: 0,
          methodTotals: {},
          lastSession: null,
          practicedDates: {}
        });
        setChallengeActive(true);
        setChallengeStartDate(new Date().toISOString());
        setHasDismissedCompletion(false);
        setHasDismissedExpiration(false);
      }
    } catch (err) {
      console.error('Failed to start challenge:', err);
    }
  };

  const resetChallenge = async (closureNotes = '', downloadCsv = false) => {
    try {
      const res = await fetch('/api/challenge/reset', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ closureNotes, generateCsv: downloadCsv })
      });
      if (res.ok) {
        const data = await res.json();
        
        // Trigger automatic CSV download conditionally if returned from backend
        if (data.csv) {
          const blob = new Blob([data.csv], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.setAttribute('href', url);
          link.setAttribute('download', 'breathing_history.csv');
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }

        setHistory([]);
        setHistoryStats({
          totalSeconds: 0,
          totalCooldownSeconds: 0,
          totalAums: 0,
          overallDuration: 0,
          totalSessions: 0,
          methodTotals: {},
          lastSession: null,
          practicedDates: {}
        });
        setChallengeActive(false);
        setChallengeStartDate(null);
      }
    } catch (err) {
      console.error('Failed to reset challenge:', err);
    }
  };

  const updateMethodPattern = (methodKey, newPattern) => {
    setMethods(prev => {
      const updated = {
        ...prev,
        [methodKey]: { ...prev[methodKey], pattern: newPattern }
      };
      
      // Save only patterns to localStorage
      const toSave = {};
      for (const key in updated) {
        toSave[key] = { pattern: updated[key].pattern };
      }
      localStorage.setItem('breath-methods', JSON.stringify(toSave));
      
      return updated;
    });
  };

  const handleMethodChange = (methodKey) => {
    setSelectedMethod(methodKey);
    navigate('/practice');
  };

  return (
    <div className="min-h-dvh text-text transition-colors duration-500 relative isolate">
      {/* UI Layer */}
      <div className="flex flex-col md:flex-row w-full min-h-dvh relative z-10">
        <Sidebar 
          isSessionActive={isSessionActive}
          onNavigateAttempt={(path) => setPendingNav(path)}
          openMethodModal={() => setIsMethodModalOpen(true)}
          isMethodModalOpen={isMethodModalOpen}
          challengeActive={challengeActive}
        />
        
        <div className="flex-1 relative isolate min-h-dvh md:ml-72">
          {/* Subtle Vertical Stripes Background - Fixed to stay behind scrolling content */}
          {showStripes && (
            <div className="fixed inset-0 flex pointer-events-none z-0">
              {[...Array(8)].map((_, i) => (
                <div 
                  key={i} 
                  className="flex-1 h-full border-r border-white/[0.03]"
                  style={{ 
                    background: `linear-gradient(to bottom, rgba(40, 40, 40, 0.5), rgba(0, 0, 0, 0))` 
                  }}
                ></div>
              ))}
            </div>
          )}
          
          <main className={`w-full flex justify-center relative z-10 ${
            location.pathname === '/practice' 
              ? 'h-dvh overflow-hidden p-6 md:p-12' 
              : 'min-h-dvh p-6 md:p-12 pb-32 md:pb-12 items-start'
          }`}>
            <Suspense fallback={
              <div className="flex md:hidden items-center justify-center p-20">
                <Wind size={40} className="text-accent animate-pulse" />
              </div>
            }>
              <Routes>
                <Route path="/" element={
                  <Dashboard
                    key={challengeActive}
                    historyStats={historyStats}
                    methods={methods}
                    openMethodModal={() => setIsMethodModalOpen(true)}
                    challengeActive={challengeActive}
                    challengeStartDate={challengeStartDate}
                    startChallenge={startChallenge}
                  />
                } />
                <Route 
                  path="/practice" 
                  element={
                    <Practice 
                      selectedMethod={selectedMethod} 
                      methods={methods} 
                      saveHistory={saveHistory} 
                      setIsSessionActive={setIsSessionActive}
                    />
                  } 
                />
                <Route path="/history" element={
                  <History 
                    history={history} 
                    hasMore={hasMoreHistory} 
                    loadMore={loadMoreHistory} 
                    onDelete={deleteHistoryItem}
                  />
                } />
                <Route 
                  path="/settings"
                  element={
                    <Settings
                      methods={methods}
                      updateMethodPattern={updateMethodPattern}
                      currentTheme={theme}
                      setTheme={updateTheme}
                      themes={THEMES}
                      challengeActive={challengeActive}
                      resetChallenge={resetChallenge}
                    />
                  }
                  />
              </Routes>
            </Suspense>
          </main>
        </div>
      </div>

      {/* Global Confirmation Modal */}
      {pendingNav && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-6">
          <div className="w-full max-w-sm bg-white/5 backdrop-blur-3xl border border-white/10 rounded-squircle-lg p-8 shadow-2xl animate-fadeIn text-center">
            <h3 className="text-2xl font-light mb-4">End Session?</h3>
            <p className="text-dim font-light mb-8 leading-relaxed">
              You have a session in progress. Navigating away will end your current journey.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setPendingNav(null)} 
                className="flex-1 border border-white/10 py-3 rounded-squircle-md font-light hover:bg-white/5 transition-all duration-300"
              >
                Stay
              </button>
              <button 
                onClick={confirmEndSession}
                className="flex-1 bg-accent text-bg py-3 rounded-squircle-md font-medium hover:bg-indicator transition-all duration-300"
              >
                End Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Method Selection Modal */}
      {isMethodModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 md:p-6">
          <div className="w-full max-w-sm bg-white/5 backdrop-blur-3xl border border-white/10 rounded-squircle-lg p-6 md:p-8 shadow-2xl animate-fadeIn text-center flex flex-col max-h-[90dvh] min-w-0">
            <div className="shrink-0 min-w-0">
              <h3 className="text-xl md:text-2xl font-light mb-2 truncate">Select Technique</h3>
              <p className="text-dim font-light mb-6 leading-relaxed text-sm md:text-base">
                Choose a breathing method to begin your session.
              </p>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 custom-scrollbar min-w-0">
              {Object.entries(methods).map(([key, method]) => (
                <button
                  key={key}
                  className="w-full border border-white/10 py-3 md:py-4 px-4 rounded-squircle-md font-light hover:bg-white/5 transition-all duration-300 flex items-center justify-between gap-3 min-w-0"
                  onClick={() => {
                    handleMethodChange(key);
                    setIsMethodModalOpen(false);
                  }}
                >
                  <span className="truncate text-left flex-1 min-w-0 pr-2">{method.name}</span>
                  {method.isNew && (
                    <span className="shrink-0 text-[0.6rem] bg-accent text-bg px-2 py-0.5 rounded-full font-bold tracking-widest leading-none">NEW</span>
                  )}
                </button>
              ))}
            </div>

            <div className="shrink-0 mt-4">
              <button 
                onClick={() => setIsMethodModalOpen(false)} 
                className="w-full bg-white/5 py-3 rounded-squircle-md font-light hover:bg-white/10 transition-all duration-300 text-dim"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Challenge Completion Modal */}
      {showCompletionModal && completionStats && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 md:p-6">
          <div className="w-full max-w-xl bg-white/5 backdrop-blur-3xl border border-white/10 rounded-squircle-lg p-6 md:p-12 shadow-2xl animate-fadeIn text-center relative max-h-[90dvh] md:max-h-none overflow-y-auto overflow-x-hidden md:overflow-hidden custom-scrollbar">
            {/* Background Decorative Icons */}
            <div className="absolute -top-10 -left-10 opacity-10 rotate-12">
              <Star className="w-20 h-20 md:w-[120px] md:h-[120px] text-accent" />
            </div>
            <div className="absolute -bottom-10 -right-10 opacity-10 -rotate-12">
              <Trophy className="w-24 h-24 md:w-[150px] md:h-[150px] text-accent" />
            </div>

            <div className="relative z-10">
              <div className="flex justify-center mb-4 md:mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-accent/20 blur-2xl rounded-full"></div>
                  <Trophy size={64} className="md:size-[80px] text-accent relative animate-trophy-glow" />
                </div>
              </div>

              <h2 className="text-3xl md:text-5xl font-thin tracking-tighter mb-3 md:mb-4">Challenge Accomplished!</h2>
              <p className="text-base md:text-lg text-dim font-light mb-6 md:mb-10 max-w-md mx-auto leading-relaxed">
                You've completed your 30-hour journey. Your dedication to mindfulness is truly inspiring.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-8 md:mb-10">
                <div className="bg-white/5 border border-white/10 rounded-squircle-md p-3 md:p-4 flex flex-col items-center">
                  <Clock size={18} className="md:size-[20px] text-accent mb-1 md:mb-2" />
                  <span className="text-xl md:text-2xl font-light">{completionStats.hours}</span>
                  <span className="text-[0.6rem] md:text-[0.65rem] uppercase tracking-widest text-dim">Total Hours</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-squircle-md p-3 md:p-4 flex flex-col items-center">
                  <Calendar size={18} className="md:size-[20px] text-accent mb-1 md:mb-2" />
                  <span className="text-xl md:text-2xl font-light">{completionStats.days}</span>
                  <span className="text-[0.6rem] md:text-[0.65rem] uppercase tracking-widest text-dim">Days Taken</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-squircle-md p-3 md:p-4 flex flex-col items-center">
                  <Activity size={18} className="md:size-[20px] text-accent mb-1 md:mb-2" />
                  <span className="text-xl md:text-2xl font-light">{completionStats.sessions}</span>
                  <span className="text-[0.6rem] md:text-[0.65rem] uppercase tracking-widest text-dim">Sessions</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-squircle-md p-3 md:p-4 flex flex-col items-center">
                  <Target size={18} className="md:size-[20px] text-accent mb-1 md:mb-2" />
                  <span className="text-base md:text-lg font-light line-clamp-1">{completionStats.favoriteMethod}</span>
                  <span className="text-[0.6rem] md:text-[0.65rem] uppercase tracking-widest text-dim">Favorite</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-squircle-md p-3 md:p-4 flex flex-col items-center col-span-2 md:col-span-2">
                  <Zap size={18} className="md:size-[20px] text-accent mb-1 md:mb-2" />
                  <span className="text-xl md:text-2xl font-light">{completionStats.totalAums}</span>
                  <span className="text-[0.6rem] md:text-[0.65rem] uppercase tracking-widest text-dim text-center">Total AUM Vibrations</span>
                </div>
              </div>

              <div className="mb-8">
                <textarea 
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="Reflect on your journey... (Closure notes for CSV)"
                  className="w-full bg-white/5 border border-white/10 rounded-squircle-md p-4 text-text focus:outline-none focus:border-accent min-h-[60px] resize-none transition-all placeholder:text-dim/30 text-sm md:text-base mb-4"
                />
                <label className="flex items-center gap-2 text-dim text-sm cursor-pointer justify-center md:justify-start">
                  <input 
                    type="checkbox" 
                    checked={generateCsv}
                    onChange={(e) => setGenerateCsv(e.target.checked)}
                    className="w-4 h-4 rounded bg-white/5 border-white/10 text-accent focus:ring-accent focus:ring-offset-0"
                  />
                  <span>Generate and download CSV report</span>
                </label>
              </div>

              <button 
                onClick={() => {
                  setHasDismissedCompletion(true);
                  setShowCompletionModal(false);
                  resetChallenge(completionNotes, generateCsv);
                  setCompletionNotes('');
                  navigate('/');
                }}
                className="btn-primary w-full py-4 md:py-5 text-base md:text-lg flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(var(--color-accent-rgb),0.2)]"
              >
                <CheckCircle2 size={24} />
                Finish Journey
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Challenge Expiration Modal */}
      {showExpirationModal && expirationStats && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 md:p-6">
          <div className="w-full max-w-xl bg-white/5 backdrop-blur-3xl border border-white/10 rounded-squircle-lg p-6 md:p-12 shadow-2xl animate-fadeIn text-center relative max-h-[90dvh] md:max-h-none overflow-y-auto overflow-x-hidden md:overflow-hidden custom-scrollbar">
            {/* Background Decorative Icons */}
            <div className="absolute -top-10 -left-10 opacity-10 rotate-12">
              <RefreshCcw className="w-20 h-20 md:w-[120px] md:h-[120px] text-accent" />
            </div>
            <div className="absolute -bottom-10 -right-10 opacity-10 -rotate-12">
              <Clock className="w-24 h-24 md:w-[150px] md:h-[150px] text-accent" />
            </div>

            <div className="relative z-10">
              <div className="flex justify-center mb-4 md:mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-accent/20 blur-2xl rounded-full"></div>
                  <RefreshCcw size={64} className="md:size-[80px] text-accent relative animate-pulse" />
                </div>
              </div>

              <h2 className="text-3xl md:text-5xl font-thin tracking-tighter mb-3 md:mb-4">Your 30 Days Have Ended</h2>
              <p className="text-base md:text-lg text-dim font-light mb-6 md:mb-10 max-w-md mx-auto leading-relaxed">
                The 30-day window for your challenge has closed. Every breath you took was progress—take what you've learned and start a fresh journey.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-8 md:mb-10">
                <div className="bg-white/5 border border-white/10 rounded-squircle-md p-3 md:p-4 flex flex-col items-center">
                  <Clock size={18} className="md:size-[20px] text-accent mb-1 md:mb-2" />
                  <span className="text-xl md:text-2xl font-light">{expirationStats.hours}</span>
                  <span className="text-[0.6rem] md:text-[0.65rem] uppercase tracking-widest text-dim">Hours Practiced</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-squircle-md p-3 md:p-4 flex flex-col items-center">
                  <Calendar size={18} className="md:size-[20px] text-accent mb-1 md:mb-2" />
                  <span className="text-xl md:text-2xl font-light">{expirationStats.days}</span>
                  <span className="text-[0.6rem] md:text-[0.65rem] uppercase tracking-widest text-dim">Days Completed</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-squircle-md p-3 md:p-4 flex flex-col items-center">
                  <Activity size={18} className="md:size-[20px] text-accent mb-1 md:mb-2" />
                  <span className="text-xl md:text-2xl font-light">{expirationStats.sessions}</span>
                  <span className="text-[0.6rem] md:text-[0.65rem] uppercase tracking-widest text-dim">Sessions</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-squircle-md p-3 md:p-4 flex flex-col items-center">
                  <Target size={18} className="md:size-[20px] text-accent mb-1 md:mb-2" />
                  <span className="text-base md:text-lg font-light line-clamp-1">{expirationStats.favoriteMethod}</span>
                  <span className="text-[0.6rem] md:text-[0.65rem] uppercase tracking-widest text-dim">Favorite</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-squircle-md p-3 md:p-4 flex flex-col items-center col-span-2 md:col-span-2">
                  <Zap size={18} className="md:size-[20px] text-accent mb-1 md:mb-2" />
                  <span className="text-xl md:text-2xl font-light">{expirationStats.totalAums}</span>
                  <span className="text-[0.6rem] md:text-[0.65rem] uppercase tracking-widest text-dim text-center">Total AUM Vibrations</span>
                </div>
              </div>

              <div className="mb-8">
                <textarea 
                  value={expirationNotes}
                  onChange={(e) => setExpirationNotes(e.target.value)}
                  placeholder="What happened? (Closure notes for CSV)"
                  className="w-full bg-white/5 border border-white/10 rounded-squircle-md p-4 text-text focus:outline-none focus:border-accent min-h-[60px] resize-none transition-all placeholder:text-dim/30 text-sm md:text-base mb-4"
                />
                <label className="flex items-center gap-2 text-dim text-sm cursor-pointer justify-center md:justify-start">
                  <input 
                    type="checkbox" 
                    checked={generateCsv}
                    onChange={(e) => setGenerateCsv(e.target.checked)}
                    className="w-4 h-4 rounded bg-white/5 border-white/10 text-accent focus:ring-accent focus:ring-offset-0"
                  />
                  <span>Generate and download CSV report</span>
                </label>
              </div>

              <button
                onClick={() => {
                  setHasDismissedExpiration(true);
                  resetChallenge(expirationNotes, generateCsv);
                  setExpirationNotes('');
                  navigate('/');
                }}
                className="btn-primary w-full py-4 md:py-5 text-base md:text-lg flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(var(--color-accent-rgb),0.2)]"
              >
                <RefreshCcw size={24} />
                Start Over
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
