'use client';

import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useLocation } from '@/hooks/useLocation';
import { getTimings, PrayerTimes } from '@/lib/api/aladhan';
import { Button } from '@/components/ui/button';
import { 
  X, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  Pencil, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Clock,
  Plus,
  Minus
} from 'lucide-react';
import { 
  getWorshipLog, 
  updateTodayWorship, 
  Worship,
  getCustomPrayerTimes,
  saveCustomPrayerTime,
  resetCustomPrayerTime
} from '@/lib/storage/local';

// 5 Daily Obligatory Prayers
const NOTIFIABLE_PRAYERS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;
type PrayerType = typeof NOTIFIABLE_PRAYERS[number];

const PRAYER_ARABIC: Record<PrayerType, string> = {
  Fajr: 'الفجر',
  Dhuhr: 'الظهر',
  Asr: 'العصر',
  Maghrib: 'المغرب',
  Isha: 'العشاء',
};

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
    setCustomTimes(getCustomPrayerTimes());

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

    // Listen for custom prayer times change
    const handleCustomChange = (e: any) => {
      if (e?.detail) setCustomTimes(e.detail);
      else setCustomTimes(getCustomPrayerTimes());
    };
    window.addEventListener('custom-prayer-times-changed', handleCustomChange);

    return () => {
      window.removeEventListener('open-adhan-overlay', handleOpenAdhan);
      window.removeEventListener('custom-prayer-times-changed', handleCustomChange);
    };
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

  // Determine prayer time in 24h format (HH:MM)
  const getPrayerTime24 = useCallback((prayer: PrayerType): string => {
    if (customTimes[prayer]) {
      return customTimes[prayer];
    }
    if (timings && timings[prayer as keyof PrayerTimes]) {
      const raw = timings[prayer as keyof PrayerTimes];
      return raw.split(' ')[0]; // Strip timezone (e.g. '05:33 (+01)' -> '05:33')
    }
    // Default fallback times
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

  const handleAdjustMinutes = (minutesDelta: number) => {
    if (!editTimeValue) return;
    const [hStr, mStr] = editTimeValue.split(':');
    let totalMinutes = parseInt(hStr, 10) * 60 + parseInt(mStr, 10) + minutesDelta;
    if (totalMinutes < 0) totalMinutes += 24 * 60;
    totalMinutes = totalMinutes % (24 * 60);

    const newH = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
    const newM = (totalMinutes % 60).toString().padStart(2, '0');
    setEditTimeValue(`${newH}:${newM}`);
  };

  const handleSaveCustomTime = () => {
    if (!activePrayer || !editTimeValue) return;
    saveCustomPrayerTime(activePrayer, editTimeValue);
    setCustomTimes(prev => ({ ...prev, [activePrayer]: editTimeValue }));
    setIsEditingTime(false);
  };

  const handleResetCustomTime = () => {
    if (!activePrayer) return;
    resetCustomPrayerTime(activePrayer);
    setCustomTimes(prev => {
      const next = { ...prev };
      delete next[activePrayer];
      return next;
    });
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

    // If day is today, also bump count
    if (dateKey === todayKey && nextVal) {
      setPrayedCount(prev => {
        const next = prev + 1;
        try { localStorage.setItem(PRAYER_COUNT_KEY, String(next)); } catch {}
        return next;
      });
    }
  };

  // 7 Days list matching the screenshot order: FRI, SAT, SUN, MON, TUE, WED, THUR
  const weekDays = useMemo(() => {
    const days = [];
    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THUR', 'FRI', 'SAT'];
    const now = new Date();
    const todayIndex = now.getDay(); // 0 = Sun, 1 = Mon, ..., 5 = Fri, 6 = Sat
    
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
        dayNum: d.getDate(),
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
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/85 backdrop-blur-2xl fade-in p-4 select-none">
      
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
        <div className="flex items-center gap-1 bg-white/10 backdrop-blur-xl p-1 rounded-full border border-white/15 shadow-xl">
          {NOTIFIABLE_PRAYERS.map((prayer) => {
            const isSelected = activePrayer === prayer;
            return (
              <button
                key={prayer}
                type="button"
                onClick={() => handleSelectPrayer(prayer)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  isSelected 
                    ? 'bg-[#FF6A00] text-white shadow-lg shadow-orange-500/40 scale-105' 
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
        <div className="relative w-72 h-72 mb-4 flex flex-col items-center justify-center text-center">
          <div className="absolute inset-0 bg-gradient-to-b from-[#FF6A00]/30 via-orange-500/15 to-transparent rounded-full blur-3xl animate-pulse pointer-events-none" />
          
          {/* Prayer Navigation Header with Previous / Next Arrows */}
          <div className="flex items-center gap-4 z-10 mb-1">
            <button 
              type="button"
              onClick={handlePrevPrayer}
              className="text-white/60 hover:text-white p-1.5 rounded-full hover:bg-white/15 transition-all active:scale-95"
              title="Previous Prayer"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <div className="flex flex-col items-center">
              <h2 className="text-3xl text-white font-light tracking-wide">{activePrayer}</h2>
              <span className="text-xs text-[#FF8C33] font-arabic tracking-wider">{PRAYER_ARABIC[activePrayer]}</span>
            </div>

            <button 
              type="button"
              onClick={handleNextPrayer}
              className="text-white/60 hover:text-white p-1.5 rounded-full hover:bg-white/15 transition-all active:scale-95"
              title="Next Prayer"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Prayer Time Display or Inline Editor */}
          {isEditingTime ? (
            <div className="z-20 bg-zinc-950/90 border border-white/25 backdrop-blur-2xl p-4 rounded-3xl flex flex-col items-center gap-3 my-2 shadow-2xl w-full max-w-[280px]">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#FF7A1A]" />
                <span className="text-xs text-white/90 font-semibold">Adjust {activePrayer} Time</span>
              </div>
              
              <input
                type="time"
                value={editTimeValue}
                onChange={(e) => setEditTimeValue(e.target.value)}
                className="bg-white/10 border border-white/25 text-white font-mono text-2xl font-bold rounded-2xl px-4 py-2 outline-none focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00] text-center w-full shadow-inner"
              />

              {/* Quick minute adjustment buttons */}
              <div className="flex items-center justify-center gap-1.5 w-full">
                <button
                  type="button"
                  onClick={() => handleAdjustMinutes(-10)}
                  className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 text-[11px] font-mono transition-colors"
                >
                  -10m
                </button>
                <button
                  type="button"
                  onClick={() => handleAdjustMinutes(-5)}
                  className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 text-[11px] font-mono transition-colors"
                >
                  -5m
                </button>
                <button
                  type="button"
                  onClick={() => handleAdjustMinutes(5)}
                  className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 text-[11px] font-mono transition-colors"
                >
                  +5m
                </button>
                <button
                  type="button"
                  onClick={() => handleAdjustMinutes(10)}
                  className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 text-[11px] font-mono transition-colors"
                >
                  +10m
                </button>
              </div>

              {/* Save / Reset / Cancel Actions */}
              <div className="flex items-center gap-2 w-full pt-1">
                <button
                  type="button"
                  onClick={handleSaveCustomTime}
                  className="flex-1 bg-[#FF6A00] hover:bg-[#FF7A1A] text-white text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-orange-500/30 transition-all active:scale-95"
                >
                  <Check className="w-3.5 h-3.5" /> Save
                </button>
                {isCustomTime && (
                  <button
                    type="button"
                    onClick={handleResetCustomTime}
                    className="bg-white/10 hover:bg-white/20 text-white/80 text-xs py-2 px-2.5 rounded-xl flex items-center justify-center gap-1 transition-colors"
                    title="Reset to calculated location time"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Auto
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsEditingTime(false)}
                  className="text-white/60 hover:text-white text-xs py-2 px-2 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div 
              onClick={handleStartEditTime}
              className="group flex flex-col items-center z-10 cursor-pointer p-2 rounded-2xl hover:bg-white/5 transition-all"
              title="Click to edit prayer time"
            >
              <div className="flex items-baseline gap-2">
                <span className="text-7xl font-extrabold text-white tracking-tighter">{timeData.time}</span>
                <span className="text-xl text-white/80 font-semibold">{timeData.ampm}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-white/50 group-hover:text-[#FF7A1A] transition-colors">
                <Pencil className="w-3.5 h-3.5" />
                <span>{isCustomTime ? 'Custom time (click to edit)' : 'Click to adjust time'}</span>
              </div>
            </div>
          )}

          {/* Time Origin Badge */}
          {isCustomTime && !isEditingTime && (
            <div className="flex items-center gap-1.5 mt-1 z-10">
              <span className="text-[10px] font-bold bg-[#FF6A00]/25 text-[#FF8C33] border border-[#FF6A00]/40 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Clock className="w-3 h-3" /> Custom Time
              </span>
            </div>
          )}
          
          {/* Community Prayed Counter */}
          <div className="mt-3 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full flex items-center gap-2 z-10 border border-white/20 shadow-sm">
             <span className="text-white/90 text-sm font-semibold">{prayedCount.toLocaleString()} Prayed</span>
          </div>
        </div>

        {/* Tracker Panel */}
        <div className="w-full bg-white/10 backdrop-blur-2xl border border-white/20 p-6 rounded-3xl shadow-2xl flex flex-col gap-6 w-[92%]">
          
          {/* Days of Week Tracker Header */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center px-1">
              {weekDays.map(({ label, dateKey, isToday }) => {
                const isDayPrayed = !!worshipLog[dateKey]?.[activePrayer as keyof Worship];
                return (
                  <button 
                    key={dateKey} 
                    type="button"
                    onClick={() => handleToggleDay(dateKey)}
                    className="flex flex-col items-center gap-2 group transition-transform active:scale-95 cursor-pointer focus:outline-none"
                    title={`Click to toggle ${label} (${isDayPrayed ? 'Recorded' : 'Unrecorded'})`}
                  >
                    <span className={`text-[10px] uppercase font-bold tracking-wider transition-colors ${
                      isToday ? 'text-[#FF7A1A]' : 'text-white/60 group-hover:text-white'
                    }`}>
                      {label}
                    </span>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isDayPrayed 
                        ? 'bg-[#FF6A00] text-white shadow-lg shadow-orange-500/40 ring-2 ring-[#FF6A00]/50' 
                        : isToday 
                          ? 'border-2 border-[#FF6A00] border-dashed text-[#FF7A1A] hover:bg-[#FF6A00]/20 animate-pulse' 
                          : 'bg-white/10 text-white/30 hover:bg-white/25 hover:text-white/70'
                    }`}>
                      {isDayPrayed ? '✓' : ''}
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-center text-white/40 tracking-tight">
              Tap any day above to toggle your record
            </p>
          </div>

          {/* VIBRANT ORANGE Main Action Button */}
          <Button 
            onClick={handleToggleTodayRecord} 
            className={`w-full h-14 rounded-2xl text-lg font-bold shadow-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer ${
              isTodayRecorded 
                ? 'bg-[#FF6A00]/20 hover:bg-[#FF6A00]/30 text-[#FF8C33] border-2 border-[#FF6A00] shadow-lg shadow-orange-500/20 active:scale-[0.98]' 
                : 'bg-gradient-to-r from-[#FF6A00] via-[#FF7A1A] to-[#FF8C33] hover:from-[#FF7A1A] hover:to-[#FF9944] active:scale-[0.98] text-white shadow-xl shadow-orange-500/40 border-0'
            }`}
          >
            {isTodayRecorded ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-[#FF6A00]" />
                <span>Recorded for {activePrayer}</span>
              </>
            ) : (
              <span>Tap to Record</span>
            )}
          </Button>

        </div>
      </div>
    </div>
  );
}
