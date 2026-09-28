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
import { IslamicPattern } from '@/components/ui/islamic-pattern';

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
    <Card className="rounded-3xl border-border/40 shadow-sm overflow-hidden min-h-[240px] md:min-h-[280px]">
      <CardContent className="p-0 h-full">
        <div className="min-h-[240px] md:min-h-[280px] bg-muted flex items-center justify-center">
          <Skeleton className="w-12 h-12 rounded-full bg-background/20" />
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
        <LocationSetup onLocationSet={location.setManualLocation} onSkip={location.skipLocation} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      {/* Header Section */}
      <div className="w-full max-w-[1600px] 2xl:max-w-[1750px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-10 pt-6 pb-4">
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

      <div className="w-full max-w-[1600px] 2xl:max-w-[1750px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-10 space-y-8">
        
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
          <Card 
            onClick={() => {
              window.dispatchEvent(new CustomEvent('open-adhan-overlay', { detail: { prayer: nextPrayer } }));
            }}
            className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground border-0 shadow-xl shadow-primary/25 min-h-[240px] md:min-h-[280px] flex flex-col justify-center cursor-pointer transition-transform hover:scale-[1.005] active:scale-[0.995] group"
          >
            <IslamicPattern className="absolute -right-20 -bottom-20 w-[480px] h-[480px] text-white pointer-events-none" opacity={0.18} />
            <div className="absolute -top-6 -right-6 p-8 opacity-15 pointer-events-none">
              <Moon size={220} />
            </div>
            <CardContent className="p-10 md:p-14 relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <p className="text-xs md:text-sm uppercase tracking-widest font-extrabold opacity-85">Next Prayer</p>
                  <span className="text-[11px] font-bold bg-white/20 hover:bg-white/30 text-white px-2.5 py-0.5 rounded-full transition-colors">
                    Click to Record or Adjust ↗
                  </span>
                </div>
                <div className="flex items-baseline gap-5 flex-wrap">
                  <h2 className="text-5xl md:text-7xl font-black tracking-tight">{nextPrayer}</h2>
                  <p className="text-3xl md:text-4xl font-semibold opacity-95">{formatPrayerTime(timings[nextPrayer], nextPrayer)}</p>
                </div>
              </div>
              
              <div className="inline-flex items-center gap-3 bg-black/25 rounded-2xl px-6 py-4 backdrop-blur-md w-fit border border-white/15 shadow-inner">
                <Clock size={22} className="opacity-90 shrink-0" />
                <span className="font-mono text-2xl md:text-3xl font-extrabold tracking-tight">{countdown}</span>
                <span className="text-sm md:text-base opacity-85 font-semibold">left</span>
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
                      const passed = !isNext && isPrayerPassed(time, key);
                      const isNotifiable = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].includes(key);
                      return (
                        <li
                          key={key}
                          onClick={() => {
                            if (isNotifiable) {
                              window.dispatchEvent(new CustomEvent('open-adhan-overlay', { detail: { prayer: key } }));
                            }
                          }}
                          className={cn(
                            'flex items-center justify-between p-4 transition-all group',
                            isNotifiable && 'cursor-pointer hover:bg-muted/50',
                            isNext && 'bg-primary/10 border-l-4 border-l-primary',
                            passed && 'opacity-60'
                          )}
                          title={isNotifiable ? `Click to record or adjust ${label} time` : undefined}
                        >
                          <div className="flex items-center gap-3">
                            <span className={cn(
                              "text-sm font-semibold transition-colors",
                              isNext ? "text-primary" : "text-foreground",
                              isNotifiable && "group-hover:text-primary"
                            )}>
                              {label}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-medium">
                              {formatPrayerTime(time, key)}
                            </span>
                            {isNotifiable && (
                              <span className="text-[11px] opacity-0 group-hover:opacity-100 text-primary font-medium transition-opacity hidden sm:inline">
                                Record / Edit ↗
                              </span>
                            )}
                          </div>
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
            
            {/* Continue Reading - Dashed Style */}
            {readingProgress && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold tracking-tight px-1">Continue Reading</h2>
                <Link href={`/dashboard/quran/${readingProgress.lastSurah}`}>
                  <Card className="rounded-2xl border-2 border-dashed border-primary/30 hover:border-primary/70 bg-gradient-to-r from-card via-primary/[0.02] to-card shadow-sm hover:shadow-md transition-all group">
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

            {/* Quick Access - Refined Cards with Dashed Borders */}
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
                    <Card className="rounded-2xl border border-dashed border-border/80 hover:border-primary/60 hover:bg-accent/40 shadow-sm hover:shadow-md transition-all h-full group">
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
