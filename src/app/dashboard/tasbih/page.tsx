'use client';

import { useState, useEffect } from 'react';
import { RotateCcw, Settings2, Plus, Minus, History } from 'lucide-react';
import { saveTasbihSession, getTasbihSessions, type TasbihSession } from '@/lib/storage/local';

const PRESETS = [
  { label: 'SubhanAllah', target: 33 },
  { label: 'Alhamdulillah', target: 33 },
  { label: 'Allahu Akbar', target: 34 },
  { label: 'Astaghfirullah', target: 100 },
  { label: 'Custom', target: 0 },
];

export default function TasbihPage() {
  const [count, setCount] = useState(0);
  const [presetIndex, setPresetIndex] = useState(0);
  const [customTarget, setCustomTarget] = useState(100);
  const [isVibrationEnabled, setIsVibrationEnabled] = useState(true);
  const [sessions, setSessions] = useState<TasbihSession[]>([]);

  const activePreset = PRESETS[presetIndex];
  const target = activePreset.target === 0 ? customTarget : activePreset.target;
  const progress = target > 0 ? Math.min((count / target) * 100, 100) : 100;

  useEffect(() => {
    setSessions(getTasbihSessions());
  }, []);

  useEffect(() => {
    // If target reached and vibration supported
    if (count > 0 && count % target === 0 && isVibrationEnabled && 'vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]); // double buzz on completion
    } else if (count > 0 && isVibrationEnabled && 'vibrate' in navigator) {
      navigator.vibrate(20); // short tap
    }
  }, [count, target, isVibrationEnabled]);

  const handleTap = () => {
    setCount(c => c + 1);
  };

  const handleReset = () => {
    if (count > 0) {
      saveTasbihSession({
        dhikr: activePreset.label,
        count,
        target,
        createdAt: Date.now()
      });
      setSessions(getTasbihSessions());
    }
    setCount(0);
  };

  const handleUndo = () => {
    setCount(c => Math.max(0, c - 1));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="pt-8 pb-4 px-6 border-b border-border">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Tasbih</h1>
          <button 
            onClick={() => setIsVibrationEnabled(!isVibrationEnabled)}
            className={`p-2 rounded-full transition-colors ${isVibrationEnabled ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}
          >
            <Settings2 size={18} />
          </button>
        </div>
      </div>

      {/* Presets */}
      <div className="py-6 px-4">
        <div className="flex overflow-x-auto hide-scrollbar gap-2 px-2">
          {PRESETS.map((p, i) => (
            <button
              key={p.label}
              onClick={() => {
                if (count > 0 && presetIndex !== i) handleReset();
                setPresetIndex(i);
              }}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${
                presetIndex === i 
                  ? 'bg-primary text-primary-foreground border-primary' 
                  : 'bg-card text-muted-foreground border-border'
              }`}
            >
              {p.label} {p.target > 0 && `(${p.target})`}
            </button>
          ))}
        </div>
      </div>

      {/* Main Counter Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 pb-24">
        
        {/* Progress Ring & Counter */}
        <div className="relative mb-12">
          {/* SVG Ring */}
          <svg width="280" height="280" className="rotate-[-90deg]">
            <circle
              cx="140" cy="140" r="130"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="8"
            />
            {target > 0 && (
              <circle
                cx="140" cy="140" r="130"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="8"
                strokeDasharray={2 * Math.PI * 130}
                strokeDashoffset={2 * Math.PI * 130 * (1 - progress / 100)}
                className="transition-all duration-300 ease-out"
                strokeLinecap="round"
              />
            )}
          </svg>
          
          {/* Numbers */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-7xl font-bold text-foreground tabular-nums tracking-tighter">
              {count}
            </span>
            {target > 0 && (
              <span className="text-sm font-medium text-muted-foreground mt-2">
                / {target}
              </span>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="w-full max-w-sm flex items-center justify-center gap-6 mb-12">
          <button
            onClick={handleReset}
            className="w-14 h-14 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors shadow-sm"
          >
            <RotateCcw size={20} />
          </button>
          
          <button
            onClick={handleTap}
            className="w-24 h-24 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus size={32} />
          </button>
          
          <button
            onClick={handleUndo}
            disabled={count === 0}
            className="w-14 h-14 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors shadow-sm disabled:opacity-50"
          >
            <Minus size={20} />
          </button>
        </div>

        {/* History */}
        {sessions.length > 0 && (
          <div className="w-full max-w-sm mt-8 border-t border-border pt-8">
            <div className="flex items-center gap-2 text-muted-foreground mb-4">
              <History size={16} />
              <h2 className="text-sm font-medium">Recent Sessions</h2>
            </div>
            <div className="space-y-3">
              {sessions.slice(0, 5).map(s => (
                <div key={s.id} className="flex items-center justify-between p-3 bg-card rounded-xl border border-border">
                  <div>
                    <p className="text-sm font-medium text-foreground">{s.dhikr}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary">{s.count}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Target: {s.target > 0 ? s.target : '∞'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
