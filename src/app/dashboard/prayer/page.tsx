'use client';

import { useState, useEffect, useRef } from 'react';
import { getTimings, type PrayerTimes } from '@/lib/api/aladhan';
import { useLocation } from '@/hooks/useLocation';
import { useNextPrayer, formatPrayerTime, isPrayerPassed } from '@/hooks/usePrayer';
import { getSettings } from '@/lib/storage/local';
import { cn } from '@/lib/utils';
import { Settings2, Clock, Volume2, VolumeX } from 'lucide-react';
import Link from 'next/link';

const PRAYERS = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

export default function PrayerPage() {
  const location = useLocation();
  const [timings, setTimings] = useState<PrayerTimes | null>(null);
  const { nextPrayer } = useNextPrayer(timings);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // A sweet, beautiful recitation of the Adhan by Mishary Al-Afasy
    audioRef.current = new Audio('https://www.islamcan.com/audio/adhan/azan1.mp3');
    audioRef.current.onended = () => setIsPlaying(false);
  }, []);

  const toggleAdhan = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

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
        if (res) setTimings(res.timings);
      });
  }, [location.latitude, location.longitude]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="pt-8 pb-4 px-6 border-b border-border flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Prayer Times</h1>
        <div className="flex gap-2">
          <button 
            onClick={toggleAdhan}
            className={cn(
              "p-2 rounded-full transition-colors flex items-center justify-center gap-2 px-4 text-sm font-medium", 
              isPlaying ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
            )}
          >
            {isPlaying ? (
              <>
                <VolumeX size={16} />
                Stop Adhan
              </>
            ) : (
              <>
                <Volume2 size={16} />
                Play Adhan
              </>
            )}
          </button>
          <Link href="/dashboard/settings" className="p-2 bg-muted rounded-full text-muted-foreground hover:text-foreground">
            <Settings2 size={16} />
          </Link>
        </div>
      </div>

      <div className="p-6">
        {timings ? (
          <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
            {PRAYERS.map((name, i) => {
              const timeStr = timings[name as keyof PrayerTimes];
              const isNext = name === nextPrayer;
              const passed = !isNext && isPrayerPassed(timeStr);
              
              return (
                <div 
                  key={name}
                  className={cn(
                    "flex items-center justify-between p-5 border-b border-border/50 transition-colors last:border-0",
                    isNext ? "bg-primary text-primary-foreground" : "bg-card text-foreground"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {isNext ? (
                      <Clock size={20} className="text-primary-foreground/80 animate-pulse" />
                    ) : passed ? (
                      <span className="w-5 h-5 flex items-center justify-center rounded-full bg-muted text-[10px] text-muted-foreground">✓</span>
                    ) : (
                      <span className="w-5 h-5 flex items-center justify-center rounded-full border border-border" />
                    )}
                    <span className={cn("font-medium", passed && "text-muted-foreground")}>{name}</span>
                  </div>
                  
                  <span className={cn(
                    "font-mono font-semibold tracking-wider",
                    passed && "text-muted-foreground"
                  )}>
                    {formatPrayerTime(timeStr)}
                  </span>
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
      </div>
    </div>
  );
}
