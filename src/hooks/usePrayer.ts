'use client';

import { useState, useEffect, useCallback } from 'react';
import type { PrayerTimes } from '@/lib/api/aladhan';
import { getSettings, getCustomPrayerTimes } from '@/lib/storage/local';

export type PrayerName = 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';

const PRAYER_NAMES: PrayerName[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

function parseTime(timeStr: string, date: Date): Date {
  const [time, modifier] = timeStr.split(' ');
  const [hourStr, minuteStr] = time.split(':');
  let hours = parseInt(hourStr, 10);
  const minutes = parseInt(minuteStr, 10);
  if (modifier === 'PM' && hours !== 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;
  const d = new Date(date);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

export function useNextPrayer(rawTimings: PrayerTimes | null) {
  const [nextPrayer, setNextPrayer] = useState<PrayerName | null>(null);
  const [countdown, setCountdown] = useState<string>('');
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [customVersion, setCustomVersion] = useState(0);

  // Listen for custom prayer time changes
  useEffect(() => {
    const handleCustomChange = () => setCustomVersion(v => v + 1);
    window.addEventListener('custom-prayer-times-changed', handleCustomChange);
    return () => window.removeEventListener('custom-prayer-times-changed', handleCustomChange);
  }, []);

  const calculate = useCallback(() => {
    if (!rawTimings) return;
    
    // Merge custom overrides
    const custom = getCustomPrayerTimes();
    const timings: Record<string, string> = { ...rawTimings };
    for (const p of PRAYER_NAMES) {
      if (custom[p]) {
        timings[p] = custom[p];
      }
    }

    const now = new Date();
    
    for (const name of PRAYER_NAMES) {
      const prayerTime = parseTime(timings[name], now);
      if (prayerTime > now) {
        const diff = Math.floor((prayerTime.getTime() - now.getTime()) / 1000);
        setSecondsLeft(diff);
        setNextPrayer(name);
        const h = Math.floor(diff / 3600).toString().padStart(2, '0');
        const m = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
        const s = (diff % 60).toString().padStart(2, '0');
        setCountdown(`${h}:${m}:${s}`);
        return;
      }
    }
    
    // If we're here, all prayers for today have passed.
    // Next prayer is tomorrow's Fajr.
    setNextPrayer('Fajr');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowFajr = parseTime(timings['Fajr'], tomorrow);
    
    const diff = Math.floor((tomorrowFajr.getTime() - now.getTime()) / 1000);
    setSecondsLeft(diff);
    
    const h = Math.floor(diff / 3600).toString().padStart(2, '0');
    const m = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
    const s = (diff % 60).toString().padStart(2, '0');
    setCountdown(`${h}:${m}:${s}`);
  }, [rawTimings, customVersion]);

  useEffect(() => {
    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [calculate]);

  return { nextPrayer, countdown, secondsLeft };
}

export function formatPrayerTime(timeStr: string, prayerName?: string): string {
  // Check if a custom time override exists
  if (prayerName) {
    const custom = getCustomPrayerTimes();
    if (custom[prayerName]) {
      timeStr = custom[prayerName];
    }
  }

  // Convert API 24h or 12h format to user-friendly 12h format
  const [time, modifier] = timeStr.split(' ');
  if (modifier) return timeStr; // already 12h
  const [hStr, mStr] = time.split(':');
  const h = parseInt(hStr, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${mStr} ${ampm}`;
}

export function isPrayerPassed(timeStr: string, prayerName?: string): boolean {
  if (prayerName) {
    const custom = getCustomPrayerTimes();
    if (custom[prayerName]) {
      timeStr = custom[prayerName];
    }
  }

  const now = new Date();
  const [hStr, mStr] = timeStr.replace(/ (AM|PM)/, '').split(':');
  const [, modifier] = timeStr.split(' ');
  let h = parseInt(hStr, 10);
  if (modifier === 'PM' && h !== 12) h += 12;
  if (modifier === 'AM' && h === 12) h = 0;
  const prayerDate = new Date();
  prayerDate.setHours(h, parseInt(mStr, 10), 0, 0);
  return prayerDate < now;
}

export function getPrayerSettings() {
  const s = getSettings();
  return { method: s.calculationMethod, school: s.school };
}
