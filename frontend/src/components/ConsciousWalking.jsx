import { useState, useEffect } from 'react';
import { Footprints, Plus, Minus, MessageSquare, ChevronLeft, ChevronRight, Save, Loader2, Check } from 'lucide-react';
import { Card, Button } from './common';

const ConsciousWalking = ({ refreshStats }) => {
  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const [minutes, setMinutes] = useState(0);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    const fetchWalk = async () => {
      setLoading(true);
      setJustSaved(false);
      try {
        const dateStr = currentDate.toISOString().split('T')[0];
        const res = await fetch(`/api/walking?date=${dateStr}`);
        if (res.ok) {
          const record = await res.json();
          if (record) {
            setMinutes(record.duration / 60);
            setNotes(record.notes || '');
          } else {
            setMinutes(0);
            setNotes('');
          }
        }
      } catch (err) {
        console.error('Error fetching walking stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWalk();
  }, [currentDate]);

  const handleSave = async () => {
    setIsSaving(true);
    setJustSaved(false);
    try {
      const timestamp = new Date(currentDate);
      // Default walking log to 6:00 PM on that day
      timestamp.setHours(18, 0, 0, 0);

      const res = await fetch('/api/walking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          minutes,
          notes,
          timestamp: timestamp.toISOString()
        })
      });

      if (!res.ok) throw new Error('Failed to save');
      
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 3000);

      if (refreshStats) refreshStats();
    } catch (err) {
      console.error('Error saving walking session:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const adjustMinutes = (amount) => {
    setMinutes((prev) => Math.max(0, prev + amount));
  };

  const changeDate = (offset) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + offset);
    setCurrentDate(newDate);
  };

  const formatDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    
    if (d.getTime() === today.getTime()) return 'Today';
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.getTime() === yesterday.getTime()) return 'Yesterday';
    
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <Card as="section" variant="hoverable" padding="lg" className="flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Footprints size={16} className="text-dim animate-pulse" />
            <h3 className="text-xs uppercase tracking-[0.2rem] text-dim font-medium">Conscious Walking</h3>
          </div>
          
          <div className="flex items-center gap-4 bg-white/5 rounded-full px-3 py-1 border border-white/5">
            <button onClick={() => changeDate(-1)} className="text-dim hover:text-text transition-colors">
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-medium tracking-widest uppercase min-w-[80px] text-center">
              {formatDate(currentDate)}
            </span>
            <button onClick={() => changeDate(1)} className="text-dim hover:text-text transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6">
            {/* Interactive Minutes Adjuster */}
            <div className="flex items-center justify-center gap-6 w-full py-2">
              <button
                onClick={() => adjustMinutes(-5)}
                disabled={minutes <= 0}
                className="w-12 h-12 rounded-full flex items-center justify-center bg-white/5 border border-white/10 hover:bg-white/10 text-text/80 hover:text-text disabled:opacity-20 disabled:cursor-not-allowed active:scale-95 transition-all duration-300 shadow-md"
              >
                <Minus size={18} />
              </button>

              <div className="flex flex-col items-center min-w-[120px] relative">
                <span className="text-6xl font-thin text-accent tracking-tighter select-none">
                  {minutes}
                </span>
                <span className="text-[0.65rem] uppercase tracking-widest text-dim mt-1 font-light">
                  Minutes
                </span>
                {minutes > 0 && (
                  <div className="absolute inset-x-0 bottom-6 h-8 bg-accent/10 blur-xl rounded-full animate-pulse -z-10" />
                )}
              </div>

              <button
                onClick={() => adjustMinutes(5)}
                className="w-12 h-12 rounded-full flex items-center justify-center bg-white/5 border border-white/10 hover:bg-white/10 text-text/80 hover:text-text active:scale-95 transition-all duration-300 shadow-md"
              >
                <Plus size={18} />
              </button>
            </div>

            {/* Custom Range Slider */}
            <div className="w-full px-6 py-2">
              <input
                type="range"
                min="0"
                max="60"
                step="5"
                value={minutes}
                onChange={(e) => setMinutes(parseInt(e.target.value))}
                className="custom-range-slider"
              />
              <div className="flex justify-between text-[0.65rem] text-dim/30 mt-2 font-mono tracking-widest">
                <span>0m</span>
                <span>15m</span>
                <span>30m</span>
                <span>45m</span>
                <span>60m</span>
              </div>
            </div>

            {/* Quick Logging Presets */}
            <div className="flex gap-2.5">
              {[10, 20, 30, 45].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setMinutes(preset)}
                  className={`px-4 py-1.5 rounded-full text-xs font-light tracking-wider border transition-all duration-300 cursor-pointer ${
                    minutes === preset
                      ? 'border-accent bg-accent/15 text-accent font-medium shadow-[0_0_12px_var(--color-accent)]'
                      : 'bg-white/5 border-white/5 hover:border-accent/30 hover:bg-accent/5 hover:text-accent'
                  }`}
                >
                  +{preset}m
                </button>
              ))}
            </div>

            {/* Notes & Save Button */}
            {minutes > 0 && (
              <div className="w-full space-y-4 animate-in fade-in slide-in-from-top-3 duration-300">
                <div className="flex items-start gap-3 bg-white/5 rounded-xl p-3 focus-within:bg-white/10 transition-colors">
                  <MessageSquare size={14} className="text-dim mt-1" />
                  <textarea
                    placeholder="Where did you walk? What did you notice in your pace or surroundings?"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm text-text/80 placeholder:text-dim/40 resize-none h-16 font-light"
                  />
                </div>

                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  variant={justSaved ? 'ghost' : 'primary'}
                  size="none"
                  rounded="none"
                  className={`w-full py-3 rounded-xl shadow-[0_0_20px_rgba(var(--color-accent-rgb),0.2)] transition-all duration-500 ${
                    justSaved ? 'border border-green-500/30 text-green-400 bg-green-500/10' : ''
                  }`}
                >
                  {isSaving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : justSaved ? (
                    <Check size={16} />
                  ) : (
                    <Save size={16} />
                  )}
                  {justSaved ? 'Saved successfully!' : 'Save Conscious Walk'}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <p className="mt-8 text-xs text-dim italic font-light text-center">
        "An early-morning walk is a blessing for the whole day."
      </p>
    </Card>
  );
};

export default ConsciousWalking;
