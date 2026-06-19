import { Trash2, Download } from 'lucide-react';
import { Card, Button } from './common';

function History({ history, hasMore, loadMore, onDelete }) {
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
        <h1 className="text-4xl font-extralight tracking-tight">Past Journeys</h1>
        <Button 
          as="a"
          href="/api/history/export" 
          download 
          variant="secondary"
          size="none"
          className="px-6 py-3 text-xs font-light tracking-widest"
        >
          <Download size={16} />
          <span>Export CSV</span>
        </Button>
      </div>
      
      <div className="flex flex-col gap-6">
        {history.length === 0 && (
          <Card variant="flat" padding="none" className="p-12 text-center opacity-50">
            <p className="text-lg font-light">Your history will appear here after your first session.</p>
          </Card>
        )}
        
        {history.map((item) => (
          <Card 
            key={item._id} 
            variant="hoverable"
            padding="md"
            className="group relative"
          >
            <button 
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this session?')) {
                  onDelete(item._id);
                }
              }}
              className="absolute top-4 right-4 p-2 text-dim/20 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-all md:opacity-0 md:group-hover:opacity-100"
              title="Delete Session"
            >
              <Trash2 size={18} />
            </button>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-4 md:mb-2 pr-12 md:pr-0">
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="px-3 py-1 rounded-full bg-accent/20 text-accent text-[0.7rem] uppercase tracking-widest font-medium">
                      {item.pattern}
                    </span>
                    {item.inhale !== undefined && (
                      <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-dim text-[0.7rem] uppercase tracking-widest font-medium">
                        {item.inhale}-{item.inhaleHold}-{item.exhale}-{item.exhaleHold}s
                      </span>
                    )}
                    {item.rating && (
                      <div className="flex gap-1 ml-2">
                        {[1, 2, 3, 4, 5].map((num) => (
                          <svg key={num} width="12" height="12" viewBox="0 0 24 24" fill={item.rating >= num ? "var(--color-accent)" : "none"} stroke="var(--color-accent)" strokeWidth="1.5">
                            <circle cx="12" cy="12" r="10"></circle>
                          </svg>
                        ))}
                      </div>
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
          </Card>
        ))}

        {hasMore && (
          <Button 
            onClick={loadMore}
            variant="secondary"
            size="none"
            rounded="lg"
            className="mt-4 w-full py-6 font-light text-sm tracking-widest"
          >
            Load More Sessions
          </Button>
        )}
      </div>
    </div>
  );
}

export default History;
