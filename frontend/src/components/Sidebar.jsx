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
    `w-full md:text-left border border-transparent p-3 md:p-4 rounded-squircle-md cursor-pointer transition-all duration-300 text-[10px] md:text-base flex flex-col md:flex-row items-center md:justify-start md:gap-4 gap-1 ${
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
    <div className="fixed bottom-0 left-0 w-full h-20 md:h-full md:relative md:w-72 md:min-w-[280px] bg-white/5 backdrop-blur-3xl border-t md:border-t-0 md:border-r border-white/10 flex flex-row md:flex-col items-center md:items-stretch justify-around md:justify-start md:py-10 px-4 md:px-6 z-50">
      <div className="hidden md:flex flex-col items-center mb-14 gap-4">
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
        <h3 className="hidden md:block text-[0.75rem] uppercase tracking-[2px] text-dim mb-5 pl-2 font-medium">Menu</h3>
        <ul className="flex flex-row md:flex-col justify-around md:justify-start gap-1 md:gap-2 list-none p-0 m-0 w-full">
          <li>
            <NavLink to="/" className={linkClass} onClick={(e) => handleNavClick(e, '/')}>
              <LayoutDashboard size={20} />
              <span className="hidden md:inline">Dashboard</span>
              <span className="md:hidden">Home</span>
            </NavLink>
          </li>
          
          <li className="relative">
            <button 
              className={`w-full md:text-left border border-transparent p-3 md:p-4 rounded-squircle-md cursor-pointer transition-all duration-300 text-[10px] md:text-base flex flex-col md:flex-row items-center md:justify-start md:gap-4 gap-1 ${isBreatheActive ? activeClass : inactiveClass}`}
              onClick={handleBreatheClick}
            >
              <div className="flex flex-col md:flex-row items-center md:gap-4 gap-1 flex-1">
                <Wind size={20} />
                <span className="hidden md:inline">Breathing Techniques</span>
                <span className="md:hidden">Breathe</span>
              </div>
              {methodsExpanded ? <ChevronDown size={16} className="hidden md:inline-block" /> : <ChevronRight size={16} className="hidden md:inline-block" />}
            </button>
            
            {methodsExpanded && (
              <ul className="hidden md:flex list-none p-2 pl-4 m-0 flex-col gap-2 mt-1">
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
                          onNavigateAttempt('/practice'); // Re-selecting current or new practice while active
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
              <span className="hidden md:inline">History</span>
              <span className="md:hidden">History</span>
            </NavLink>
          </li>
          <li className="hidden md:block">
            <NavLink to="/belly-breathing-guide" className={linkClass} onClick={(e) => handleNavClick(e, '/belly-breathing-guide')}>
              <BookOpen size={20} />
              <span className="hidden md:inline">Breathing Guide</span>
              <span className="md:hidden">Guide</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/settings" className={linkClass} onClick={(e) => handleNavClick(e, '/settings')}>
              <Settings size={20} />
              <span className="hidden md:inline">Settings</span>
              <span className="md:hidden">Settings</span>
            </NavLink>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Sidebar;
