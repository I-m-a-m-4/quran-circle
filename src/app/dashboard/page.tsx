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
    async function fetchData() {
      try {
        const [streakRes, verseRes] = await Promise.all([
          fetch('/api/user/streak').then(res => res.json()),
          fetch('/api/quran/verse').then(res => res.json())
        ]);

        const localNiyyah = localStorage.getItem('userNiyyah');
        const localAIVerse = localStorage.getItem('aiVerse');
        
        let customVerse = null;
        if (localAIVerse) {
            try {
                customVerse = JSON.parse(localAIVerse);
            } catch (e) {}
        }

        setUserData({
          name: 'Abdullah', // Still mocked until Auth is integrated
          niyyah: localNiyyah || 'Spiritual Consistency',
          streak: streakRes.streak || 0,
          dailyVerse: customVerse?.arabicVerse || verseRes.text_uthmani || "Seek help through patience and prayer.",
          dailyTranslation: customVerse?.translation || "",
          circle: {
            name: 'Faith Seekers',
            membersCount: 4,
            completedCount: 2
          }
        });
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        
        const localNiyyah = localStorage.getItem('userNiyyah');
        const localAIVerse = localStorage.getItem('aiVerse');
        let customVerse = null;
        if (localAIVerse) {
            try {
                customVerse = JSON.parse(localAIVerse);
            } catch (e) {}
        }

        setUserData({
          name: 'Abdullah',
          niyyah: localNiyyah || 'Spiritual Consistency',
          streak: 5,
          dailyVerse: customVerse?.arabicVerse || "Seek help through patience and prayer.",
          dailyTranslation: customVerse?.translation || "",
          circle: {
            name: 'Faith Seekers',
            membersCount: 4,
            completedCount: 2
          }
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
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
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm">As-Salamu Alaykum, {userData.name}. Here is your spiritual overview.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-4 py-2 shadow-sm text-sm font-medium">
            <span className="text-muted-foreground">Niyyah:</span>
            <span className="text-foreground">{userData.niyyah}</span>
          </div>
          <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-4 py-2 shadow-sm text-sm font-medium text-foreground">
            <Zap className="w-4 h-4 text-primary fill-primary" />
            {userData.streak} Day Streak
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Action Card */}
        <Card className="lg:col-span-2 glass-panel overflow-hidden group relative">
          <CardContent className="p-8 relative">
            <div className="flex flex-col h-full justify-between gap-8">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-secondary border border-border text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Quran Foundation Verified
                </div>
                <h2 className="text-3xl font-bold text-foreground max-w-md leading-tight quran-text">"{userData.dailyVerse}"</h2>
                {userData.dailyTranslation && (
                  <p className="text-muted-foreground max-w-sm font-medium italic mt-2">"{userData.dailyTranslation}"</p>
                )}
                <p className="text-muted-foreground max-w-sm font-medium mt-4">Your daily session is ready. Take 5 minutes to ground your soul before you start your afternoon.</p>
              </div>
              
              <div className="flex items-center gap-6">
                <Link href="/dashboard/session">
                  <Button size="lg" className="h-12 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 px-8 font-bold text-md shadow-sm transition-all">
                    <Play className="mr-2 w-4 h-4 fill-current" /> Start Session
                  </Button>
                </Link>
                <div className="flex items-center gap-2 text-muted-foreground text-sm font-bold bg-background px-4 py-2 rounded-lg border border-border">
                  <Clock className="w-4 h-4" />
                  <span>5 mins</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Circle Card */}
        <Card className="glass-panel relative overflow-hidden group">
          <CardContent className="p-6 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-foreground text-lg">{userData.circle.name}</h3>
                </div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{userData.circle.completedCount} of {userData.circle.membersCount} done</span>
              </div>

              <div className="space-y-5">
                {[...Array(userData.circle.membersCount)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between opacity-80 hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-background border border-border flex items-center justify-center relative">
                        <img src={`https://picsum.photos/seed/${i + 10}/100/100`} className="w-full h-full rounded-full" />
                        {i < userData.circle.completedCount && (
                          <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full border-2 border-background p-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </div>
                      <span className="text-sm font-bold text-foreground">{['Abdullah (You)', 'Sarah', 'Omar', 'Fatima'][i]}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Link href="/dashboard/circle" className="block w-full mt-8">
              <Button variant="ghost" className="w-full text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 text-xs font-bold uppercase tracking-widest gap-2 rounded-lg">
                Circle Details <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>


    </div>
  );
}
