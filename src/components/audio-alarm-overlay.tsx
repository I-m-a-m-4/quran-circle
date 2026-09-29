'use client';

import React, { useEffect, useState, useRef } from 'react';
import { 
  getAlarms, 
  saveAlarms, 
  getCustomAudioDataUrl, 
  type AudioAlarm 
} from '@/lib/alarms';
import { Button } from '@/components/ui/button';
import { 
  Bell, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Sparkles, 
  Moon, 
  AlarmClock, 
  Check 
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function AudioAlarmOverlay() {
  const [activeAlarm, setActiveAlarm] = useState<AudioAlarm | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Monitor clock for alarms every 10 seconds
  useEffect(() => {
    const checkAlarms = async () => {
      const now = new Date();
      const currentHours = now.getHours().toString().padStart(2, '0');
      const currentMinutes = now.getMinutes().toString().padStart(2, '0');
      const currentTimeString = `${currentHours}:${currentMinutes}`;
      const currentDay = now.getDay(); // 0 = Sun ... 6 = Sat
      const minuteKey = `${now.toISOString().slice(0, 10)}-${currentTimeString}`;

      const alarms = getAlarms();
      let hasUpdates = false;

      for (const alarm of alarms) {
        if (!alarm.enabled) continue;

        // Check if day matches
        const matchesDay = alarm.repeatDays.length === 0 || alarm.repeatDays.includes(currentDay);
        if (!matchesDay) continue;

        // Check if time matches and hasn't fired in this minute
        if (alarm.time === currentTimeString && alarm.lastTriggeredKey !== minuteKey) {
          alarm.lastTriggeredKey = minuteKey;
          if (alarm.repeatDays.length === 0) {
            // One-time alarm: auto-disable after triggering
            alarm.enabled = false;
          }
          hasUpdates = true;
          triggerAlarm(alarm);
          break;
        }
      }

      if (hasUpdates) {
        saveAlarms(alarms);
      }
    };

    // Check immediately and then every 10 seconds
    checkAlarms();
    const interval = setInterval(checkAlarms, 10000);
    return () => clearInterval(interval);
  }, []);

  // Listen for manual test trigger
  useEffect(() => {
    const handleTest = (e: any) => {
      const alarm = e?.detail?.alarm;
      if (alarm) {
        triggerAlarm(alarm);
      }
    };
    window.addEventListener('test-trigger-alarm', handleTest);
    return () => window.removeEventListener('test-trigger-alarm', handleTest);
  }, []);

  const triggerAlarm = async (alarm: AudioAlarm) => {
    setActiveAlarm(alarm);
    setIsPlaying(true);

    let audioSrc = alarm.presetUrl || '/azan-abdullah.m4a';
    if (alarm.soundType === 'custom' && alarm.customAudioId) {
      const customUrl = await getCustomAudioDataUrl(alarm.customAudioId);
      if (customUrl) audioSrc = customUrl;
    }

    try {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(audioSrc);
      audio.loop = true;
      audio.volume = alarm.volume !== undefined ? alarm.volume : 0.9;
      audioRef.current = audio;
      await audio.play();
    } catch (err) {
      console.warn('Audio play restricted by browser autoplay policy, awaiting user gesture:', err);
    }
  };

  const handleDismiss = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    setActiveAlarm(null);
  };

  const handleSnooze = () => {
    if (!activeAlarm) return;
    const snoozeMinutes = activeAlarm.snoozeMinutes || 5;

    // Schedule a snooze alarm
    const now = new Date();
    now.setMinutes(now.getMinutes() + snoozeMinutes);
    const snoozeHours = now.getHours().toString().padStart(2, '0');
    const snoozeMins = now.getMinutes().toString().padStart(2, '0');
    const snoozeTime = `${snoozeHours}:${snoozeMins}`;

    const snoozedAlarm: AudioAlarm = {
      ...activeAlarm,
      id: `snooze-${Date.now()}`,
      label: `⏰ Snooze: ${activeAlarm.label}`,
      time: snoozeTime,
      repeatDays: [], // Fire once
      enabled: true,
      lastTriggeredKey: undefined,
    };

    const current = getAlarms();
    saveAlarms([...current, snoozedAlarm]);

    handleDismiss();
  };

  if (!activeAlarm) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-card/98 border border-border/80 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden flex flex-col items-center text-center space-y-6">
        
        {/* Animated Glow Rings */}
        <div className="relative flex items-center justify-center">
          <div className="absolute w-24 h-24 rounded-full bg-primary/20 animate-ping" />
          <div className="absolute w-20 h-20 rounded-full bg-orange-500/30 animate-pulse" />
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-lg relative z-10">
            <AlarmClock className="w-8 h-8 animate-bounce" />
          </div>
        </div>

        {/* Alarm Header */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-primary px-3 py-1 rounded-full bg-primary/10 inline-block">
            Scheduled Islamic Alarm
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            {activeAlarm.label}
          </h2>
          <p className="text-3xl sm:text-4xl font-mono font-bold text-primary mt-2">
            {activeAlarm.time}
          </p>
        </div>

        {/* Audio Track Badge */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-muted/60 border border-border/60 text-xs text-muted-foreground">
          <Volume2 className="w-4 h-4 text-primary animate-pulse" />
          <span className="font-medium truncate max-w-[240px]">
            {activeAlarm.soundType === 'custom'
              ? (activeAlarm.customAudioFileName || 'Custom Uploaded Audio')
              : (activeAlarm.presetName || 'Adhan Audio')}
          </span>
        </div>

        {/* Islamic Awakening Dua */}
        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 w-full space-y-1 text-center">
          <p className="font-arabic text-base sm:text-lg text-primary font-bold">
            الحَمْدُ للهِ الذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ
          </p>
          <p className="text-[11px] text-muted-foreground italic">
            "All praise is for Allah who gave us life after having taken it, and unto Him is the resurrection."
          </p>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 w-full pt-2">
          <Button
            variant="outline"
            size="lg"
            onClick={handleSnooze}
            className="rounded-2xl h-12 text-sm font-semibold flex items-center justify-center gap-2 border-border hover:bg-muted"
          >
            <RotateCcw className="w-4 h-4" />
            Snooze ({activeAlarm.snoozeMinutes || 5}m)
          </Button>

          <Button
            size="lg"
            onClick={handleDismiss}
            className="rounded-2xl h-12 text-sm font-bold flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-lg shadow-orange-500/25"
          >
            <Check className="w-4 h-4" />
            Dismiss
          </Button>
        </div>

      </div>
    </div>
  );
}
