'use client';

import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, Settings2, Plus, Minus, History, Volume2, VolumeX, Smartphone } from 'lucide-react';
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
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isTapped, setIsTapped] = useState(false);
  const [sessions, setSessions] = useState<TasbihSession[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const activePreset = PRESETS[presetIndex];
  const target = activePreset.target === 0 ? customTarget : activePreset.target;
  const progress = target > 0 ? Math.min((count / target) * 100, 100) : 100;

  useEffect(() => {
    setSessions(getTasbihSessions());
  }, []);

  // Play authentic acoustic wooden tasbih bead click sound ("kong kong kong")
  const playBeadClick = () => {
    if (!isSoundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      // Organic pitch variation between clicks (simulating natural hand movement along the beads)
      const variation = 0.94 + Math.random() * 0.12;
      const baseFreq = 360 * variation;

      // 1. Resonant hollow wooden bead body ("kong" pitch-drop impulse)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(150 * variation, now + 0.08);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(520 * variation, now);
      filter.Q.setValueAtTime(4.2, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.55, now + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.13);

      // 2. High-frequency acoustic contact transient (wood-on-wood snap)
      const snapOsc = ctx.createOscillator();
      const snapGain = ctx.createGain();
      const snapFilter = ctx.createBiquadFilter();

      snapOsc.type = 'sine';
      snapOsc.frequency.setValueAtTime(1400 * variation, now);
      snapOsc.frequency.exponentialRampToValueAtTime(280, now + 0.02);

      snapFilter.type = 'highpass';
      snapFilter.frequency.setValueAtTime(950, now);

      snapGain.gain.setValueAtTime(0.35, now);
      snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

      snapOsc.connect(snapFilter);
      snapFilter.connect(snapGain);
      snapGain.connect(ctx.destination);

      snapOsc.start(now);
      snapOsc.stop(now + 0.03);
    } catch {
      // AudioContext unavailable
    }
  };

  // Play peaceful completion chime when target is reached
  const playCompletionChime = () => {
    if (!isSoundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = audioCtxRef.current || new AudioCtx();
      const now = ctx.currentTime;

      [523.25, 659.25, 783.99].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.001, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.25, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.65);
      });
    } catch {}
  };

  const handleTap = () => {
    const nextCount = count + 1;
    setCount(nextCount);
    setIsTapped(true);
    setTimeout(() => setIsTapped(false), 120);

    // Audio sound ("kong")
    playBeadClick();

    // Target reached celebration
    if (target > 0 && nextCount % target === 0) {
      setTimeout(() => playCompletionChime(), 120);
      if (isVibrationEnabled && 'vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
      }
    } else if (isVibrationEnabled && 'vibrate' in navigator) {
      navigator.vibrate(20);
    }
  };

  // Spacebar hotkey to count
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        handleTap();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

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
    <div className="min-h-full bg-transparent flex flex-col font-body selection:bg-primary/20">
      {/* Header */}
      <div className="pt-8 pb-4 px-6 border-b border-border/80">
        <div className="flex items-center justify-between max-w-4xl mx-auto w-full">
          <div>
            <h1 className="text-2xl font-bold font-headline tracking-tight text-foreground">Digital Tasbih</h1>
            <p className="text-xs text-muted-foreground font-medium">Tactile bead feedback with authentic audio</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Click Sound Toggle */}
            <button 
              onClick={() => setIsSoundEnabled(!isSoundEnabled)}
              title={isSoundEnabled ? "Mute Bead Click Sound" : "Enable Bead Click Sound"}
              className={`p-2.5 rounded-full transition-all cursor-pointer ${
                isSoundEnabled 
                  ? 'bg-primary/15 text-primary border border-primary/30 shadow-sm' 
                  : 'bg-muted text-muted-foreground border border-border'
              }`}
            >
              {isSoundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>

            {/* Haptic Vibration Toggle */}
            <button 
              onClick={() => setIsVibrationEnabled(!isVibrationEnabled)}
              title={isVibrationEnabled ? "Disable Haptics" : "Enable Haptics"}
              className={`p-2.5 rounded-full transition-all cursor-pointer ${
                isVibrationEnabled 
                  ? 'bg-primary/15 text-primary border border-primary/30 shadow-sm' 
                  : 'bg-muted text-muted-foreground border border-border'
              }`}
            >
              <Smartphone size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Presets */}
      <div className="py-6 px-4">
        <div className="flex overflow-x-auto hide-scrollbar gap-2 px-2 max-w-4xl mx-auto justify-center">
          {PRESETS.map((p, i) => (
            <button
              key={p.label}
              onClick={() => {
                if (count > 0 && presetIndex !== i) handleReset();
                setPresetIndex(i);
              }}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all border cursor-pointer ${
                presetIndex === i 
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm scale-105' 
                  : 'bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
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
        <div className="relative mb-12 select-none">
          {/* SVG Ring with glow */}
          <div className="relative">
            <svg width="290" height="290" className="rotate-[-90deg] drop-shadow-sm">
              <circle
                cx="145" cy="145" r="132"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="10"
              />
              {target > 0 && (
                <circle
                  cx="145" cy="145" r="132"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="10"
                  strokeDasharray={2 * Math.PI * 132}
                  strokeDashoffset={2 * Math.PI * 132 * (1 - progress / 100)}
                  className="transition-all duration-300 ease-out"
                  strokeLinecap="round"
                />
              )}
            </svg>
            
            {/* Numbers */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className={`text-7xl font-bold font-headline text-foreground tabular-nums tracking-tighter transition-transform duration-100 ${isTapped ? 'scale-110 text-primary' : 'scale-100'}`}>
                {count}
              </span>
              {target > 0 && (
                <span className="text-xs font-semibold text-muted-foreground mt-2 tracking-wider">
                  / {target} completed
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="w-full max-w-sm flex items-center justify-center gap-6 mb-8 select-none">
          <button
            onClick={handleReset}
            title="Reset Counter"
            className="w-14 h-14 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-all shadow-sm active:scale-90 cursor-pointer"
          >
            <RotateCcw size={20} />
          </button>
          
          {/* Big Tactile Bead Counter Button */}
          <button
            onClick={handleTap}
            title="Count Bead (Kong!)"
            className={`w-28 h-28 rounded-full bg-gradient-to-tr from-primary to-amber-500 text-primary-foreground flex items-center justify-center shadow-xl shadow-primary/35 hover:scale-105 active:scale-90 transition-all cursor-pointer border-4 border-background ${
              isTapped ? 'ring-8 ring-primary/30' : ''
            }`}
          >
            <Plus size={38} className="stroke-[2.8]" />
          </button>
          
          <button
            onClick={handleUndo}
            disabled={count === 0}
            title="Undo"
            className="w-14 h-14 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed active:scale-90 cursor-pointer"
          >
            <Minus size={20} />
          </button>
        </div>

        <p className="text-[11px] text-muted-foreground font-medium mb-6">
          Tip: You can also tap the Spacebar key to count
        </p>

        {/* History */}
        {sessions.length > 0 && (
          <div className="w-full max-w-md mt-6 border-t border-border/80 pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-4">
              <History size={16} />
              <h2 className="text-xs font-bold uppercase tracking-wider">Recent Sessions</h2>
            </div>
            <div className="space-y-2.5">
              {sessions.slice(0, 5).map(s => (
                <div key={s.id} className="flex items-center justify-between p-3.5 bg-card rounded-2xl border border-border shadow-sm">
                  <div>
                    <p className="text-sm font-semibold text-foreground font-headline">{s.dhikr}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {new Date(s.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-bold text-primary font-headline">{s.count}</p>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
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
