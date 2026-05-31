import { useState } from 'react';
import { ChevronRight, Calendar, Clock } from 'lucide-react';

function History({ history }) {
  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    let parts = [];
    if (hrs > 0) parts.push(`${hrs}h`);
    if (mins > 0 || hrs > 0) parts.push(`${mins}m`);
    parts.push(`${secs}s`);
    
    return parts.join(' ');
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8">
      <h1 className="text-4xl font-extralight mb-12 tracking-tight">Past Journeys</h1>
      
      <div className="flex flex-col gap-6">
        {history.length === 0 && (
          <div className="p-12 text-center bg-white/5 border border-white/10 rounded-squircle-lg opacity-50">
            <p className="text-lg font-light">Your history will appear here after your first session.</p>
          </div>
        )}
        
        {history.map((item) => (
          <div 
            key={item._id} 
            className="group relative bg-white/5 backdrop-blur-3xl border border-white/10 rounded-squircle-lg p-6 md:p-8 transition-all duration-300 hover:bg-white/10 hover:border-white/20 shadow-xl"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-4 md:mb-2">
                  <div className="flex gap-2">
                    <span className="px-3 py-1 rounded-full bg-accent/20 text-accent text-[0.7rem] uppercase tracking-widest font-medium">
                      {item.pattern}
                    </span>
                    {item.phaseDuration && (
                      <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-dim text-[0.7rem] uppercase tracking-widest font-medium">
                        {item.phaseDuration}s Phase
                      </span>
                    )}
                  </div>
                  <span className="text-dim text-sm font-light">
                    {formatDate(item.timestamp)} • {formatTime(item.timestamp)}
                  </span>
                </div>
                <h3 className="text-2xl font-light mb-4">
                  {item.duration >= 60 ? formatDuration(item.duration) : `${item.duration} second session`}
                </h3>
                
                {item.notes && (
                  <div className="relative pl-6 border-l-2 border-indicator/30">
                    <p className="text-text/80 font-light italic leading-relaxed">
                      "{item.notes}"
                    </p>
                  </div>
                )}
                {!item.notes && (
                  <p className="text-dim/40 text-sm font-light italic">No notes for this session.</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default History;
