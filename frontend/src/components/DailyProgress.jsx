import { useState } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './common';

function DailyProgress({ practicedDates, challengeStartDate }) {
  const [viewDate, setViewDate] = useState(new Date());

  const formatDuration = (seconds) => {
    if (!seconds) return '0s';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    let parts = [];
    if (hrs > 0) parts.push(`${hrs}h`);
    if (mins > 0) parts.push(`${mins}m`);
    parts.push(`${secs}s`);
    return parts.join(' ');
  };

  const getDayDetails = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return {
      date: d,
      dateStr,
      duration: practicedDates[dateStr] || 0
    };
  };

  const currentDay = getDayDetails(viewDate);
  const startDay = challengeStartDate ? new Date(challengeStartDate) : new Date();
  startDay.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const canGoPrev = currentDay.date > startDay;
  const canGoNext = currentDay.date < today;

  const handlePrev = () => {
    if (!canGoPrev) return;
    const newDate = new Date(currentDay.date);
    newDate.setDate(newDate.getDate() - 1);
    setViewDate(newDate);
  };

  const handleNext = () => {
    if (!canGoNext) return;
    const newDate = new Date(currentDay.date);
    newDate.setDate(newDate.getDate() + 1);
    setViewDate(newDate);
  };

  const dayNumber = Math.floor((currentDay.date - startDay) / (1000 * 60 * 60 * 24)) + 1;

  if (!challengeStartDate) return null;

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div className="flex items-center gap-2">
          <CalendarIcon size={16} className="text-accent" />
          <h3 className="text-sm uppercase tracking-widest text-text/80 font-medium">Daily Journey</h3>
        </div>
        <div className="text-accent text-[0.65rem] uppercase tracking-widest font-medium">
          Day {dayNumber} of Challenge
        </div>
      </div>

      <div className="flex-1 flex items-center justify-between gap-4">
        <Button 
          onClick={handlePrev}
          disabled={!canGoPrev}
          variant="ghost"
          size="none"
          rounded="full"
          className="p-3 text-text disabled:text-dim"
        >
          <ChevronLeft size={24} />
        </Button>

        <div className="flex flex-col items-center text-center animate-fadeIn">
          <span className="text-xs uppercase tracking-[0.3rem] text-dim mb-2">
            {currentDay.date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
          </span>
          <div className="flex items-baseline gap-3 mb-1">
            <span className={`text-5xl md:text-6xl font-thin tracking-tighter ${currentDay.duration > 0 ? 'text-accent' : 'text-text/40'}`}>
              {currentDay.duration > 0 ? formatDuration(currentDay.duration).split(' ')[0] : '0s'}
            </span>
            {currentDay.duration > 0 && formatDuration(currentDay.duration).split(' ').length > 1 && (
              <span className="text-xl font-light text-dim uppercase tracking-widest">
                {formatDuration(currentDay.duration).split(' ').slice(1).join(' ')}
              </span>
            )}
            {currentDay.duration > 0 && formatDuration(currentDay.duration).split(' ').length === 1 && (
              <span className="text-xl font-light text-dim uppercase tracking-widest">
                {formatDuration(currentDay.duration).includes('m') ? '' : ''}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-dim/60">
            <Clock size={14} />
            <span className="text-sm font-light tracking-wide">Meditation Time</span>
          </div>
        </div>

        <Button 
          onClick={handleNext}
          disabled={!canGoNext}
          variant="ghost"
          size="none"
          rounded="full"
          className="p-3 text-text disabled:text-dim"
        >
          <ChevronRight size={24} />
        </Button>
      </div>

      <div className="mt-8 pt-4 border-t border-white/5 flex justify-center gap-1.5 shrink-0">
        <span className="text-[0.6rem] uppercase tracking-widest text-dim/40">
          Viewing {currentDay.dateStr === todayStr ? 'Today' : 'Past Progress'}
        </span>
      </div>
    </div>
  );
}

export default DailyProgress;
