'use client';

import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useLocation } from '@/hooks/useLocation';
import { getTimings, PrayerTimes } from '@/lib/api/aladhan';
import { Button } from '@/components/ui/button';
import { 
  X, 
  Volume2, 
  VolumeX, 
  CheckCircle, 
  Pencil, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Clock 
} from 'lucide-react';
import { 
  getWorshipLog, 
  updateTodayWorship, 
  Worship 
} from '@/lib/storage/local';

// 5 Daily Obligatory Prayers
const NOTIFIABLE_PRAYERS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;
type PrayerType = typeof NOTIFIABLE_PRAYERS[number];

const CUSTOM_TIMES_KEY = 'md_custom_prayer_times';
const PRAYER_COUNT_KEY = 'md_prayer_counter_base';

export function AdhanOverlay() {
  const { latitude, longitude } = useLocation();
  const [timings, setTimings] = useState<PrayerTimes | null>(null);
  const [activePrayer, setActivePrayer] = useState<PrayerType | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  
  // Custom prayer times overrides { Fajr: '05:30', ... }
  const [customTimes, setCustomTimes] = useState<Record<string, string>>({});
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [editTimeValue, setEditTimeValue] = useState('');

  // Worship log tracking from local.ts
  const [worshipLog, setWorshipLog] = useState<Record<string, Worship>>({});
  
  // Community / Personal prayed count
  const [prayedCount, setPrayedCount] = useState<number>(31452);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load saved custom times and worship log on mount
  useEffect(() => {
    try {
      const savedCustom = localStorage.getItem(CUSTOM_TIMES_KEY);
      if (savedCustom) setCustomTimes(JSON.parse(savedCustom));
    } catch {}

    try {
      const savedCount = localStorage.getItem(PRAYER_COUNT_KEY);
      if (savedCount) setPrayedCount(parseInt(savedCount, 10));
    } catch {}

    setWorshipLog(getWorshipLog());

    // Listen for custom trigger event from other components
    const handleOpenAdhan = (e: any) => {
      const prayer = e?.detail?.prayer;
      if (prayer && NOTIFIABLE_PRAYERS.includes(prayer)) {
        setActivePrayer(prayer);
      } else {
        setActivePrayer('Fajr');
      }
    };
    window.addEventListener('open-adhan-overlay', handleOpenAdhan);
    return () => window.removeEventListener('open-adhan-overlay', handleOpenAdhan);
  }, []);

  // Ask for notification permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
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

  // Determine current active prayer time in 24h format (HH:MM)
  const getPrayerTime24 = useCallback((prayer: PrayerType): string => {
    if (customTimes[prayer]) {
      return customTimes[prayer];
    }
    if (timings && timings[prayer as keyof PrayerTimes]) {
      const raw = timings[prayer as keyof PrayerTimes];
      return raw.split(' ')[0]; // Strip timezone (e.g. '05:33 (+01)' -> '05:33')
    }
    // Sane fallback defaults if offline / location loading
    const defaults: Record<PrayerType, string> = {
      Fajr: '05:33',
      Dhuhr: '12:45',
      Asr: '16:15',
      Maghrib: '18:45',
      Isha: '20:00'
    };
    return defaults[prayer];
  }, [customTimes, timings]);

  // Check the clock every 30s to trigger Adhan automatically
  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const currentHours = now.getHours().toString().padStart(2, '0');
      const currentMinutes = now.getMinutes().toString().padStart(2, '0');
      const currentTimeString = `${currentHours}:${currentMinutes}`;

      for (const prayer of NOTIFIABLE_PRAYERS) {
        const prayerTime = getPrayerTime24(prayer);
        if (prayerTime === currentTimeString && activePrayer !== prayer) {
          triggerAdhan(prayer, prayerTime);
        }
      }
    };

    const interval = setInterval(checkTime, 30000);
    return () => clearInterval(interval);
  }, [getPrayerTime24, activePrayer]);

  const triggerAdhan = (prayer: PrayerType, timeString: string) => {
    setActivePrayer(prayer);
    setIsEditingTime(false);

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(`Time for ${prayer}`, {
        body: `It is now ${timeString}. Tap to open Muslim Desk and record your prayer.`,
        icon: '/icon-192x192.png'
      });
    }

    try {
      const audio = new Audio('/azan-abdullah.m4a');
      audioRef.current = audio;
      audio.play().catch(e => console.warn('Autoplay blocked by browser:', e));
    } catch (e) {
      console.error('Audio error:', e);
    }
  };

  const closeOverlay = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setActivePrayer(null);
    setIsEditingTime(false);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
      setIsMuted(audioRef.current.muted);
    }
  };

  // Switch between prayers
  const handleSelectPrayer = (prayer: PrayerType) => {
    setActivePrayer(prayer);
    setIsEditingTime(false);
  };

  const handleNextPrayer = () => {
    if (!activePrayer) return;
    const currentIndex = NOTIFIABLE_PRAYERS.indexOf(activePrayer);
    const nextIndex = (currentIndex + 1) % NOTIFIABLE_PRAYERS.length;
    handleSelectPrayer(NOTIFIABLE_PRAYERS[nextIndex]);
  };

  const handlePrevPrayer = () => {
    if (!activePrayer) return;
    const currentIndex = NOTIFIABLE_PRAYERS.indexOf(activePrayer);
    const prevIndex = (currentIndex - 1 + NOTIFIABLE_PRAYERS.length) % NOTIFIABLE_PRAYERS.length;
    handleSelectPrayer(NOTIFIABLE_PRAYERS[prevIndex]);
  };

  // Format 24-hour time to 12-hour AM/PM
  const format12Hour = (time24: string) => {
    const [h, m] = (time24 || '05:33').split(':');
    let hours = parseInt(h, 10);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return { time: `${hours}:${m}`, ampm };
  };

  // Custom Prayer Time Editing
  const handleStartEditTime = () => {
    if (!activePrayer) return;
    setEditTimeValue(getPrayerTime24(activePrayer));
    setIsEditingTime(true);
  };

  const handleSaveCustomTime = () => {
    if (!activePrayer || !editTimeValue) return;
    const updated = { ...customTimes, [activePrayer]: editTimeValue };
    setCustomTimes(updated);
    try {
      localStorage.setItem(CUSTOM_TIMES_KEY, JSON.stringify(updated));
    } catch {}
    setIsEditingTime(false);
  };

  const handleResetCustomTime = () => {
    if (!activePrayer) return;
    const updated = { ...customTimes };
    delete updated[activePrayer];
    setCustomTimes(updated);
    try {
      localStorage.setItem(CUSTOM_TIMES_KEY, JSON.stringify(updated));
    } catch {}
    setIsEditingTime(false);
  };

  // Today Date Key (YYYY-MM-DD)
  const todayKey = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Is today recorded for this active prayer?
  const isTodayRecorded = useMemo(() => {
    if (!activePrayer) return false;
    return !!worshipLog[todayKey]?.[activePrayer as keyof Worship];
  }, [worshipLog, todayKey, activePrayer]);

  // Toggle record for Today
  const handleToggleTodayRecord = () => {
    if (!activePrayer) return;
    const nextState = !isTodayRecorded;
    updateTodayWorship({ [activePrayer]: nextState });
    setWorshipLog(getWorshipLog());

    if (nextState) {
      setPrayedCount(prev => {
        const next = prev + 1;
        try { localStorage.setItem(PRAYER_COUNT_KEY, String(next)); } catch {}
        return next;
      });
    }
  };

  // Toggle record for any specific day in the week
  const handleToggleDay = (dateKey: string) => {
    if (!activePrayer) return;
    const currentEntry = worshipLog[dateKey] ?? {
      date: dateKey,
      Fajr: false,
      Dhuhr: false,
      Asr: false,
      Maghrib: false,
      Isha: false,
      quranMinutes: 0,
      morningAdhkar: false,
      eveningAdhkar: false,
      tasbihCount: 0,
    };

    const nextVal = !currentEntry[activePrayer as keyof Worship];
    const updatedLog = {
      ...worshipLog,
      [dateKey]: {
        ...currentEntry,
        [activePrayer]: nextVal,
      }
    };
    setWorshipLog(updatedLog);
    try {
      localStorage.setItem('md_worship', JSON.stringify(updatedLog));
    } catch {}
  };

  // 7 Days list matching the screenshot order: Fri, Sat, Sun, Mon, Tue, Wed, Thur
  const weekDays = useMemo(() => {
    const days = [];
    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THUR', 'FRI', 'SAT'];
    const now = new Date();
    const todayIndex = now.getDay(); // 0 = Sun, 1 = Mon, ..., 5 = Fri, 6 = Sat
    
    // In screenshot: FRI, SAT, SUN, MON, TUE, WED, THUR (Islamic / Middle East week starting Friday)
    // Find the Friday on or before current cycle
    const diffToFri = (todayIndex + 2) % 7; // days since last Friday
    const startFriday = new Date(now);
    startFriday.setDate(startFriday.getDate() - diffToFri);

    for (let i = 0; i < 7; i++) {
      const d = new Date(startFriday);
      d.setDate(d.getDate() + i);
      const dateKey = d.toISOString().split('T')[0];
      const dayName = dayNames[d.getDay()];
      const isToday = dateKey === todayKey;
      days.push({
        label: dayName,
        dateKey,
        isToday,
      });
    }
    return days;
  }, [todayKey]);

  if (!activePrayer) return null;

  const activeTime24 = getPrayerTime24(activePrayer);
  const timeData = format12Hour(activeTime24);
  const isCustomTime = !!customTimes[activePrayer];

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/80 backdrop-blur-2xl fade-in p-4 select-none">
      
      {/* Top Header Controls */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={closeOverlay} 
          className="rounded-full bg-white/10 hover:bg-white/20 text-white transition-transform active:scale-95"
        >
          <X className="w-5 h-5" />
        </Button>
        
        {/* Prayer Selector Pills: Fajr, Dhuhr, Asr, Maghrib, Isha */}
        <div className="flex items-center gap-1 bg-white/10 backdrop-blur-xl p-1 rounded-full border border-white/15">
          {NOTIFIABLE_PRAYERS.map((prayer) => {
            const isSelected = activePrayer === prayer;
            return (
              <button
                key={prayer}
                type="button"
                onClick={() => handleSelectPrayer(prayer)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  isSelected 
                    ? 'bg-[#FF6A00] text-white shadow-lg shadow-orange-500/30' 
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                {prayer}
              </button>
            );
          })}
        </div>

        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleMute} 
          className="rounded-full bg-white/10 hover:bg-white/20 text-white transition-transform active:scale-95"
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </Button>
      </div>

      {/* Main Prayer Display */}
      <div className="relative w-full max-w-sm mx-auto flex flex-col items-center mt-6">
        
        {/* Dome Aura Glow with warm orange gradient */}
        <div className="relative w-64 h-64 mb-6 flex flex-col items-center justify-center text-center">
          <div className="absolute inset-0 bg-gradient-to-b from-[#FF6A00]/25 via-orange-500/10 to-transparent rounded-full blur-3xl animate-pulse pointer-events-none" />
          
          {/* Prayer Navigation Header */}
          <div className="flex items-center gap-4 z-10 mb-1">
            <button 
              type="button"
              onClick={handlePrevPrayer}
              className="text-white/60 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
              title="Previous Prayer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-3xl text-white font-light tracking-wide">{activePrayer}</h2>
            <button 
              type="button"
              onClick={handleNextPrayer}
              className="text-white/60 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
              title="Next Prayer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Prayer Time Display or Inline Editor */}
          {isEditingTime ? (
            <div className="z-20 bg-black/75 border border-white/20 backdrop-blur-xl p-3.5 rounded-2xl flex flex-col items-center gap-3 my-2 shadow-2xl">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#FF7A1A]" />
                <span className="text-xs text-white/80 font-medium">Edit {activePrayer} Time</span>
              </div>
              <input
                type="time"
                value={editTimeValue}
                onChange={(e) => setEditTimeValue(e.target.value)}
                className="bg-white/15 border border-white/30 text-white font-mono text-xl rounded-xl px-3 py-1.5 outline-none focus:border-[#FF6A00] text-center"
              />
              <div className="flex items-center gap-2 w-full">
                <button
                  type="button"
                  onClick={handleSaveCustomTime}
                  className="flex-1 bg-[#FF6A00] hover:bg-[#FF7A1A] text-white text-xs font-bold py-1.5 px-3 rounded-lg flex items-center justify-center gap-1 shadow-md"
                >
                  <Check className="w-3.5 h-3.5" /> Save
                </button>
                {isCustomTime && (
                  <button
                    type="button"
                    onClick={handleResetCustomTime}
                    className="bg-white/15 hover:bg-white/25 text-white/80 text-xs py-1.5 px-2.5 rounded-lg flex items-center justify-center gap-1"
                    title="Reset to calculated location time"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Auto
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsEditingTime(false)}
                  className="text-white/50 hover:text-white text-xs py-1.5 px-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div 
              onClick={handleStartEditTime}
              className="group flex items-baseline gap-2 z-10 cursor-pointer p-2 rounded-2xl hover:bg-white/5 transition-all"
              title="Click to edit prayer time"
            >
              <span className="text-7xl font-extrabold text-white tracking-tighter">{timeData.time}</span>
              <span className="text-xl text-white/80 font-semibold">{timeData.ampm}</span>
              <Pencil className="w-4 h-4 text-white/40 group-hover:text-[#FF7A1A] transition-colors ml-1 self-center" />
            </div>
          )}

          {/* Time Origin Badge */}
          <div className="flex items-center gap-2 mt-1 z-10">
            {isCustomTime && (
              <span className="text-[10px] font-semibold bg-[#FF6A00]/20 text-[#FF7A1A] border border-[#FF6A00]/40 px-2 py-0.5 rounded-full">
                Custom Time
              </span>
            )}
          </div>
          
          {/* Community Prayed Counter */}
          <div className="mt-3 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full flex items-center gap-2 z-10 border border-white/20 shadow-sm">
             <span className="text-white/90 text-sm font-semibold">{prayedCount.toLocaleString()} Prayed</span>
          </div>
        </div>

        {/* Tracker Panel */}
        <div className="w-full bg-white/10 backdrop-blur-2xl border border-white/20 p-6 rounded-3xl shadow-2xl flex flex-col gap-6 w-[92%]">
          
          {/* Days of Week Tracker */}
          <div className="flex justify-between items-center px-1">
            {weekDays.map(({ label, dateKey, isToday }) => {
              const isDayPrayed = !!worshipLog[dateKey]?.[activePrayer as keyof Worship];
              return (
                <button 
                  key={dateKey} 
                  type="button"
                  onClick={() => handleToggleDay(dateKey)}
                  className="flex flex-col items-center gap-2 group transition-transform active:scale-95"
                  title={`Toggle ${label} ${activePrayer} (${isDayPrayed ? 'Prayed' : 'Not recorded'})`}
                >
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${
                    isToday ? 'text-[#FF7A1A]' : 'text-white/60'
                  }`}>
                    {label}
                  </span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isDayPrayed 
                      ? 'bg-[#FF6A00] text-white shadow-lg shadow-orange-500/30' 
                      : isToday 
                        ? 'border-2 border-[#FF6A00] border-dashed text-white/40 hover:bg-[#FF6A00]/20' 
                        : 'bg-white/10 text-white/30 hover:bg-white/20'
                  }`}>
                    {isDayPrayed ? '✓' : ''}
                  </div>
                </button>
              );
            })}
          </div>

          {/* VIBRANT ORANGE Main Action Button */}
          <Button 
            onClick={handleToggleTodayRecord} 
            className={`w-full h-14 rounded-2xl text-lg font-bold shadow-xl transition-all flex items-center justify-center gap-2 ${
              isTodayRecorded 
                ? 'bg-[#FF6A00]/25 hover:bg-[#FF6A00]/35 text-[#FF7A1A] border-2 border-[#FF6A00]' 
                : 'bg-gradient-to-r from-[#FF6A00] to-[#FF8C33] hover:from-[#FF7A1A] hover:to-[#FF9944] active:scale-[0.98] text-white shadow-[#FF6A00]/30'
            }`}
          >
            {isTodayRecorded ? (
              <>
                <CheckCircle className="w-5 h-5 text-[#FF7A1A]" />
                <span>Recorded for {activePrayer}</span>
              </>
            ) : (
              'Tap to Record'
            )}
          </Button>

        </div>
      </div>
    </div>
  );
}
