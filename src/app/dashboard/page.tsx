'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  MapPin, 
  ChevronRight, 
  Clock, 
  BookOpen, 
  Moon, 
  Hand, 
  Compass, 
  History,
  Info
} from 'lucide-react';
import { getTimings, type PrayerTimes } from '@/lib/api/aladhan';
import { useLocation } from '@/hooks/useLocation';
import { useNextPrayer, formatPrayerTime, isPrayerPassed } from '@/hooks/usePrayer';
import { LocationSetup } from '@/components/location/LocationSetup';
import { getSettings, getReadingProgress } from '@/lib/storage/local';
import { SURAH_NAMES } from '@/lib/quran-api';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const PRAYER_DISPLAY: { key: keyof PrayerTimes; label: string }[] = [
  { key: 'Fajr', label: 'Fajr' },
  { key: 'Sunrise', label: 'Sunrise' },
  { key: 'Dhuhr', label: 'Dhuhr' },
  { key: 'Asr', label: 'Asr' },
  { key: 'Maghrib', label: 'Maghrib' },
  { key: 'Isha', label: 'Isha' },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function PrayerTimeSkeleton() {
  return (
    <Card className="rounded-2xl border-border/40 shadow-sm mb-6 overflow-hidden">
      <CardContent className="p-0">
        <div className="h-32 bg-muted flex items-center justify-center">
          <Skeleton className="w-10 h-10 rounded-full bg-background/20" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function HomePage() {
  const location = useLocation();
  const [timings, setTimings] = useState<PrayerTimes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readingProgress, setReadingProgress] = useState<{ lastSurah: number; lastAyah: number } | null>(null);

  const { nextPrayer, countdown } = useNextPrayer(timings);

  const fetchTimings = useCallback(async () => {
    if (!location.latitude || !location.longitude) {
      if (!location.loading) setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const s = getSettings();
      const data = await getTimings(
        new Date(),
        { latitude: location.latitude, longitude: location.longitude },
        s.calculationMethod,
        s.school
      );
      if (data) {
        setTimings(data.timings);
      } else {
        setError('Unable to fetch prayer times. Please check your connection.');
      }
    } catch {
      setError('Failed to load prayer times.');
    } finally {
      setLoading(false);
    }
  }, [location.latitude, location.longitude, location.loading]);

  useEffect(() => {
    setReadingProgress(getReadingProgress());
  }, []);

  useEffect(() => {
    fetchTimings();
  }, [fetchTimings]);

  // Prompt location if not yet determined
  if (!location.loading && location.permissionStatus === 'denied' && !location.latitude) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <LocationSetup onLocationSet={location.setManualLocation} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      {/* Header Section */}
      <div className="w-full max-w-7xl mx-auto px-6 md:px-10 pt-8 pb-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{getGreeting()}</p>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-foreground">Assalamu Alaikum</h1>
          </div>
          <Link href="/dashboard/settings">
            <Button variant="outline" size="sm" className="rounded-full gap-2 font-semibold">
              <MapPin size={14} className="text-primary" />
              {location.city ? <span className="hidden sm:inline">{location.city}</span> : 'Location'}
            </Button>
          </Link>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-6 md:px-10 space-y-8">
        
        {/* Next Prayer Highlight Card */}
        {loading ? (
          <PrayerTimeSkeleton />
        ) : error ? (
          <div className="rounded-2xl bg-destructive/10 border border-destructive/20 p-6 flex items-start gap-3 text-destructive">
            <Info className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Action Required</p>
              <p className="text-sm mt-1 opacity-90">{error}</p>
              <Button size="sm" variant="outline" className="mt-4 border-destructive/30 hover:bg-destructive/10" onClick={fetchTimings}>Try Again</Button>
            </div>
          </div>
        ) : nextPrayer && timings ? (
          <Card className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-0 shadow-lg shadow-primary/20">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Moon size={120} />
            </div>
            <CardContent className="p-8 md:p-10 relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <p className="text-sm uppercase tracking-widest font-bold opacity-80 mb-2">Next Prayer</p>
                <div className="flex items-baseline gap-4">
                  <h2 className="text-5xl md:text-6xl font-black tracking-tight">{nextPrayer}</h2>
                  <p className="text-2xl md:text-3xl font-medium opacity-90">{formatPrayerTime(timings[nextPrayer])}</p>
                </div>
              </div>
              
              <div className="inline-flex items-center gap-3 bg-black/20 rounded-2xl px-5 py-3 backdrop-blur-md w-fit border border-white/10">
                <Clock size={18} className="opacity-80" />
                <span className="font-mono text-2xl font-bold tracking-tight">{countdown}</span>
                <span className="text-sm opacity-80 font-medium">left</span>
              </div>
            </CardContent>
          </Card>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Left Column: Today's Prayers */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-lg font-semibold tracking-tight">Today's Prayers</h2>
              <Link href="/dashboard/prayer" className="text-sm text-primary hover:underline font-medium inline-flex items-center gap-1">
                Full schedule <ChevronRight size={14} />
              </Link>
            </div>
            
            <Card className="rounded-2xl border-border/40 shadow-sm overflow-hidden">
              <CardContent className="p-0">
                {loading ? (
                  <div className="divide-y divide-border/40">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="flex justify-between items-center p-4">
                        <Skeleton className="w-20 h-5" />
                        <Skeleton className="w-16 h-5" />
                      </div>
                    ))}
                  </div>
                ) : timings ? (
                  <ul className="divide-y divide-border/40">
                    {PRAYER_DISPLAY.map(({ key, label }) => {
                      const time = timings[key];
                      const isNext = key === nextPrayer;
                      const passed = !isNext && isPrayerPassed(time);
                      return (
                        <li
                          key={key}
                          className={cn(
                            'flex items-center justify-between p-4 transition-all',
                            isNext && 'bg-primary/10 border-l-4 border-l-primary',
                            passed && 'opacity-50'
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <span className={cn(
                              "text-sm font-semibold",
                              isNext ? "text-primary" : "text-foreground"
                            )}>
                              {label}
                            </span>
                          </div>
                          <span className="font-mono text-sm font-medium">
                            {formatPrayerTime(time)}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="p-10 text-center text-muted-foreground text-sm flex flex-col items-center justify-center h-full">
                    <MapPin className="w-8 h-8 opacity-20 mb-3" />
                    <p>No prayer times available.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Reading & Quick Access */}
          <div className="md:col-span-7 space-y-8">
            
            {/* Continue Reading */}
            {readingProgress && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold tracking-tight px-1">Continue Reading</h2>
                <Link href={`/dashboard/quran/${readingProgress.lastSurah}`}>
                  <Card className="rounded-2xl border-border/40 shadow-sm hover:shadow-md hover:border-primary/40 transition-all group">
                    <CardContent className="p-5 flex items-center gap-5">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <BookOpen size={22} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-muted-foreground font-medium mb-1">Last Read Position</p>
                        <p className="text-lg font-bold tracking-tight truncate">
                          {SURAH_NAMES[readingProgress.lastSurah] || `Surah ${readingProgress.lastSurah}`}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" className="shrink-0 group-hover:bg-transparent">
                        <ChevronRight size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            )}

            {/* Quick Access */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold tracking-tight px-1">Quick Access</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { href: '/dashboard/quran', label: 'Quran', sub: 'Read & listen', icon: BookOpen, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                  { href: '/dashboard/adhkar', label: 'Adhkar', sub: 'Morning & evening', icon: Moon, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
                  { href: '/dashboard/tasbih', label: 'Tasbih', sub: 'Digital counter', icon: Hand, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                  { href: '/dashboard/qibla', label: 'Qibla', sub: 'Find direction', icon: Compass, color: 'text-rose-500', bg: 'bg-rose-500/10' },
                ].map(({ href, label, sub, icon: Icon, color, bg }) => (
                  <Link key={href} href={href}>
                    <Card className="rounded-2xl border-border/40 shadow-sm hover:shadow-md hover:border-primary/40 hover:bg-accent/30 transition-all h-full group">
                      <CardContent className="p-5">
                        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110', bg, color)}>
                          <Icon size={20} />
                        </div>
                        <p className="text-base font-semibold tracking-tight mb-1">{label}</p>
                        <p className="text-xs text-muted-foreground font-medium">{sub}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
