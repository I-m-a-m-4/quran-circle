'use client';

import { useState, useEffect, useRef } from 'react';
import { getTimings, type PrayerTimes } from '@/lib/api/aladhan';
import { useLocation } from '@/hooks/useLocation';
import { useNextPrayer, formatPrayerTime, isPrayerPassed } from '@/hooks/usePrayer';
import { getSettings } from '@/lib/storage/local';
import { cn } from '@/lib/utils';
import { Settings2, Clock, Volume2, VolumeX, Music } from 'lucide-react';
import Link from 'next/link';

const PRAYERS = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

const ADHANS = [
  { id: 'mishary', name: 'Mishary Al-Afasy', url: 'https://download.quranicaudio.com/quran/mishaari_raashid_al_3afaasee/001.mp3' },
  { id: 'abdullah', name: 'Abdullah (Sham netzwerk)', url: '/azan-abdullah.m4a' },
  { id: 'custom2', name: 'Special Adhan (YouTube)', url: '/azan-custom2.m4a' },
  { id: 'makkah', name: 'Makkah (Ali Mulla)', url: 'https://www.soundjay.com/misc/sounds/azan-01.mp3' },
  { id: 'abdulbasit', name: 'Abdul Basit', url: 'https://download.quranicaudio.com/quran/abu_bakr_al_shatri/001.mp3' },
  { id: 'madinah', name: 'Madinah Adhan', url: 'https://ia800209.us.archive.org/19/items/AzaanMadinahSharif/adhan_madinah.mp3' },
];

export default function PrayerPage() {
  const location = useLocation();
  const [timings, setTimings] = useState<PrayerTimes | null>(null);
  const { nextPrayer } = useNextPrayer(timings);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedAdhan, setSelectedAdhan] = useState(ADHANS[0].url);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Stop old audio if playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    // Create new audio instance
    const audio = new Audio(selectedAdhan);
    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => {
      console.error("Audio failed to load");
      setIsPlaying(false);
    };
    audioRef.current = audio;
    setIsPlaying(false); // Reset state when changing audio
    
    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [selectedAdhan]);

  const toggleAdhan = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      audioRef.current.play().catch(e => {
        console.error("Audio playback error:", e);
        setIsPlaying(false);
      });
    }
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
      <div className="pt-8 pb-4 px-6 border-b border-border flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Prayer Times</h1>
          <Link href="/dashboard/settings" className="p-2 bg-muted rounded-full text-muted-foreground hover:text-foreground">
            <Settings2 size={16} />
          </Link>
        </div>

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
