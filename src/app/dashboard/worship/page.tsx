'use client';

import { useState, useEffect } from 'react';
import { Heart, CheckCircle2, Circle } from 'lucide-react';
import { getTodayWorship, updateTodayWorship, getWorshipStreak, type Worship } from '@/lib/storage/local';
import { cn } from '@/lib/utils';

export default function WorshipTrackerPage() {
  const [worship, setWorship] = useState<Worship | null>(null);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    setWorship(getTodayWorship());
    setStreak(getWorshipStreak());
  }, []);

  if (!worship) return null;

  const toggleWorship = (key: keyof Worship) => {
    if (key === 'date' || key === 'quranMinutes' || key === 'tasbihCount') return;
    const current = worship[key] as boolean;
    const next = !current;
    
    const update = { [key]: next };
    updateTodayWorship(update);
    setWorship({ ...worship, ...update });
  };

  const TrackerItem = ({ label, itemKey }: { label: string, itemKey: keyof Worship }) => {
    const isDone = worship[itemKey] as boolean;
    return (
      <button 
        onClick={() => toggleWorship(itemKey)}
        className={cn(
          "flex items-center justify-between w-full p-4 rounded-xl border transition-all",
          isDone 
            ? "bg-primary/5 border-primary/30" 
            : "bg-card border-border hover:border-primary/20"
        )}
      >
        <span className={cn("font-medium", isDone ? "text-primary" : "text-foreground")}>
          {label}
        </span>
        {isDone ? (
          <CheckCircle2 className="text-primary w-6 h-6" />
        ) : (
          <Circle className="text-muted-foreground w-6 h-6" />
        )}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20">
      <div className="pt-8 pb-4 px-6 border-b border-border">
        <h1 className="text-2xl font-semibold">Worship Tracker</h1>
      </div>

      <div className="p-6 space-y-8">
        {/* Streak Card */}
        <div className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 rounded-2xl p-6 text-center shadow-sm">
          <Heart className="w-8 h-8 text-primary mx-auto mb-3" />
          <p className="text-sm font-medium text-primary mb-1 uppercase tracking-wider">Current Streak</p>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-bold text-foreground">{streak}</span>
            <span className="text-muted-foreground font-medium">days</span>
          </div>
        </div>

        {/* Prayers */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Obligatory Prayers
          </h2>
          <div className="space-y-2">
            <TrackerItem label="Fajr" itemKey="Fajr" />
            <TrackerItem label="Dhuhr" itemKey="Dhuhr" />
            <TrackerItem label="Asr" itemKey="Asr" />
            <TrackerItem label="Maghrib" itemKey="Maghrib" />
            <TrackerItem label="Isha" itemKey="Isha" />
          </div>
        </section>

        {/* Other worship */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Daily Sunnah
          </h2>
          <div className="space-y-2">
            <TrackerItem label="Morning Adhkar" itemKey="morningAdhkar" />
            <TrackerItem label="Evening Adhkar" itemKey="eveningAdhkar" />
          </div>
        </section>

      </div>
    </div>
  );
}
