import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import './App.css'

import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import Practice from './components/Practice'
import History from './components/History'
import Settings from './components/Settings'
import Methods from './components/Methods'

const INITIAL_METHODS = {
  box: { name: 'Box Breathing', pattern: [4, 4, 4, 4] },
  deepBelly: { name: 'Diaphragmatic Breathing', pattern: [5, 0, 5, 0] },
  '478': { name: '4-7-8 Breathing', pattern: [4, 7, 8, 0] }
};

const THEMES = {
  noir: {
    name: 'Noir (Night)',
    colors: {
      bg: '#000000',
      accent: '#91936A',
      indicator: '#D3D4C2',
      glass: '#1A1A17',
      text: '#E8E9E0',
      secondary: '#21211B',
      dim: '#BDBEA5'
    }
  },
  mint: {
    name: 'Mint (Fresh)',
    colors: {
      bg: '#000000',
      accent: '#42f5ad',
      indicator: '#00ffa3',
      glass: '#0D1412',
      text: '#E0FFF4',
      secondary: '#101a15',
      dim: '#80A396'
    }
  }
};

function App() {
  const [methods, setMethods] = useState(INITIAL_METHODS);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [history, setHistory] = useState([]);
  const [theme, setTheme] = useState(null); // No default theme in frontend
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [pendingNav, setPendingNav] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const showStripes = ['/', '/history', '/settings'].includes(location.pathname);

  const confirmEndSession = () => {
    const target = pendingNav;
    setPendingNav(null);
    setIsSessionActive(false);
    navigate(target);
  };

  useEffect(() => {
    let isMounted = true;
    const loadInitialData = async () => {
      try {
        // Load History
        const historyRes = await fetch('/api/history');
        const historyData = await historyRes.json();
        if (isMounted) setHistory(historyData);

        // Load Theme
        const themeRes = await fetch('/api/settings/theme');
        const themeData = await themeRes.json();
        if (isMounted) setTheme(themeData.theme);
      } catch (err) {
        console.error('Failed to fetch initial data:', err);
        if (isMounted) setTheme('noir'); // Fallback if DB fails
      }
    };
    loadInitialData();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (!theme) return;
    const root = document.documentElement;
    const colors = THEMES[theme].colors;
    root.style.setProperty('--color-bg', colors.bg);
    root.style.setProperty('--color-accent', colors.accent);
    root.style.setProperty('--indicator-color', colors.indicator);
    root.style.setProperty('--glass-color', colors.glass);
    root.style.setProperty('--color-text', colors.text);
    root.style.setProperty('--color-secondary', colors.secondary);
    root.style.setProperty('--color-dim', colors.dim);
  }, [theme]);

  const updateTheme = async (newTheme) => {
    try {
      setTheme(newTheme);
      await fetch('/api/settings/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: newTheme })
      });
    } catch (err) {
      console.error('Failed to save theme:', err);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/history');
      const data = await response.json();
      setHistory(data);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  };

  const saveHistory = async (duration, patternName, notes) => {
    try {
      await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration, pattern: patternName, notes })
      });
      fetchHistory();
    } catch (err) {
      console.error('Failed to save history:', err);
    }
  };

  const updateBoxDuration = (newPattern) => {
    setMethods(prev => ({
      ...prev,
      box: { ...prev.box, pattern: newPattern }
    }));
  };

  const handleMethodChange = (methodKey) => {
    setSelectedMethod(methodKey);
    navigate('/practice');
  };

  if (!theme) return (
    <div className="w-screen h-screen bg-[#000000] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-white/10 border-t-white rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg text-text transition-colors duration-500 relative isolate">
      {/* UI Layer */}
      <div className="flex flex-col md:flex-row w-full min-h-screen relative z-10">
        <Sidebar 
          methods={methods} 
          selectedMethod={selectedMethod} 
          onMethodChange={handleMethodChange} 
          isSessionActive={isSessionActive}
          onNavigateAttempt={(path) => setPendingNav(path)}
        />
        
        <div className="flex-1 relative isolate min-h-screen md:ml-72">
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
          
          <main className="w-full min-h-screen p-6 md:p-12 flex justify-center items-start relative z-10 pb-32 md:pb-12">
            <Routes>
              <Route path="/" element={
                <Dashboard 
                  history={history} 
                  methods={methods}
                  selectedMethod={selectedMethod}
                  onMethodChange={handleMethodChange}
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
              <Route path="/history" element={<History history={history} />} />
              <Route 
                path="/settings" 
                element={
                  <Settings 
                    methods={methods} 
                    updateBoxDuration={updateBoxDuration}
                    currentTheme={theme}
                    setTheme={updateTheme}
                    themes={THEMES}
                  />
                } 
              />
              <Route path="/methods" element={<Methods methods={methods} selectedMethod={selectedMethod} onMethodChange={handleMethodChange} />} />
            </Routes>
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
    </div>
  )
}

export default App
