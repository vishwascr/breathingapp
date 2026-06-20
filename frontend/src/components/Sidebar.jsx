import { useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Wind, History as HistoryIcon, Settings, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

function Sidebar({ isSessionActive, onNavigateAttempt, openMethodModal, isMethodModalOpen, challengeActive, isCollapsed, onToggleCollapse, onExpand }) {
  const location = useLocation();

  const hoverTimerRef = useRef(null);

  const handleMouseEnter = () => {
    if (isCollapsed) {
      hoverTimerRef.current = setTimeout(() => {
        onExpand();
      }, 2000); // Trigger expansion after 2s of continuous hover
    }
  };

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  };

  // Clear any active timer if the collapsed state changes (e.g. manually toggled)
  useEffect(() => {
    if (!isCollapsed && hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  }, [isCollapsed]);

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
    };
  }, []);

  const activeClass = isCollapsed 
    ? 'bg-transparent border-transparent text-text opacity-100 shadow-none'
    : 'bg-white/10 border-white/5 text-text font-medium opacity-100 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_4px_12px_rgba(0,0,0,0.15)]';
  const inactiveClass = isCollapsed 
    ? 'text-text opacity-60 border-transparent bg-transparent hover:opacity-100'
    : 'text-text opacity-60 border-transparent hover:bg-white/5 hover:opacity-100';

  const linkClass = ({ isActive }) => 
    `w-full text-left border border-transparent rounded-full md:rounded-squircle-md cursor-pointer transition-[padding,background-color,color,opacity] duration-300 text-base flex items-center group ${
      isCollapsed ? 'md:p-2 md:justify-center' : 'md:p-3 md:pl-3.5'
    } ${
      isActive ? activeClass : inactiveClass
    }`;

  const isBreatheActive = isMethodModalOpen || location.pathname.startsWith('/practice');
  const isDashboardActive = location.pathname === '/';
  const isHistoryActive = location.pathname === '/history';
  const isSettingsActive = location.pathname === '/settings';

  const handleNavClick = (e, path) => {
    if (isSessionActive) {
      e.preventDefault();
      onNavigateAttempt(path);
    }
  };

  const handleBreatheClick = (e) => {
    e.preventDefault();
    if (isSessionActive) {
      onNavigateAttempt('MODAL');
      return;
    }
    openMethodModal();
  };

  const isMac = typeof window !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  const shortcutHint = isMac ? '⌘B' : 'Ctrl+B';

  return (
    <>
      {/* Desktop Sidebar */}
      <div 
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`hidden md:flex md:flex-col md:fixed md:top-0 md:left-0 md:h-dvh border-r border-[color:var(--sidebar-border)] py-10 z-50 transition-[width,min-width,padding,box-shadow,background-color] duration-300 ease-in-out ${
          isCollapsed 
            ? 'md:w-20 md:min-w-[80px] md:px-3 shadow-none bg-[var(--sidebar-bg)] backdrop-blur-[var(--sidebar-blur)]' 
            : 'md:w-72 md:min-w-[280px] md:px-6 shadow-[10px_0_30px_rgba(0,0,0,0.5)] border-r border-white/10 bg-bg'
        }`}
      >
        <div className={`flex items-center mb-14 px-2 overflow-hidden transition-[justify-content,padding] duration-300 ${
          isCollapsed ? 'md:justify-center md:px-0' : ''
        }`}>
          <span className="text-5xl font-light text-accent leading-none shrink-0 w-12 h-12 flex items-center justify-center animate-pulse">⌘</span>
          <h2 className={`font-extralight tracking-wider text-base md:text-lg text-text uppercase whitespace-nowrap overflow-hidden transition-[opacity,max-width,margin] duration-300 ease-in-out ${
            isCollapsed ? 'opacity-0 max-w-0 ml-0' : 'opacity-100 max-w-[250px] ml-4'
          }`}>
            The Breath App
          </h2>
        </div>
        
        <div className="w-full flex-1 flex flex-col justify-between">
          <div>
            <ul className="flex flex-col gap-2 list-none p-0 m-0 w-full">
              <li>
                <NavLink to="/" className={linkClass} onClick={(e) => handleNavClick(e, '/')} title={isCollapsed ? "Dashboard" : undefined}>
                  <div className={`flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-[22%] transition-all duration-300 border ${
                    isDashboardActive 
                      ? 'bg-accent text-bg border-accent/20 shadow-md shadow-accent/20' 
                      : 'bg-accent/5 border-accent/10 text-dim group-hover:bg-accent/15 group-hover:text-accent group-hover:border-accent/20'
                  }`}>
                    <LayoutDashboard size={18} />
                  </div>
                  <span className={`transition-[opacity,max-width,margin] duration-300 ease-in-out whitespace-nowrap overflow-hidden ${
                    isCollapsed ? 'opacity-0 max-w-0 ml-0' : 'opacity-100 max-w-[200px] ml-4'
                  }`}>
                    Dashboard
                  </span>
                </NavLink>
              </li>
              
              {challengeActive && (
                <li className="relative">
                  <button 
                    className={`${linkClass({ isActive: isBreatheActive })} breathe-techniques-btn-custom`}
                    onClick={handleBreatheClick}
                    title={isCollapsed ? "Breathing Techniques" : undefined}
                  >
                    <div className={`flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-[22%] transition-all duration-300 border ${
                      isBreatheActive 
                        ? 'bg-accent text-bg border-accent/20 shadow-md shadow-accent/20' 
                        : 'bg-accent/5 border-accent/10 text-dim group-hover:bg-accent/15 group-hover:text-accent group-hover:border-accent/20'
                    }`}>
                      <Wind size={18} />
                    </div>
                    <span className={`transition-[opacity,max-width,margin] duration-300 ease-in-out whitespace-nowrap overflow-hidden ${
                      isCollapsed ? 'opacity-0 max-w-0 ml-0' : 'opacity-100 max-w-[200px] ml-4'
                    }`}>
                      Breathing Techniques
                    </span>
                  </button>
                </li>
              )}

              <li>
                <NavLink to="/history" className={linkClass} onClick={(e) => handleNavClick(e, '/history')} title={isCollapsed ? "History" : undefined}>
                  <div className={`flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-[22%] transition-all duration-300 border ${
                    isHistoryActive 
                      ? 'bg-accent text-bg border-accent/20 shadow-md shadow-accent/20' 
                      : 'bg-accent/5 border-accent/10 text-dim group-hover:bg-accent/15 group-hover:text-accent group-hover:border-accent/20'
                  }`}>
                    <HistoryIcon size={18} />
                  </div>
                  <span className={`transition-[opacity,max-width,margin] duration-300 ease-in-out whitespace-nowrap overflow-hidden ${
                    isCollapsed ? 'opacity-0 max-w-0 ml-0' : 'opacity-100 max-w-[200px] ml-4'
                  }`}>
                    History
                  </span>
                </NavLink>
              </li>
            </ul>
          </div>

          <div className="mt-auto pt-4 border-t border-white/5 flex flex-col gap-2">
            <NavLink to="/settings" className={linkClass} onClick={(e) => handleNavClick(e, '/settings')} title={isCollapsed ? "Settings" : undefined}>
              <div className={`flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-[22%] transition-all duration-300 border ${
                isSettingsActive 
                  ? 'bg-accent text-bg border-accent/20 shadow-md shadow-accent/20' 
                  : 'bg-accent/5 border-accent/10 text-dim group-hover:bg-accent/15 group-hover:text-accent group-hover:border-accent/20'
              }`}>
                <Settings size={18} />
              </div>
              <span className={`transition-[opacity,max-width,margin] duration-300 ease-in-out whitespace-nowrap overflow-hidden ${
                isCollapsed ? 'opacity-0 max-w-0 ml-0' : 'opacity-100 max-w-[200px] ml-4'
              }`}>
                Settings
              </span>
            </NavLink>
            
            <button
              onClick={onToggleCollapse}
              className={linkClass({ isActive: false })}
              title={isCollapsed ? `Expand Sidebar (${shortcutHint})` : `Collapse Sidebar (${shortcutHint})`}
            >
              <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-[22%] transition-all duration-300 border bg-accent/5 border-accent/10 text-dim group-hover:bg-accent/15 group-hover:text-accent group-hover:border-accent/20">
                {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
              </div>
              <span className={`transition-[opacity,max-width,margin] duration-300 ease-in-out whitespace-nowrap overflow-hidden ${
                isCollapsed ? 'opacity-0 max-w-0 ml-0' : 'opacity-100 max-w-[200px] ml-4'
              }`}>
                Collapse
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Pill Navigation (iOS App Dock Style) */}
      <div 
        className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-[420px] h-20 bg-white/[0.08] border border-white/10 flex md:hidden flex-row items-center justify-around px-3 z-[100] rounded-[2.2rem] shadow-[0_12px_40px_rgba(0,0,0,0.5)]"
        style={{
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
        }}
      >
        <ul className="flex flex-row justify-around items-center w-full list-none p-0 m-0">
          <li className="flex-1 flex justify-center">
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                `p-4 rounded-[1.4rem] transition-all duration-300 ease-out flex items-center justify-center ${
                  isActive ? 'bg-accent text-bg shadow-[0_0_15px_var(--color-accent)] scale-110 font-medium' : 'text-white/50 hover:text-white active:scale-95'
                }`
              }
              onClick={(e) => handleNavClick(e, '/')}
            >
              <LayoutDashboard size={26} strokeWidth={1.5} />
            </NavLink>
          </li>
          {challengeActive && (
            <li className="flex-1 flex justify-center">
              <button 
                className={`p-5 rounded-[1.4rem] transition-all duration-300 ease-out flex items-center justify-center breathe-techniques-btn-custom ${
                  isBreatheActive ? 'bg-accent text-bg shadow-[0_0_15px_var(--color-accent)] scale-110 font-medium' : 'text-white/50 hover:text-white active:scale-95'
                }`}
                onClick={handleBreatheClick}
              >
                <Wind size={26} strokeWidth={2} />
              </button>
            </li>
          )}


          <li className="flex-1 flex justify-center">
            <NavLink 
              to="/history" 
              className={({ isActive }) => 
                `p-4 rounded-[1.4rem] transition-all duration-300 ease-out flex items-center justify-center ${
                  isActive ? 'bg-accent text-bg shadow-[0_0_15px_var(--color-accent)] scale-110 font-medium' : 'text-white/50 hover:text-white active:scale-95'
                }`
              }
              onClick={(e) => handleNavClick(e, '/history')}
            >
              <HistoryIcon size={26} strokeWidth={1.5} />
            </NavLink>
          </li>
          <li className="flex-1 flex justify-center">
            <NavLink 
              to="/settings" 
              className={({ isActive }) => 
                `p-4 rounded-[1.4rem] transition-all duration-300 ease-out flex items-center justify-center ${
                  isActive ? 'bg-accent text-bg shadow-[0_0_15px_var(--color-accent)] scale-110 font-medium' : 'text-white/50 hover:text-white active:scale-95'
                }`
              }
              onClick={(e) => handleNavClick(e, '/settings')}
            >
              <Settings size={26} strokeWidth={1.5} />
            </NavLink>
          </li>
        </ul>
      </div>
    </>
  );
}

export default Sidebar;
