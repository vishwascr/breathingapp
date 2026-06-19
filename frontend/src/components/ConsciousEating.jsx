import { useState, useEffect } from 'react';
import { Utensils, CheckCircle2, Circle, MessageSquare, ChevronLeft, ChevronRight, Save, Loader2 } from 'lucide-react';
import { Card, Button } from './common';

const ConsciousEating = ({ refreshStats }) => {
  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  
  const [meals, setMeals] = useState({
    breakfast: { value: false, notes: '', isSaving: false },
    lunch: { value: false, notes: '', isSaving: false },
    dinner: { value: false, notes: '', isSaving: false }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeals = async () => {
      setLoading(true);
      try {
        const dateStr = currentDate.toISOString().split('T')[0];
        const res = await fetch(`/api/eating?date=${dateStr}`);
        const data = await res.json();
        
        const newMeals = {
          breakfast: { value: false, notes: '', isSaving: false },
          lunch: { value: false, notes: '', isSaving: false },
          dinner: { value: false, notes: '', isSaving: false }
        };

        data.forEach(record => {
          if (record.pattern === 'Conscious Eating - breakfast') {
            newMeals.breakfast = { value: true, notes: record.notes, isSaving: false };
          } else if (record.pattern === 'Conscious Eating - lunch') {
            newMeals.lunch = { value: true, notes: record.notes, isSaving: false };
          } else if (record.pattern === 'Conscious Eating - dinner') {
            newMeals.dinner = { value: true, notes: record.notes, isSaving: false };
          }
        });

        setMeals(newMeals);
      } catch (err) {
        console.error('Error fetching eating stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMeals();
  }, [currentDate]);

  const handleSave = async (mealId) => {
    const meal = meals[mealId];
    setMeals(prev => ({ ...prev, [mealId]: { ...prev[mealId], isSaving: true } }));

    try {
      const timestamp = new Date(currentDate);
      if (mealId === 'breakfast') timestamp.setHours(8, 0, 0, 0);
      else if (mealId === 'lunch') timestamp.setHours(14, 0, 0, 0);
      else if (mealId === 'dinner') timestamp.setHours(20, 0, 0, 0);

      const res = await fetch('/api/eating', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meal: mealId,
          value: meal.value,
          notes: meal.notes,
          timestamp: timestamp.toISOString()
        })
      });

      if (!res.ok) throw new Error('Failed to save');
      
      if (refreshStats) refreshStats();
    } catch (err) {
      console.error('Error saving meal:', err);
    } finally {
      setMeals(prev => ({ ...prev, [mealId]: { ...prev[mealId], isSaving: false } }));
    }
  };

  const toggleMeal = (mealId) => {
    setMeals(prev => ({
      ...prev,
      [mealId]: { ...prev[mealId], value: !prev[mealId].value }
    }));
  };

  const handleNoteChange = (mealId, notes) => {
    setMeals(prev => ({
      ...prev,
      [mealId]: { ...prev[mealId], notes }
    }));
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

  const mealItems = [
    { id: 'breakfast', label: 'Breakfast', time: '8:00 AM' },
    { id: 'lunch', label: 'Lunch', time: '2:00 PM' },
    { id: 'dinner', label: 'Dinner', time: '8:00 PM' }
  ];

  return (
    <Card as="section" variant="hoverable" padding="lg">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Utensils size={16} className="text-dim" />
          <h3 className="text-xs uppercase tracking-[0.2rem] text-dim font-medium">Conscious Eating</h3>
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
      
      <div className="grid gap-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          mealItems.map(({ id, label, time }) => {
            const meal = meals[id];
            const isChecked = meal.value;
            return (
              <div 
                key={id}
                className={`group relative overflow-hidden rounded-2xl border transition-all duration-500 ${
                  isChecked 
                    ? 'bg-accent/5 border-accent/20 shadow-lg shadow-accent/5 scale-[1.01]' 
                    : 'bg-white/5 border-white/5 hover:border-white/10'
                }`}
              >
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => toggleMeal(id)}
                      className="flex items-center gap-4 text-left"
                    >
                      <div className="relative">
                        {isChecked ? (
                          <CheckCircle2 size={28} className="text-accent fill-accent/10 transition-transform duration-300 scale-110" />
                        ) : (
                          <Circle size={28} className="text-dim group-hover:text-text/40 transition-colors" />
                        )}
                        {isChecked && (
                          <div className="absolute inset-0 bg-accent/20 blur-lg rounded-full animate-pulse" />
                        )}
                      </div>
                      <div>
                        <span className={`text-xl font-light tracking-wide block transition-colors duration-300 ${isChecked ? 'text-accent' : 'text-text/60'}`}>
                          {label}
                        </span>
                        <span className="text-[0.6rem] uppercase tracking-widest text-dim font-medium">
                          {time}
                        </span>
                      </div>
                    </button>
                  </div>

                  {isChecked && (
                    <div className="mt-4 pt-4 border-t border-white/5 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="flex items-start gap-3 bg-white/5 rounded-xl p-3 focus-within:bg-white/10 transition-colors mb-4">
                        <MessageSquare size={14} className="text-dim mt-1" />
                        <textarea
                          placeholder="What did you notice during this meal?"
                          value={meal.notes}
                          onChange={(e) => handleNoteChange(id, e.target.value)}
                          className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm text-text/80 placeholder:text-dim/40 resize-none h-16 font-light"
                        />
                      </div>
                      
                      <Button
                        onClick={() => handleSave(id)}
                        disabled={meal.isSaving}
                        variant="primary"
                        size="none"
                        rounded="none"
                        className="w-full py-3 rounded-xl shadow-[0_0_20px_rgba(var(--color-accent-rgb),0.2)]"
                      >
                        {meal.isSaving ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Save size={16} />
                        )}
                        Save Conscious Meal
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
      
      <p className="mt-8 text-xs text-dim italic font-light text-center">
        "Mindful eating is a way to rediscover one of life's most pleasurable activities."
      </p>
    </Card>
  );
};

export default ConsciousEating;
