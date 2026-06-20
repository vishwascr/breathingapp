import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Wind, History as HistoryIcon, Settings, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

function Sidebar({ isSessionActive, onNavigateAttempt, openMethodModal, isMethodModalOpen, challengeActive, isCollapsed, onToggleCollapse }) {
  const location = useLocation();

  const activeClass = 'bg-accent text-bg font-medium opacity-100 shadow-lg shadow-accent/20';
  const inactiveClass = 'text-text opacity-60 hover:bg-white/5 hover:opacity-100';

  const linkClass = ({ isActive }) => 
    `w-full text-left border border-transparent rounded-full md:rounded-squircle-md cursor-pointer transition-all duration-300 text-base flex items-center ${
      isCollapsed ? 'md:p-3' : 'md:p-4'
    } ${
      isActive ? activeClass : inactiveClass
    }`;

  const isBreatheActive = isMethodModalOpen || location.pathname.startsWith('/practice');

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
      <div className={`hidden md:flex md:flex-col md:fixed md:top-0 md:left-0 md:h-dvh bg-[var(--sidebar-bg)] backdrop-blur-[var(--sidebar-blur)] border-r border-[color:var(--sidebar-border)] py-10 z-50 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'md:w-20 md:min-w-[80px] md:px-3' : 'md:w-72 md:min-w-[280px] md:px-6'
      }`}>
        <div className={`flex items-center mb-14 px-2 overflow-hidden`}>
          <span className="text-2xl font-semibold text-accent leading-none shrink-0 w-6 h-6 flex items-center justify-center animate-pulse">⌘</span>
          <h2 className={`font-extralight tracking-widest text-lg text-text uppercase whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${
            isCollapsed ? 'opacity-0 max-w-0 ml-0' : 'opacity-100 max-w-[200px] ml-4'
          }`}>
            The Breath App
          </h2>
        </div>
        
        <div className="w-full flex-1 flex flex-col justify-between">
          <div>
            <ul className="flex flex-col gap-2 list-none p-0 m-0 w-full">
              <li>
                <NavLink to="/" className={linkClass} onClick={(e) => handleNavClick(e, '/')} title={isCollapsed ? "Dashboard" : undefined}>
                  <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                    <LayoutDashboard size={20} />
                  </div>
                  <span className={`transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden ${
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
                    <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                      <Wind size={20} />
                    </div>
                    <span className={`transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden ${
                      isCollapsed ? 'opacity-0 max-w-0 ml-0' : 'opacity-100 max-w-[200px] ml-4'
                    }`}>
                      Breathing Techniques
                    </span>
                  </button>
                </li>
              )}

              <li>
                <NavLink to="/history" className={linkClass} onClick={(e) => handleNavClick(e, '/history')} title={isCollapsed ? "History" : undefined}>
                  <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                    <HistoryIcon size={20} />
                  </div>
                  <span className={`transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden ${
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
              <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                <Settings size={20} />
              </div>
              <span className={`transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden ${
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
              <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
              </div>
              <span className={`transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden ${
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
