'use client';

import { useState, useEffect, useRef } from 'react';
import { getTimings, type PrayerTimes } from '@/lib/api/aladhan';
import { useLocation } from '@/hooks/useLocation';
import { useNextPrayer, formatPrayerTime, isPrayerPassed } from '@/hooks/usePrayer';
import { getSettings } from '@/lib/storage/local';
import { cn } from '@/lib/utils';
import { Settings2, Clock, Volume2, VolumeX, Music, AlarmClock } from 'lucide-react';
import Link from 'next/link';
import { AudioAlarmManager } from '@/components/audio-alarm-manager';

const PRAYERS = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

const ADHANS = [
  { id: 'abdullah', name: 'Adhan (Abdullah)', url: '/azan-abdullah.m4a' },
  { id: 'custom2', name: 'Special Adhan Recitation', url: '/azan-custom2.m4a' },
];

export default function PrayerPage() {
  const location = useLocation();
  const [timings, setTimings] = useState<PrayerTimes | null>(null);
  const { nextPrayer } = useNextPrayer(timings);
  const [activeTab, setActiveTab] = useState<'schedule' | 'alarms'>('schedule');
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedAdhan, setSelectedAdhan] = useState(ADHANS[0].url);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [selectedAdhan]);

  const toggleAdhan = () => {
    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlaying(false);
    } else {
      if (!audioRef.current) {
        const audio = new Audio(selectedAdhan);
        audio.onended = () => setIsPlaying(false);
        audio.onerror = () => {
          setIsPlaying(false);
        };
        audioRef.current = audio;
      }
      setIsPlaying(true);
      audioRef.current.play().catch(e => {
        console.warn("Audio playback interrupted:", e);
        setIsPlaying(false);
      });
    }
  };

  const [customVersion, setCustomVersion] = useState(0);

  useEffect(() => {
    const handleCustomChange = () => setCustomVersion(v => v + 1);
    window.addEventListener('custom-prayer-times-changed', handleCustomChange);
    return () => window.removeEventListener('custom-prayer-times-changed', handleCustomChange);
  }, []);

  useEffect(() => {
    if (!location.latitude || !location.longitude) return;
    const s = getSettings();
    getTimings(
      new Date(),
      { latitude: location.latitude, longitude: location.longitude },
      s.calculationMethod,
      s.school
    )
      .then(res => {
        if (res) {
          setTimings(res.timings);
          try {
            localStorage.setItem('md_cached_prayer_timings', JSON.stringify(res.timings));
            window.dispatchEvent(new Event('custom-prayer-times-changed'));
          } catch {}
        }
      });
  }, [location.latitude, location.longitude]);

  return (
    <div className="min-h-full bg-transparent pb-20">
      <div className="pt-8 pb-4 px-6 border-b border-border flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold">Prayer & Alarms</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Automated prayer schedules, Adhan, and custom scheduled audio alarms</p>
          </div>
          <Link href="/dashboard/settings" className="p-2 bg-muted rounded-full text-muted-foreground hover:text-foreground">
            <Settings2 size={16} />
          </Link>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-border/40 pb-1">
          <button
            onClick={() => setActiveTab('schedule')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all",
              activeTab === 'schedule'
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            )}
          >
            <Clock className="w-4 h-4" />
            <span>Prayer Schedule</span>
          </button>

          <button
            onClick={() => setActiveTab('alarms')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all",
              activeTab === 'alarms'
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            )}
          >
            <AlarmClock className="w-4 h-4" />
            <span>Audio Alarms & Automations</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary/20 text-primary-foreground">
              New
            </span>
          </button>
        </div>

        {activeTab === 'schedule' && (
          <div className="flex items-center gap-3 bg-card p-3 rounded-xl border border-border">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground font-medium mb-1 block">Preview Adhan Voice</label>
              <select 
                value={selectedAdhan}
                onChange={(e) => setSelectedAdhan(e.target.value)}
                className="w-full bg-transparent text-sm font-medium focus:outline-none cursor-pointer"
              >
                {ADHANS.map(adhan => (
                  <option key={adhan.id} value={adhan.url}>{adhan.name}</option>
                ))}
              </select>
            </div>
            <button 
              onClick={toggleAdhan}
              className={cn(
                "p-3 rounded-full transition-all flex items-center justify-center shrink-0", 
                isPlaying ? "bg-primary text-primary-foreground animate-pulse" : "bg-primary/10 text-primary hover:bg-primary/20"
              )}
            >
              {isPlaying ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          </div>
        )}
      </div>

      <div className="p-6">
        {activeTab === 'alarms' ? (
          <AudioAlarmManager />
        ) : (
          <>
            {timings ? (
              <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
            {PRAYERS.map((name) => {
              const timeStr = timings[name as keyof PrayerTimes];
              const isNext = name === nextPrayer;
              const passed = !isNext && isPrayerPassed(timeStr, name);
              const isNotifiable = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].includes(name);
              
              return (
                <div 
                  key={name}
                  onClick={() => {
                    if (isNotifiable) {
                      window.dispatchEvent(new CustomEvent('open-adhan-overlay', { detail: { prayer: name } }));
                    }
                  }}
                  className={cn(
                    "flex items-center justify-between p-5 border-b border-border/50 transition-colors last:border-0",
                    isNotifiable && "cursor-pointer hover:bg-muted/40",
                    isNext ? "bg-primary text-primary-foreground hover:bg-primary/95" : "bg-card text-foreground"
                  )}
                  title={isNotifiable ? `Click to record or adjust ${name} time` : undefined}
                >
                  <div className="flex items-center gap-3">
                    {isNext ? (
                      <Clock size={20} className="text-primary-foreground/80 animate-pulse" />
                    ) : passed ? (
                      <span className="w-5 h-5 flex items-center justify-center rounded-full bg-muted text-[10px] text-muted-foreground">✓</span>
                    ) : (
                      <span className="w-5 h-5 flex items-center justify-center rounded-full border border-border" />
                    )}
                    <span className={cn("font-medium", passed && !isNext && "text-muted-foreground")}>{name}</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "font-mono font-semibold tracking-wider",
                      passed && !isNext && "text-muted-foreground"
                    )}>
                      {formatPrayerTime(timeStr, name)}
                    </span>
                    {isNotifiable && (
                      <span className={cn(
                        "text-xs px-2.5 py-0.5 rounded-full font-medium transition-opacity",
                        isNext ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
                      )}>
                        Record / Edit ↗
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        )}
        
        <div className="mt-6 p-4 bg-primary/10 text-primary rounded-xl text-sm text-center">
          Tap the settings icon above to change your calculation method or madhab.
        </div>
          </>
        )}
      </div>
    </div>
  );
}
