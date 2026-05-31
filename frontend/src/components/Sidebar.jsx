import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Wind, History as HistoryIcon, Settings, ChevronDown, ChevronRight, BookOpen, Github } from 'lucide-react';

function Sidebar({ methods, selectedMethod, onMethodChange, isSessionActive, onNavigateAttempt }) {
  const [methodsExpanded, setMethodsExpanded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const activeClass = 'bg-accent text-bg font-medium opacity-100 shadow-lg shadow-accent/20';
  const inactiveClass = 'text-text opacity-60 hover:bg-white/5 hover:opacity-100';

  const linkClass = ({ isActive }) => 
    `w-full text-left border border-transparent p-3 md:p-4 rounded-full md:rounded-squircle-md cursor-pointer transition-all duration-300 text-base flex items-center justify-center md:justify-start md:gap-4 ${
      isActive ? activeClass : inactiveClass
    }`;

  const isBreatheActive = location.pathname === '/methods' || location.pathname === '/practice';

  const handleNavClick = (e, path) => {
    if (isSessionActive) {
      e.preventDefault();
      onNavigateAttempt(path);
    }
  };

  const handleBreatheClick = (e) => {
    if (isSessionActive) {
      e.preventDefault();
      onNavigateAttempt(window.innerWidth < 768 ? '/methods' : location.pathname);
      return;
    }

    if (window.innerWidth < 768) {
      e.preventDefault();
      navigate('/methods');
    } else {
      setMethodsExpanded(!methodsExpanded);
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-col md:relative md:w-72 md:min-w-[280px] md:h-full bg-white/5 backdrop-blur-3xl border-r border-white/10 py-10 px-6 z-50">
        <div className="flex flex-col items-center mb-14 gap-4">
          <h2 className="font-extralight tracking-widest text-2xl text-text uppercase">The Breath App</h2>
          <a 
            href="https://github.com/vishwascr/breathingapp" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-dim hover:text-accent transition-colors duration-300 flex items-center gap-2"
          >
            <Github size={16} />
            <span className="text-[0.65rem] uppercase tracking-widest">v1.0.0</span>
          </a>
        </div>
        
        <div className="w-full">
          <h3 className="text-[0.75rem] uppercase tracking-[2px] text-dim mb-5 pl-2 font-medium">Menu</h3>
          <ul className="flex flex-col gap-2 list-none p-0 m-0 w-full">
            <li>
              <NavLink to="/" className={linkClass} onClick={(e) => handleNavClick(e, '/')}>
                <LayoutDashboard size={20} />
                <span>Dashboard</span>
              </NavLink>
            </li>
            
            <li className="relative">
              <button 
                className={`w-full text-left border border-transparent p-4 rounded-squircle-md cursor-pointer transition-all duration-300 text-base flex items-center justify-between ${isBreatheActive ? activeClass : inactiveClass}`}
                onClick={handleBreatheClick}
              >
                <div className="flex items-center gap-4">
                  <Wind size={20} />
                  <span>Breathing Techniques</span>
                </div>
                {methodsExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              
              {methodsExpanded && (
                <ul className="flex list-none p-2 pl-4 m-0 flex-col gap-2 mt-1">
                  {Object.entries(methods).map(([key, method]) => (
                    <li key={key}>
                      <button 
                        className={`w-full text-left bg-transparent border border-transparent p-3 rounded-squircle-md transition-all duration-300 text-sm ${
                          selectedMethod === key 
                          ? 'text-white font-medium opacity-100' 
                          : 'text-text opacity-50 hover:bg-white/5 hover:opacity-100'
                        }`}
                        onClick={() => {
                          if (isSessionActive) {
                            onNavigateAttempt('/practice');
                            return;
                          }
                          onMethodChange(key);
                        }}
                      >
                        {method.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>

            <li>
              <NavLink to="/history" className={linkClass} onClick={(e) => handleNavClick(e, '/history')}>
                <HistoryIcon size={20} />
                <span>History</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/settings" className={linkClass} onClick={(e) => handleNavClick(e, '/settings')}>
                <Settings size={20} />
                <span>Settings</span>
              </NavLink>
            </li>
          </ul>
        </div>
      </div>

      {/* Mobile Pill Navigation (iOS App Dock Style) */}
      <div 
        className="fixed bottom-[env(safe-area-inset-bottom,0.5rem)] left-1/2 -translate-x-1/2 w-[92%] max-w-[400px] h-16 bg-white/[0.08] backdrop-blur-[24px] border border-white/10 flex md:hidden flex-row items-center justify-around px-2 z-[100] rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
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
