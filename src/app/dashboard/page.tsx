'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Zap, Target, ArrowRight, Play, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In production, this would fetch from a real backend session
    // For the hackathon hack, we simulate the production feel
    setTimeout(() => {
      setUserData({
        name: 'Abdullah',
        niyyah: 'Spiritual Consistency',
        streak: 5,
        circle: {
          name: 'Faith Seekers',
          membersCount: 4,
          completedCount: 2
        }
      });
      setIsLoading(false);
    }, 1000);
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-gray-500 font-medium">Synchronizing with Quran API...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">As-Salamu Alaykum, {userData.name}</h1>
          <p className="text-gray-500">Active Niyyah: <span className="text-primary font-bold">{userData.niyyah}</span></p>
        </div>
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-5 py-2.5 shadow-xl shadow-primary/5 group hover:bg-white/10 transition-all cursor-pointer">
          <Zap className="w-5 h-5 text-primary fill-primary group-hover:scale-110 transition-transform" />
          <span className="text-base font-bold text-white tracking-tight">{userData.streak} Day Streak</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Action Card */}
        <Card className="lg:col-span-2 glass-panel overflow-hidden border-none group relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-transparent opacity-50" />
          <CardContent className="p-8 relative">
            <div className="flex flex-col h-full justify-between gap-8">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-[10px] font-bold text-primary uppercase tracking-widest">
                  Quran Foundation Verified
                </div>
                <h2 className="text-3xl font-bold text-white max-w-md leading-tight">"Seek help through patience and prayer."</h2>
                <p className="text-gray-400 max-w-sm font-medium">Your daily session is ready. Take 5 minutes to ground your soul before you start your afternoon.</p>
              </div>
              
              <div className="flex items-center gap-6">
                <Link href="/dashboard/session">
                  <Button size="lg" className="h-14 rounded-full bg-primary text-black hover:bg-primary/90 px-10 font-bold text-lg shadow-lg shadow-primary/20 transition-all active:scale-95">
                    <Play className="mr-2 w-5 h-5 fill-current" /> Start Session
                  </Button>
                </Link>
                <div className="flex items-center gap-2 text-gray-500 text-sm font-bold bg-white/5 px-4 py-2 rounded-full border border-white/5">
                  <Clock className="w-4 h-4" />
                  <span>5 mins</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Circle Card */}
        <Card className="glass-panel border-none relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -z-10 group-hover:bg-primary/10 transition-colors" />
          <CardContent className="p-6 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-white text-lg">{userData.circle.name}</h3>
                </div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{userData.circle.completedCount} of {userData.circle.membersCount} done</span>
              </div>

              <div className="space-y-5">
                {[...Array(userData.circle.membersCount)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between opacity-80 hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center relative">
                        <img src={`https://picsum.photos/seed/${i + 10}/100/100`} className="w-full h-full rounded-full" />
                        {i < userData.circle.completedCount && (
                          <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full border-2 border-black p-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </div>
                      <span className="text-sm font-bold text-gray-300">{['Abdullah (You)', 'Sarah', 'Omar', 'Fatima'][i]}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Link href="/dashboard/circle" className="block w-full mt-8">
              <Button variant="ghost" className="w-full text-gray-500 hover:text-white hover:bg-white/5 text-xs font-bold uppercase tracking-widest gap-2">
                Circle Details <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Progress Quick View */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-8 rounded-3xl group cursor-pointer hover:border-primary/30 transition-all border border-transparent">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mb-4">Consistency Score</p>
          <div className="flex items-end gap-3">
            <span className="text-5xl font-extrabold text-white tracking-tighter">85%</span>
            <span className="text-sm text-green-500 font-bold mb-1.5">+5% <ArrowRight className="inline w-3 h-3 rotate-[-45deg]" /></span>
          </div>
        </div>
        <div className="glass-panel p-8 rounded-3xl group cursor-pointer hover:border-primary/30 transition-all border border-transparent">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mb-4">Reflections Logged</p>
          <div className="flex items-end gap-3">
            <span className="text-5xl font-extrabold text-white tracking-tighter">24</span>
            <span className="text-sm text-gray-500 font-bold mb-1.5 underline underline-offset-4">View History</span>
          </div>
        </div>
        <div className="glass-panel p-8 rounded-3xl group cursor-pointer hover:border-primary/30 transition-all border border-transparent">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mb-4">Ramadan Goal</p>
          <p className="text-xl font-bold text-white line-clamp-1 group-hover:text-primary transition-colors">Daily Al-Baqarah Tafsir</p>
          <p className="text-xs text-gray-600 font-bold mt-2">12 Days Remaining</p>
        </div>
      </section>
    </div>
  );
}
