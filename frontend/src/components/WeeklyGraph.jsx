import { useMemo, memo } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { Activity } from 'lucide-react';
import { Card } from './common';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-3 rounded-xl shadow-2xl">
        <p className="text-[0.65rem] uppercase tracking-widest text-dim mb-1">{payload[0].payload.fullDate}</p>
        <p className="text-lg font-light text-accent">
          {payload[0].value} <span className="text-xs uppercase tracking-tighter text-dim">mins</span>
        </p>
      </div>
    );
  }
  return null;
};

const WeeklyGraph = ({ practicedDates }) => {
  const data = useMemo(() => {
    const last7Days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      const dayName = date.toLocaleDateString(undefined, { weekday: 'short' });
      const durationSeconds = practicedDates[dateStr] || 0;
      const durationMinutes = Math.round(durationSeconds / 60 * 10) / 10; // 1 decimal place

      last7Days.push({
        name: dayName,
        minutes: durationMinutes,
        fullDate: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      });
    }
    return last7Days;
  }, [practicedDates]);

  return (
    <Card 
      as="section" 
      variant="hoverable" 
      padding="md" 
      className="mb-8 overflow-hidden group"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-accent" />
          <h3 className="text-xs uppercase tracking-[0.2rem] text-dim font-medium">Weekly Flow</h3>
        </div>
        <div className="text-[0.65rem] uppercase tracking-widest text-dim/60 font-light">
          Last 7 Days
        </div>
      </div>

      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 15, left: 15, bottom: 0 }}>
            <defs>
              <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 300 }}
              dy={10}
            />
            <YAxis 
              hide 
              domain={[0, 'auto']}
            />
            <Tooltip 
              content={<CustomTooltip />} 
              cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
            />
            <Area 
              type="monotone" 
              dataKey="minutes" 
              stroke="var(--color-accent)" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorMinutes)" 
              animationDuration={2000}
              animationEasing="ease-in-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default memo(WeeklyGraph);
