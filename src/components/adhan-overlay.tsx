'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from '@/hooks/useLocation';
import { getTimings, PrayerTimes } from '@/lib/api/aladhan';
import { Button } from '@/components/ui/button';
import { X, Volume2, VolumeX, CheckCircle } from 'lucide-react';

// Common prayers we want to notify for
const NOTIFIABLE_PRAYERS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

export function AdhanOverlay() {
  const { latitude, longitude } = useLocation();
  const [timings, setTimings] = useState<PrayerTimes | null>(null);
  const [activePrayer, setActivePrayer] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [recorded, setRecorded] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Ask for notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Fetch timings daily or on location change
  useEffect(() => {
    if (!latitude || !longitude) return;

    const fetchTodayTimings = async () => {
      const data = await getTimings(new Date(), { latitude, longitude });
      if (data) {
        setTimings(data.timings);
      }
    };
    fetchTodayTimings();
  }, [latitude, longitude]);

  // Check the clock every minute
  useEffect(() => {
    if (!timings) return;

    const checkTime = () => {
      const now = new Date();
      const currentHours = now.getHours().toString().padStart(2, '0');
      const currentMinutes = now.getMinutes().toString().padStart(2, '0');
      const currentTimeString = `${currentHours}:${currentMinutes}`;

      for (const prayer of NOTIFIABLE_PRAYERS) {
        // Aladhan timings are in HH:MM (24-hour)
        const prayerTime = timings[prayer as keyof PrayerTimes];
        
        // Remove timezone suffix if present (e.g. "18:42 (+01)")
        const cleanPrayerTime = prayerTime?.split(' ')[0];

        if (cleanPrayerTime === currentTimeString && activePrayer !== prayer) {
          triggerAdhan(prayer, cleanPrayerTime);
        }
      }
    };

    const interval = setInterval(checkTime, 30000); // check every 30s
    checkTime(); // check immediately

    return () => clearInterval(interval);
  }, [timings, activePrayer]);

  const triggerAdhan = (prayer: string, timeString: string) => {
    setActivePrayer(prayer);
    setRecorded(false);
    
    // Native Notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`Time for ${prayer}`, {
        body: `It is now ${timeString}. Tap to open Muslim Desk and record your prayer.`,
        icon: '/icon-192x192.png' // Assuming standard PWA icon exists
      });
    }

    // Play Audio (May be blocked by browser autoplay policy if user hasn't interacted)
    try {
      // In a full app, this would read from user settings (e.g. Abdullah, Mishary)
      const audio = new Audio('/azan-abdullah.m4a');
      audioRef.current = audio;
      audio.play().catch(e => console.warn("Autoplay blocked by browser:", e));
    } catch (e) {
      console.error("Audio error:", e);
    }
  };

  const closeOverlay = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setActivePrayer(null);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
      setIsMuted(audioRef.current.muted);
    }
  };

  if (!activePrayer) return null;

  // Format the time nicely for the UI (12-hour AM/PM)
  const format12Hour = (time24: string) => {
    const [h, m] = time24.split(':');
    let hours = parseInt(h, 10);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return { time: `${hours}:${m}`, ampm };
  };

  const timeData = timings ? format12Hour(timings[activePrayer as keyof PrayerTimes].split(' ')[0]) : { time: '', ampm: '' };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/60 backdrop-blur-xl fade-in">
      
      {/* Top Controls */}
      <div className="absolute top-6 left-6 right-6 flex justify-between">
        <Button variant="ghost" size="icon" onClick={closeOverlay} className="rounded-full bg-white/10 hover:bg-white/20 text-white">
          <X className="w-6 h-6" />
        </Button>
        <Button variant="ghost" size="icon" onClick={toggleMute} className="rounded-full bg-white/10 hover:bg-white/20 text-white">
          {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
        </Button>
      </div>

      {/* Main Content (Mimicking the beautiful uploaded screenshot) */}
      <div className="relative w-full max-w-sm mx-auto flex flex-col items-center">
        
        {/* Dome / Graphic placeholder */}
        <div className="relative w-64 h-64 mb-10 flex flex-col items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-transparent rounded-full blur-3xl animate-pulse" />
          
          <h2 className="text-3xl text-white font-light mb-2 z-10">{activePrayer}</h2>
          <div className="flex items-baseline gap-2 z-10">
            <span className="text-7xl font-bold text-white tracking-tighter">{timeData.time}</span>
            <span className="text-xl text-white/80 font-medium">{timeData.ampm}</span>
          </div>
          
          <div className="mt-4 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full flex items-center gap-2 z-10 border border-white/20">
             <span className="text-white/90 text-sm font-medium">31452 Prayed</span>
          </div>
        </div>

        {/* Tracker Panel */}
        <div className="w-full bg-white/10 backdrop-blur-2xl border border-white/20 p-6 rounded-3xl shadow-2xl flex flex-col gap-6 w-[90%]">
          
          {/* Days of Week Mock */}
          <div className="flex justify-between px-2">
            {['Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thur'].map((day, i) => (
              <div key={day} className="flex flex-col items-center gap-2">
                <span className="text-[10px] uppercase text-white/60 font-semibold">{day}</span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  i < 4 ? 'bg-white/20 text-white' : 
                  i === 4 ? 'border-2 border-green-400 border-dashed text-transparent' : 
                  'bg-white/5 text-white/30'
                }`}>
                  {i < 4 ? '✓' : ''}
                </div>
              </div>
            ))}
          </div>

          <Button 
            onClick={() => setRecorded(true)} 
            disabled={recorded}
            className={`w-full h-14 rounded-2xl text-lg font-bold shadow-lg transition-all ${
              recorded 
                ? 'bg-green-600 hover:bg-green-600 text-white' 
                : 'bg-green-500 hover:bg-green-400 text-white'
            }`}
          >
            {recorded ? (
              <span className="flex items-center gap-2"><CheckCircle className="w-5 h-5"/> Recorded</span>
            ) : (
              'Tap to Record'
            )}
          </Button>

        </div>
      </div>
    </div>
  );
}
