import { useState, useEffect, useCallback, useMemo, useRef, Suspense, lazy } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { Trophy, Clock, Calendar, Activity, CheckCircle2, Star, Target, Zap, RefreshCcw, Wind, X, ChevronLeft } from 'lucide-react'
import './App.css'
import { Modal, Card, Button, Textarea, Checkbox } from './components/common'

import Sidebar from './components/Sidebar'
const Dashboard = lazy(() => import('./components/Dashboard'));
const Practice = lazy(() => import('./components/Practice'));
const History = lazy(() => import('./components/History'));
const Settings = lazy(() => import('./components/Settings'));

import { INITIAL_METHODS } from './constants'
import { useTheme } from './themes'

// Helper to format the breathing ratios/patterns beautifully
const getPatternText = (key, method) => {
  if (key === 'chakraAscent') return '7 Levels of Meditation';
  if (key === 'aum') return 'Inhale 4s • Chanting Exhale 13s';
  if (!method.pattern || method.pattern.every(v => v === 0)) return 'Guided Meditation';
  const [inhale, hold, exhale, hold2] = method.pattern;
  const parts = [];
  if (inhale > 0) parts.push(`Inhale ${inhale}s`);
  if (hold > 0) parts.push(`Hold ${hold}s`);
  if (exhale > 0) parts.push(`Exhale ${exhale}s`);
  if (hold2 > 0) parts.push(`Hold ${hold2}s`);
  return parts.join(' • ');
};

function App() {
  const [methods, setMethods] = useState(INITIAL_METHODS);
  const [history, setHistory] = useState([]);
  const [historyStats, setHistoryStats] = useState({
    totalSeconds: 0,
    totalCooldownSeconds: 0,
    totalAums: 0,
    overallDuration: 0,
    totalSessions: 0,
    methodTotals: {},
    lastSessions: [],
    practicedDates: {}
  });
  const [hasMoreHistory, setHasMoreHistory] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [challengeActive, setChallengeActive] = useState(false);
  const [challengeStartDate, setChallengeStartDate] = useState(null);
  const [hasDismissedCompletion, setHasDismissedCompletion] = useState(false);
  const [hasDismissedExpiration, setHasDismissedExpiration] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');
  const [expirationNotes, setExpirationNotes] = useState('');
  const [generateCsv, setGenerateCsv] = useState(false);

  const getChallengeStats = useCallback((statsOverride = null) => {
    if (!challengeActive || !challengeStartDate) return null;

    const statsToUse = statsOverride || historyStats;
    const totalMinutes = (statsToUse.totalSeconds / 60).toFixed(1);

    const start = new Date(challengeStartDate);
    const now = new Date();
    const diffTime = Math.abs(now - start);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Calculate Qualified Days (at least 30 minutes)
    const qualifiedDays = Object.values(statsToUse.practicedDates || {})
      .filter(duration => duration >= 1800).length;

    // Calculate Most Practiced Method from stats
    const favoriteMethod = Object.entries(statsToUse.methodTotals)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

    return {
      minutes: totalMinutes,
      days: Math.min(diffDays, 30),
      rawDays: diffDays,
      qualifiedDays,
      sessions: statsToUse.totalSessions,
      favoriteMethod,
      totalAums: statsToUse.totalAums
    };
  }, [challengeActive, challengeStartDate, historyStats]);

  const calculateChallengeCompletion = useCallback((statsOverride = null) => {
    const stats = getChallengeStats(statsOverride);
    // Complete if they have reached 30 qualified days and are past the 30-day window
    if (stats && stats.rawDays > 30 && stats.qualifiedDays >= 30) {
      return stats;
    }
    return null;
  }, [getChallengeStats]);

  // ── Theme system (replaces old useState + THEMES constant) ────────────────
  const {
    registry: themeRegistry,
    activeKey: theme,
    selectTheme,
    importTheme,
    exportTheme,
    removeTheme,
    saveCustomTheme,
    isBuiltin: isBuiltinTheme,
  } = useTheme();

  const selectThemeRef = useRef(selectTheme);
  useEffect(() => {
    selectThemeRef.current = selectTheme;
  }, [selectTheme]);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar]);

  const [isSessionActive, setIsSessionActive] = useState(false);
  const [pendingNav, setPendingNav] = useState(null);
  const [isMethodModalOpen, setIsMethodModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [isClosingDetail, setIsClosingDetail] = useState(false);

  const handleBackClick = useCallback(() => {
    setIsClosingDetail(true);
    setTimeout(() => {
      setSelectedCard(null);
      setIsClosingDetail(false);
    }, 300); // Matches 0.3s out animation
  }, []);

  const navigate = useNavigate();
  const location = useLocation();

  const [prevPath, setPrevPath] = useState(location.pathname);
  if (location.pathname !== prevPath) {
    setPrevPath(location.pathname);
    setSidebarCollapsed(true);
  }

  const expirationStats = useMemo(() => {
    if (challengeActive && challengeStartDate && !isSessionActive && !hasDismissedExpiration) {
      const stats = getChallengeStats();
      if (stats && stats.rawDays > 30 && stats.qualifiedDays < 30) {
        return stats;
      }
    }
    return null;
  }, [challengeActive, challengeStartDate, isSessionActive, getChallengeStats, hasDismissedExpiration]);

  const showExpirationModal = !!expirationStats;

  const completionStats = useMemo(() => {
    if (challengeActive && challengeStartDate && !isSessionActive && !hasDismissedCompletion) {
      const stats = calculateChallengeCompletion();
      if (stats && parseFloat(stats.minutes) >= 30) {
        return stats;
      }
    }
    return null;
  }, [challengeActive, challengeStartDate, isSessionActive, calculateChallengeCompletion, hasDismissedCompletion]);

  const showCompletionModal = !!completionStats;

  const showStripes = ['/', '/history', '/settings'].includes(location.pathname) || (location.pathname.startsWith('/practice') && !isSessionActive);

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
            selectThemeRef.current(loadedTheme);
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

  // CSS variable application is now handled inside useTheme() — no useEffect needed here.

  // Theme selection is now handled by selectTheme() from useTheme() — server sync included.

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
      await fetchHistoryStats();
      fetchHistory(1, false);
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
          lastSessions: [],
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
          const now = new Date();
          const year = now.getFullYear().toString().slice(-2);
          const month = (now.getMonth() + 1).toString().padStart(2, '0');
          const day = now.getDate().toString().padStart(2, '0');
          const filename = `breathing_history_${year}${month}${day}.csv`;

          const blob = new Blob([data.csv], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.setAttribute('href', url);
          link.setAttribute('download', filename);
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
          lastSessions: [],
          practicedDates: {}
        });
        setChallengeActive(false);
        setChallengeStartDate(null);
        navigate('/');
      }
    } catch (err) {
      console.error('Failed to reset challenge:', err);
    }
  };

  const updateMethodPattern = (methodKey, newPattern) => {
    setMethods(prev => ({
      ...prev,
      [methodKey]: { ...prev[methodKey], pattern: newPattern }
    }));
  };

  const handleMethodChange = (methodKey) => {
    const routes = {
      '478': '/practice/4-7-8',
      'box': '/practice/box',
      'chakraAscent': '/practice/chakra-ascent',
      'completeBreath': '/practice/complete-breath',
      'resonance': '/practice/resonance',
      'aum': '/practice/aum'
    };
    navigate(routes[methodKey] || '/');
  };

  return (
    <div className="min-h-dvh text-text transition-colors duration-500 relative isolate overflow-x-hidden">
      {/* UI Layer */}
      <div className="flex flex-col md:flex-row w-full min-h-dvh relative z-10">
        {challengeActive && (
          <Sidebar 
            isSessionActive={isSessionActive}
            onNavigateAttempt={(path) => setPendingNav(path)}
            openMethodModal={() => setIsMethodModalOpen(true)}
            isMethodModalOpen={isMethodModalOpen}
            challengeActive={challengeActive}
            isCollapsed={sidebarCollapsed}
            onExpand={() => {
              setSidebarCollapsed(false);
            }}
            onCollapse={() => {
              setSidebarCollapsed(true);
            }}
          />
        )}
        
        {/* Overlay backdrop for expanded sidebar on desktop */}
        {challengeActive && !sidebarCollapsed && (
          <div 
            className="hidden md:block fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 cursor-pointer"
            onClick={toggleSidebar}
            aria-hidden="true"
          />
        )}
        
        <div className={`flex-1 relative isolate min-h-dvh transition-[margin-left] duration-300 ${
          !challengeActive 
            ? 'md:ml-0' 
            : 'md:ml-20'
        }`}>
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
            location.pathname.startsWith('/practice')
              ? (isSessionActive 
                  ? 'h-dvh overflow-hidden p-6 md:p-12' 
                  : 'min-h-dvh md:h-dvh md:overflow-hidden p-6 md:p-12 pb-32 md:pb-12 items-start md:items-center')
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
                    refreshStats={fetchHistoryStats}
                    saveHistory={saveHistory}
                  />
                } />
                <Route 
                  path="/practice/:methodKey" 
                  element={
                    <Practice 
                      key={location.pathname}
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
                      themeRegistry={themeRegistry}
                      onSelectTheme={selectTheme}
                      onImportTheme={importTheme}
                      onExportTheme={exportTheme}
                      onRemoveTheme={removeTheme}
                      onSaveCustomTheme={saveCustomTheme}
                      isBuiltinTheme={isBuiltinTheme}
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
      <Modal
        isOpen={!!pendingNav}
        onClose={() => setPendingNav(null)}
        maxWidth="sm"
        zIndex="z-[100]"
        className="text-center"
      >
        <h3 className="text-2xl font-light mb-4">End Session?</h3>
        <p className="text-dim font-light mb-8 leading-relaxed">
          You have a session in progress. Navigating away will end your current journey.
        </p>
        <div className="flex gap-4">
          <Button 
            onClick={() => setPendingNav(null)} 
            variant="secondary"
            size="none"
            className="flex-1 py-3 font-light"
          >
            Stay
          </Button>
          <Button 
            onClick={confirmEndSession}
            variant="primary"
            size="none"
            className="flex-1 py-3 font-medium"
          >
            End Session
          </Button>
        </div>
      </Modal>

      {/* Global Method Selection Modal */}
      <Modal
        isOpen={isMethodModalOpen}
        onClose={() => {
          setIsMethodModalOpen(false);
          setSelectedCard(null);
        }}
        maxWidth="5xl"
        zIndex="z-[100]"
        className="text-center flex flex-col w-[92vw] max-w-5xl h-[85vh] max-h-[800px] min-w-0 relative"
      >
        {/* Modal Close Button */}
        <button
          onClick={() => {
            setIsMethodModalOpen(false);
            setSelectedCard(null);
            setIsClosingDetail(false);
          }}
          className="absolute top-4 right-4 p-2 rounded-full text-text/50 hover:text-text hover:bg-white/10 transition-colors z-20 cursor-pointer"
          title="Close Modal"
        >
          <X size={18} />
        </button>

        <div className="relative flex-1 flex flex-col min-h-0 w-full">
          {/* Grid View Container */}
          <div
            className={`flex-1 flex flex-col grid-fade-transition ${
              selectedCard ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
            }`}
          >
            <div className="shrink-0 min-w-0">
              <h3 className="text-xl md:text-2xl font-light mb-2 truncate">Select Technique</h3>
              <p className="text-text/60 font-light mb-6 leading-relaxed text-sm md:text-base">
                Choose a breathing method to begin your session.
              </p>
            </div>
            
            <div className="flex-1 overflow-y-auto pt-3 px-4 -mx-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 custom-scrollbar min-w-0 pb-4">
              {Object.entries(methods).map(([key, method]) => (
                <div
                  key={key}
                  className="relative overflow-hidden group flat-card rounded-squircle-md h-[220px] flex flex-col justify-between p-6 cursor-pointer technique-grid-card"
                  onClick={() => {
                    handleMethodChange(key);
                    setIsMethodModalOpen(false);
                    setSelectedCard(null);
                  }}
                >
                  {/* Card Top: Category & Tags + Info button */}
                  <div className="flex items-center justify-between w-full">
                    <span className="bg-accent/10 text-accent border border-accent/20 px-3 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase">
                      {method.category || 'Meditation'}
                    </span>
                    <div className="flex items-center gap-2">
                      {method.isNew && (
                        <span className="text-[9px] bg-accent text-bg px-2 py-0.5 rounded-full font-bold tracking-widest leading-none">
                          NEW
                        </span>
                      )}
                      {/* Info button — opens expanded detail without starting session */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCard(key);
                        }}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-text/30 hover:text-accent hover:bg-accent/10 border border-white/5 hover:border-accent/20 transition-all duration-200 cursor-pointer shrink-0"
                        title="View details"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                      </button>
                    </div>
                  </div>
                  
                  {/* Card Middle: Pulsing wind icon & Title */}
                  <div className="flex-1 flex flex-col items-center justify-center gap-3 my-2">
                    <div className="w-10 h-10 border border-accent/15 rounded-full flex items-center justify-center icon-container-transition">
                      <Wind className="w-4.5 h-4.5 text-accent/60 transition-colors" />
                    </div>
                    <h4 className="text-lg md:text-xl font-light text-text tracking-wide text-center transition-colors duration-300">
                      {method.name}
                    </h4>
                  </div>

                  {/* Card Bottom: Simple preview ratio */}
                  <div className="text-center text-xs text-text/40 tracking-wider">
                    {key === 'chakraAscent' ? '7 Levels' : method.pattern ? `${method.pattern.filter(Boolean).join(' • ')} Ratio` : 'Guided'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Glide/Flip View Container */}
          {selectedCard && (
            <div className="absolute inset-0 flex items-center justify-center p-4 z-10 perspective-1000 pointer-events-auto">
              <div
                className={`relative w-full max-w-xl h-[480px] preserve-3d ${
                  isClosingDetail ? 'animate-quickFlipOut' : 'animate-quickFlipIn'
                }`}
              >
                {/* Detailed View Card (Direct reveal with a quick 3D flip-in) */}
                <div className="absolute inset-0 flat-card rounded-squircle-lg p-8 flex flex-col justify-between">
                  {/* Close detailed view button in the top left */}
                  <div className="flex justify-between items-center w-full mb-4 shrink-0">
                    <button
                      onClick={handleBackClick}
                      className="flex items-center gap-2 text-xs font-semibold text-text/60 hover:text-text transition-colors uppercase tracking-wider bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full border border-white/10 cursor-pointer"
                    >
                      <ChevronLeft size={14} /> Back
                    </button>
                    
                    <span className="bg-accent/15 text-accent border border-accent/25 px-3.5 py-1.5 rounded-full text-[10px] font-semibold tracking-wider uppercase">
                      {methods[selectedCard].category || 'Meditation'}
                    </span>
                  </div>

                  {/* Technique Name & Rhythm Pattern */}
                  <div className="mb-3 shrink-0">
                    <h3 className="text-2xl font-light text-text tracking-wide">{methods[selectedCard].name}</h3>
                    <p className="text-xs font-semibold tracking-wide text-accent mt-1 uppercase">
                      {getPatternText(selectedCard, methods[selectedCard])}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-text/75 leading-relaxed mb-4 font-light shrink-0">
                    {methods[selectedCard].description}
                  </p>

                  {/* Procedure Steps */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 mb-4 min-h-0 text-left">
                    <h5 className="text-[10px] font-semibold uppercase tracking-wider text-accent mb-2">Procedure Steps</h5>
                    <ol className="list-decimal pl-5 space-y-2 text-xs text-text/65 leading-relaxed">
                      {methods[selectedCard].steps.map((step, idx) => (
                        <li key={idx} className="pl-1 leading-normal">{step}</li>
                      ))}
                    </ol>
                  </div>

                  {/* Start Flow Button */}
                  <div className="pt-3 border-t border-white/5 shrink-0">
                    <button
                      onClick={() => {
                        handleMethodChange(selectedCard);
                        setIsMethodModalOpen(false);
                        setSelectedCard(null);
                        setIsClosingDetail(false);
                      }}
                      className="w-full py-3 px-6 rounded-md bg-accent text-bg font-bold text-xs tracking-widest uppercase hover:bg-indicator transition-all duration-300 transform active:scale-98 shadow-[0_0_20px_rgba(var(--color-accent),0.25)] cursor-pointer text-center"
                    >
                      Begin Practice
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Challenge Completion Modal */}
      <Modal
        isOpen={showCompletionModal && !!completionStats}
        onClose={() => {
          setHasDismissedCompletion(true);
        }}
        maxWidth="xl"
        zIndex="z-[110]"
        backdropBlur="xl"
        backdropOpacity="bg-black/80"
        className="text-center relative md:max-h-none overflow-x-hidden md:overflow-hidden"
      >
        {/* Background Decorative Icons */}
        <div className="absolute -top-10 -left-10 opacity-10 rotate-12 pointer-events-none">
          <Star className="w-20 h-20 md:w-[120px] md:h-[120px] text-accent" />
        </div>
        <div className="absolute -bottom-10 -right-10 opacity-10 -rotate-12 pointer-events-none">
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
            You've completed your 30-minute journey. Your dedication to mindfulness is truly inspiring.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-8 md:mb-10">
            <Card variant="flat" padding="sm" className="flex flex-col items-center">
              <Clock size={18} className="md:size-[20px] text-accent mb-1 md:mb-2" />
              <span className="text-xl md:text-2xl font-light">{completionStats?.minutes}</span>
              <span className="text-[0.6rem] md:text-[0.65rem] uppercase tracking-widest text-dim">Total Minutes</span>
            </Card>
            <Card variant="flat" padding="sm" className="flex flex-col items-center">
              <Calendar size={18} className="md:size-[20px] text-accent mb-1 md:mb-2" />
              <span className="text-xl md:text-2xl font-light">{completionStats?.days}</span>
              <span className="text-[0.6rem] md:text-[0.65rem] uppercase tracking-widest text-dim">Days Taken</span>
            </Card>
            <Card variant="flat" padding="sm" className="flex flex-col items-center">
              <Activity size={18} className="md:size-[20px] text-accent mb-1 md:mb-2" />
              <span className="text-xl md:text-2xl font-light">{completionStats?.sessions}</span>
              <span className="text-[0.6rem] md:text-[0.65rem] uppercase tracking-widest text-dim">Sessions</span>
            </Card>
            <Card variant="flat" padding="sm" className="flex flex-col items-center">
              <Target size={18} className="md:size-[20px] text-accent mb-1 md:mb-2" />
              <span className="text-base md:text-lg font-light line-clamp-1">{completionStats?.favoriteMethod}</span>
              <span className="text-[0.6rem] md:text-[0.65rem] uppercase tracking-widest text-dim">Favorite</span>
            </Card>
            <Card variant="flat" padding="sm" className="flex flex-col items-center col-span-2 md:col-span-2">
              <Zap size={18} className="md:size-[20px] text-accent mb-1 md:mb-2" />
              <span className="text-xl md:text-2xl font-light">{completionStats?.totalAums}</span>
              <span className="text-[0.6rem] md:text-[0.65rem] uppercase tracking-widest text-dim text-center">Total AUM Vibrations</span>
            </Card>
          </div>

          <div className="mb-8">
            <Textarea 
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              placeholder="Reflect on your journey... (Closure notes for CSV)"
              className="min-h-[60px] mb-4 text-center"
            />
            <Checkbox 
              checked={generateCsv}
              onChange={(e) => setGenerateCsv(e.target.checked)}
              label="Generate and download CSV report"
              className="justify-center"
            />
          </div>

          <Button 
            onClick={() => {
              setHasDismissedCompletion(true);
              resetChallenge(completionNotes, generateCsv);
              setCompletionNotes('');
              navigate('/');
            }}
            variant="primary"
            size="none"
            className="w-full py-4 md:py-5 text-base md:text-lg shadow-[0_0_40px_rgba(var(--color-accent-rgb),0.2)]"
          >
            <CheckCircle2 size={24} />
            Finish Journey
          </Button>
        </div>
      </Modal>

      {/* Challenge Expiration Modal */}
      <Modal
        isOpen={showExpirationModal && !!expirationStats}
        onClose={() => {
          setHasDismissedExpiration(true);
        }}
        maxWidth="xl"
        zIndex="z-[110]"
        backdropBlur="xl"
        backdropOpacity="bg-black/80"
        className="text-center relative md:max-h-none overflow-x-hidden md:overflow-hidden"
      >
        {/* Background Decorative Icons */}
        <div className="absolute -top-10 -left-10 opacity-10 rotate-12 pointer-events-none">
          <RefreshCcw className="w-20 h-20 md:w-[120px] md:h-[120px] text-accent" />
        </div>
        <div className="absolute -bottom-10 -right-10 opacity-10 -rotate-12 pointer-events-none">
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
            <Card variant="flat" padding="sm" className="flex flex-col items-center">
              <Clock size={18} className="md:size-[20px] text-accent mb-1 md:mb-2" />
              <span className="text-xl md:text-2xl font-light">{expirationStats?.minutes}</span>
              <span className="text-[0.6rem] md:text-[0.65rem] uppercase tracking-widest text-dim">Minutes Practiced</span>
            </Card>
            <Card variant="flat" padding="sm" className="flex flex-col items-center">
              <Calendar size={18} className="md:size-[20px] text-accent mb-1 md:mb-2" />
              <span className="text-xl md:text-2xl font-light">{expirationStats?.days}</span>
              <span className="text-[0.6rem] md:text-[0.65rem] uppercase tracking-widest text-dim">Days Completed</span>
            </Card>
            <Card variant="flat" padding="sm" className="flex flex-col items-center">
              <Activity size={18} className="md:size-[20px] text-accent mb-1 md:mb-2" />
              <span className="text-xl md:text-2xl font-light">{expirationStats?.sessions}</span>
              <span className="text-[0.6rem] md:text-[0.65rem] uppercase tracking-widest text-dim">Sessions</span>
            </Card>
            <Card variant="flat" padding="sm" className="flex flex-col items-center">
              <Target size={18} className="md:size-[20px] text-accent mb-1 md:mb-2" />
              <span className="text-base md:text-lg font-light line-clamp-1">{expirationStats?.favoriteMethod}</span>
              <span className="text-[0.6rem] md:text-[0.65rem] uppercase tracking-widest text-dim">Favorite</span>
            </Card>
            <Card variant="flat" padding="sm" className="flex flex-col items-center col-span-2 md:col-span-2">
              <Zap size={18} className="md:size-[20px] text-accent mb-1 md:mb-2" />
              <span className="text-xl md:text-2xl font-light">{expirationStats?.totalAums}</span>
              <span className="text-[0.6rem] md:text-[0.65rem] uppercase tracking-widest text-dim text-center">Total AUM Vibrations</span>
            </Card>
          </div>

          <div className="mb-8">
            <Textarea 
              value={expirationNotes}
              onChange={(e) => setExpirationNotes(e.target.value)}
              placeholder="What happened? (Closure notes for CSV)"
              className="min-h-[60px] mb-4 text-center"
            />
            <Checkbox 
              checked={generateCsv}
              onChange={(e) => setGenerateCsv(e.target.checked)}
              label="Generate and download CSV report"
              className="justify-center"
            />
          </div>

          <Button
            onClick={() => {
              setHasDismissedExpiration(true);
              resetChallenge(expirationNotes, generateCsv);
              setExpirationNotes('');
              navigate('/');
            }}
            variant="primary"
            size="none"
            className="w-full py-4 md:py-5 text-base md:text-lg shadow-[0_0_40px_rgba(var(--color-accent-rgb),0.2)]"
          >
            <RefreshCcw size={24} />
            Start Over
          </Button>
        </div>
      </Modal>
    </div>
  )
}

export default App
