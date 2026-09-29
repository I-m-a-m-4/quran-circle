'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  BookOpen, 
  Clock, 
  Moon, 
  Hand, 
  Compass, 
  Calendar, 
  Heart, 
  Bookmark, 
  Sparkles, 
  ChevronRight,
  ArrowUpRight
} from 'lucide-react';
import { IslamicPattern } from '@/components/ui/islamic-pattern';

const PRODUCTIVITY_TOOLS = [
  {
    id: 'quran',
    title: 'Holy Quran Reader & Recitations',
    description: 'Read and listen to 114 Surahs with verse-by-verse translation, tafsir, bookmarks, and multiple world-renowned Qaris.',
    href: '/dashboard/quran',
    icon: BookOpen,
    badge: 'Popular',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10 border-emerald-500/20'
  },
  {
    id: 'prayer',
    title: 'Prayer Times & Audio Adhan',
    description: 'Accurate location-based prayer schedules, countdowns, and customizable full audio Adhan notifications.',
    href: '/dashboard/prayer',
    icon: Clock,
    badge: 'Essential',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10 border-amber-500/20'
  },
  {
    id: 'adhkar',
    title: 'Daily Adhkar & Morning/Evening Duas',
    description: 'Authentic morning and evening supplications with Arabic scripts, transliteration, English meanings, and tap counter.',
    href: '/dashboard/adhkar',
    icon: Moon,
    badge: 'Daily Routine',
    color: 'text-indigo-500',
    bg: 'bg-indigo-500/10 border-indigo-500/20'
  },
  {
    id: 'tasbih',
    title: 'Digital Tasbih Counter',
    description: 'Interactive haptic click counter for dhikr with customizable targets, preset formulas, and session tracking.',
    href: '/dashboard/tasbih',
    icon: Hand,
    badge: 'Interactive',
    color: 'text-orange-500',
    bg: 'bg-orange-500/10 border-orange-500/20'
  },
  {
    id: 'qibla',
    title: 'Qibla Direction Finder',
    description: 'Precision real-time compass to calculate the exact direction of the Kaaba from your current location.',
    href: '/dashboard/qibla',
    icon: Compass,
    badge: 'Utility',
    color: 'text-rose-500',
    bg: 'bg-rose-500/10 border-rose-500/20'
  },
  {
    id: 'calendar',
    title: 'Hijri & Islamic Calendar',
    description: 'Hijri date conversion, upcoming Islamic holidays, White Days (Ayyam al-Beed) fasting reminders, and history.',
    href: '/dashboard/calendar',
    icon: Calendar,
    badge: 'Schedule',
    color: 'text-purple-500',
    bg: 'bg-purple-500/10 border-purple-500/20'
  },
  {
    id: 'worship',
    title: 'Worship & Spiritual Habit Tracker',
    description: 'Track your daily Fard & Sunnah prayers, Quran reading progress, fasting consistency, and streak milestones.',
    href: '/dashboard/worship',
    icon: Heart,
    badge: 'Analytics',
    color: 'text-red-500',
    bg: 'bg-red-500/10 border-red-500/20'
  },
  {
    id: 'ai-search',
    title: 'AI Quran & Guidance Engine',
    description: 'Ask AI questions and receive contextually matched Quranic verses tailored to your specific emotions or situation.',
    href: '/ai-search',
    icon: Sparkles,
    badge: 'AI Powered',
    color: 'text-cyan-500',
    bg: 'bg-cyan-500/10 border-cyan-500/20'
  },
  {
    id: 'bookmarks',
    title: 'Bookmarks & Saved Ayahs',
    description: 'Quickly access your saved Quranic verses, study notes, and favorite recitations across all devices.',
    href: '/dashboard/bookmarks',
    icon: Bookmark,
    badge: 'Saved',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10 border-blue-500/20'
  }
];

export default function CirclePage() {
  return (
    <div className="w-full max-w-7xl mx-auto p-6 md:p-8 space-y-6 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="relative rounded-3xl p-6 md:p-8 bg-gradient-to-r from-primary/15 via-primary/5 to-card border border-primary/20 overflow-hidden shadow-sm">
        <IslamicPattern className="absolute -right-20 -top-20 w-[420px] h-[420px] text-primary pointer-events-none" opacity={0.05} />
        <div className="relative z-10 space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-[11px] font-extrabold text-primary tracking-wide mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Muslim Productivity Suite
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">Muslim Desk Tools</h1>
          <p className="text-xs md:text-sm text-muted-foreground font-medium">
            Your all-in-one Islamic workspace & spiritual productivity toolkit.
          </p>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {PRODUCTIVITY_TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link key={tool.id} href={tool.href}>
              <Card className="relative h-full rounded-2xl border-border/50 hover:border-primary/40 hover:shadow-xl transition-all duration-200 group flex flex-col justify-between overflow-hidden bg-card/60 hover:bg-card">
                <IslamicPattern className="absolute -right-16 -bottom-16 w-64 h-64 text-primary group-hover:scale-110 transition-transform duration-300 pointer-events-none" opacity={0.03} />
                <CardHeader className="pb-3 relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${tool.bg} transition-transform group-hover:scale-110 duration-200`}>
                      <Icon className={`w-6 h-6 ${tool.color}`} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-secondary border border-border/60 text-muted-foreground">
                      {tool.badge}
                    </span>
                  </div>
                  <CardTitle className="text-base font-bold text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
                    <span>{tool.title}</span>
                    <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 relative z-10">
                  <CardDescription className="text-xs text-muted-foreground leading-relaxed mb-4">
                    {tool.description}
                  </CardDescription>
                  <div className="flex items-center text-xs font-bold text-primary group-hover:translate-x-1 transition-transform">
                    Launch Tool <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
