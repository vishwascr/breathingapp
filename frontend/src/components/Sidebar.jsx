import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Wind, History as HistoryIcon, Settings, Sparkles } from 'lucide-react';

function Sidebar({ isSessionActive, onNavigateAttempt, openMethodModal, isMethodModalOpen, challengeActive }) {
  const location = useLocation();

  const activeClass = 'bg-accent text-bg font-medium opacity-100 shadow-lg shadow-accent/20';
  const inactiveClass = 'text-text opacity-60 hover:bg-white/5 hover:opacity-100';

  const linkClass = ({ isActive }) => 
    `w-full text-left border border-transparent p-3 md:p-4 rounded-full md:rounded-squircle-md cursor-pointer transition-all duration-300 text-base flex items-center justify-center md:justify-start md:gap-4 ${
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

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-col md:fixed md:top-0 md:left-0 md:w-72 md:min-w-[280px] md:h-dvh bg-[var(--sidebar-bg)] backdrop-blur-[var(--sidebar-blur)] border-r border-[color:var(--sidebar-border)] py-10 px-6 z-50">
        <div className="flex flex-col items-center mb-14 gap-4">
          <h2 className="font-extralight tracking-widest text-2xl text-text uppercase">The Breath App</h2>
        </div>
        
        <div className="w-full flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-[0.75rem] uppercase tracking-[2px] text-dim mb-5 pl-2 font-medium">Menu</h3>
            <ul className="flex flex-col gap-2 list-none p-0 m-0 w-full">
              <li>
                <NavLink to="/" className={linkClass} onClick={(e) => handleNavClick(e, '/')}>
                  <LayoutDashboard size={20} />
                  <span>Dashboard</span>
                </NavLink>
              </li>
              
              {challengeActive && (
                <li className="relative">
                  <button 
                    className={`w-full text-left border border-transparent p-4 rounded-squircle-md cursor-pointer transition-all duration-300 text-base flex items-center justify-between ${isBreatheActive ? activeClass : inactiveClass}`}
                    onClick={handleBreatheClick}
                  >
                    <div className="flex items-center gap-4">
                      <Wind size={20} />
                      <span>Breathing Techniques</span>
                    </div>
                  </button>
                </li>
              )}



              <li>
                <NavLink to="/history" className={linkClass} onClick={(e) => handleNavClick(e, '/history')}>
                  <HistoryIcon size={20} />
                  <span>History</span>
                </NavLink>
              </li>
            </ul>
          </div>

          <div className="mt-auto pt-4 border-t border-white/5">
            <NavLink to="/settings" className={linkClass} onClick={(e) => handleNavClick(e, '/settings')}>
              <Settings size={20} />
              <span>Settings</span>
            </NavLink>
          </div>
        </div>
      </div>

      {/* Mobile Pill Navigation (iOS App Dock Style) */}
      <div 
        className="fixed bottom-[env(safe-area-inset-bottom,0.5rem)] left-1/2 -translate-x-1/2 w-[92%] max-w-[400px] h-16 bg-[var(--mobile-nav-bg)] backdrop-blur-[var(--mobile-nav-blur)] border border-[color:var(--mobile-nav-border)] flex md:hidden flex-row items-center justify-around px-2 z-[100] rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
      >
        <ul className="flex flex-row justify-around items-center w-full list-none p-0 m-0">
          <li className="flex-1 flex justify-center">
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                `p-3.5 rounded-[1.2rem] transition-all duration-300 flex items-center justify-center ${
                  isActive ? 'bg-white/10 text-white shadow-sm' : 'text-white/50 hover:text-white'
                }`
              }
              onClick={(e) => handleNavClick(e, '/')}
            >
              <LayoutDashboard size={24} strokeWidth={1.5} />
            </NavLink>
          </li>
          {challengeActive && (
            <li className="flex-1 flex justify-center">
              <button 
                className={`p-3.5 rounded-[1.2rem] transition-all duration-300 flex items-center justify-center ${
                  isBreatheActive ? 'bg-white/10 text-white shadow-sm' : 'text-white/50 hover:text-white'
                }`}
                onClick={handleBreatheClick}
              >
                <Wind size={24} strokeWidth={1.5} />
              </button>
            </li>
          )}


          <li className="flex-1 flex justify-center">
            <NavLink 
              to="/history" 
              className={({ isActive }) => 
                `p-3.5 rounded-[1.2rem] transition-all duration-300 flex items-center justify-center ${
                  isActive ? 'bg-white/10 text-white shadow-sm' : 'text-white/50 hover:text-white'
                }`
              }
              onClick={(e) => handleNavClick(e, '/history')}
            >
              <HistoryIcon size={24} strokeWidth={1.5} />
            </NavLink>
          </li>
          <li className="flex-1 flex justify-center">
            <NavLink 
              to="/settings" 
              className={({ isActive }) => 
                `p-3.5 rounded-[1.2rem] transition-all duration-300 flex items-center justify-center ${
                  isActive ? 'bg-white/10 text-white shadow-sm' : 'text-white/50 hover:text-white'
                }`
              }
              onClick={(e) => handleNavClick(e, '/settings')}
            >
              <Settings size={24} strokeWidth={1.5} />
            </NavLink>
          </li>
        </ul>
      </div>
    </>
  );
}

export default Sidebar;
