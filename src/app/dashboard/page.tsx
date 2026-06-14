'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Zap, Target, ArrowRight, Play, CheckCircle2, Clock, Loader2, Calendar, Inbox, BookOpen, Users } from 'lucide-react';
import Link from 'next/link';
import { getSurahName } from '@/lib/quran-api';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';

// Returns the audio URL for a given verse key and reciter
function getAudioUrl(verseKey: string, reciter: string = 'Alafasy_128kbps') {
  if (!verseKey) return "";
  const [chapter, v] = verseKey.split(':');
  return `https://everyayah.com/data/${reciter}/${chapter.padStart(3, '0')}${v.padStart(3, '0')}.mp3`;
}

export default function DashboardPage() {
  const { user, profile, loading: authLoading } = useAuth();
  
  // Audio playback state for inspired verses
  const [playingVerseKey, setPlayingVerseKey] = useState<string | null>(null);
  const [reciter, setReciter] = useState('Alafasy_128kbps');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlayToggle = (verseKey: string) => {
    if (!audioRef.current) return;
    if (playingVerseKey === verseKey) {
      if (audioRef.current.paused) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
        setPlayingVerseKey(null);
      }
    } else {
      setPlayingVerseKey(verseKey);
      audioRef.current.src = getAudioUrl(verseKey, reciter);
      audioRef.current.load();
      audioRef.current.play().catch(() => {
        setPlayingVerseKey(null);
      });
    }
  };

  const [userData, setUserData] = useState<any>({
    name: 'Bello Imam',
    niyyah: 'Spiritual Consistency',
    streak: 0,
    dailyVerse: '',
    dailyTranslation: ''
  });
  const [extraVerses, setExtraVerses] = useState<any[]>([]);
  const [circleData, setCircleData] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [translationId, setTranslationId] = useState(131);

  // Independent loading states
  const [isDailyVerseLoading, setIsDailyVerseLoading] = useState(true);
  const [isCircleLoading, setIsCircleLoading] = useState(true);
  const [isExtraVersesLoading, setIsExtraVersesLoading] = useState(true);
  const [isActivitiesLoading, setIsActivitiesLoading] = useState(true);

  function getRelativeDateStr(timestamp: string): string {
    const diffTime = Date.now() - new Date(timestamp).getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
  }

  useEffect(() => {
    const savedTransId = localStorage.getItem('preferredTranslationId');
    if (savedTransId) setTranslationId(parseInt(savedTransId));
    const handleTranslationChange = (e: CustomEvent) => {
      setTranslationId(e.detail.translationId);
    };
    window.addEventListener('translationChanged', handleTranslationChange as EventListener);
    return () => window.removeEventListener('translationChanged', handleTranslationChange as EventListener);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !profile) return;

    // Populate initial local data immediately
    setUserData((prev: any) => ({
      ...prev,
      name: profile.name,
      niyyah: profile.niyyah || 'Spiritual Consistency',
      streak: profile.streak || 0
    }));

    // 1. Fetch Circle Data (real-time Firestore)
    const circleUsernames = [profile.username, ...(profile.circleMembers || [])];
    const usersQuery = query(collection(db, 'users'), where('username', 'in', circleUsernames));
    
    const unsubscribeCircle = onSnapshot(usersQuery, (snapshot) => {
      const circleUsers = snapshot.docs.map(doc => {
        const u = doc.data();
        return {
          id: u.id,
          name: u.name,
          email: u.email,
          username: u.username,
          streak: u.streak || 0,
          status: u.completedToday ? 'Completed' : 'Pending',
          avatar: u.avatar
        };
      });

      setCircleData({
        name: 'Faith Seekers',
        members: circleUsers,
        completedCount: circleUsers.filter(u => u.status === 'Completed').length,
        membersCount: circleUsers.length
      });
      setIsCircleLoading(false);
    }, (err) => {
      console.error("Circle fetch error:", err);
      setIsCircleLoading(false);
    });

    // 2. Fetch Activities (real-time Firestore)
    const activitiesQuery = query(
      collection(db, 'activities'),
      where('email', '==', user.email?.toLowerCase()),
      orderBy('timestamp', 'desc'),
      limit(20)
    );

    const unsubscribeActivities = onSnapshot(activitiesQuery, (snapshot) => {
      const acts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setActivities(acts);
      setIsActivitiesLoading(false);
    }, (err) => {
      console.error("Activity fetch error:", err);
      setIsActivitiesLoading(false);
    });

    return () => {
      unsubscribeCircle();
      unsubscribeActivities();
    };
  }, [user, profile, authLoading]);

  useEffect(() => {
    // 3. Fetch Daily Verse (with Caching)
    const todayStr = new Date().toDateString();
    const cachedVerse = localStorage.getItem('cachedDailyVerse');
    const cachedVerseDate = localStorage.getItem('cachedDailyVerseDate');
    const localAIVerse = localStorage.getItem('aiVerse');
    
    let customVerse = null;
    if (localAIVerse) {
      try {
        customVerse = JSON.parse(localAIVerse);
      } catch (e) {}
    }

    if (customVerse) {
      setUserData((prev: any) => ({
        ...prev,
        dailyVerse: customVerse.arabicVerse,
        dailyTranslation: customVerse.translation
      }));
      setIsDailyVerseLoading(false);
    } else if (cachedVerse && cachedVerseDate === todayStr) {
      const parsed = JSON.parse(cachedVerse);
      setUserData((prev: any) => ({
        ...prev,
        dailyVerse: parsed.dailyVerse,
        dailyTranslation: parsed.dailyTranslation
      }));
      setIsDailyVerseLoading(false);
    } else {
      fetch(`/api/quran/verse?translationId=${translationId}`)
        .then(res => res.json())
        .then(data => {
          const arabic = data.text_uthmani || "وَأَقِيمُوا۟ ٱلصَّلَوٰةَ وَءَاتُوا۟ ٱلزَّكَوٰةَ وَٱرْكَعُوا۟ مَعَ ٱلرَّٰكِعِينَ";
          const translation = data.translations?.[0]?.text 
            ? data.translations[0].text.replace(/<[^>]*>/g, '') 
            : "And establish prayer and give zakah and bow with those who bow [in worship and obedience].";
          
          setUserData((prev: any) => ({
            ...prev,
            dailyVerse: arabic,
            dailyTranslation: translation
          }));
          
          localStorage.setItem('cachedDailyVerse', JSON.stringify({ dailyVerse: arabic, dailyTranslation: translation }));
          localStorage.setItem('cachedDailyVerseDate', todayStr);
          setIsDailyVerseLoading(false);
        })
        .catch(err => {
          console.error("Daily verse fetch error:", err);
          setIsDailyVerseLoading(false);
        });
    }

    // 4. Fetch Inspired Verses (with Caching)
    const cachedExtra = localStorage.getItem('cachedExtraVerses');
    const cachedExtraDate = localStorage.getItem('cachedExtraVersesDate');
    if (cachedExtra && cachedExtraDate === todayStr) {
      setExtraVerses(JSON.parse(cachedExtra));
      setIsExtraVersesLoading(false);
    } else {
      fetch(`/api/quran/verses?translationId=${translationId}`)
        .then(res => res.json())
        .then(data => {
          setExtraVerses(data || []);
          localStorage.setItem('cachedExtraVerses', JSON.stringify(data || []));
          localStorage.setItem('cachedExtraVersesDate', todayStr);
          setIsExtraVersesLoading(false);
        })
        .catch(err => {
          console.error("Extra verses fetch error:", err);
          setIsExtraVersesLoading(false);
        });
    }
  }, [translationId]);


  const todayDate = new Date();
  const heatmapDays = Array.from({ length: 84 }).map((_, idx) => {
    const day = new Date();
    day.setDate(todayDate.getDate() - (83 - idx));
    const dayStr = day.toISOString().split('T')[0];
    
    const count = activities.filter(act => {
      const actDate = new Date(act.timestamp).toISOString().split('T')[0];
      return actDate === dayStr;
    }).length;
    
    return { date: dayStr, count };
  });

  // Returns progressively deeper orange based on session count
  // 0 → empty, 1 → faint, 2 → medium, 3 → strong, 4+ → full glow
  function getHeatmapStyle(count: number): string {
    if (count === 0) return 'bg-zinc-200/70 dark:bg-white/5 border border-zinc-300/80 dark:border-white/5';
    if (count === 1) return 'bg-primary/25 border border-transparent';
    if (count === 2) return 'bg-primary/50 border border-transparent';
    if (count === 3) return 'bg-primary/75 border border-transparent shadow-[0_0_8px_rgba(234,88,12,0.3)]';
    return 'bg-primary border border-transparent opacity-100 shadow-[0_0_15px_rgba(234,88,12,0.5)]'; // 4+
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pb-1">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-0.5 text-xs">As-Salamu Alaykum, {userData.name}. Here is your spiritual overview.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-4 py-2 shadow-sm text-sm font-medium">
            <span className="text-muted-foreground">Focusing on:</span>
            <span className="text-foreground">{userData.niyyah}</span>
          </div>
          <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-4 py-2 shadow-sm text-sm font-medium text-foreground">
            <Zap className="w-4 h-4 text-primary fill-primary" />
            {userData.streak} Day Streak
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Main Action Card */}
        <Card className="lg:col-span-2 glass-panel overflow-hidden group relative">
          <CardContent className="p-5 relative">
            {isDailyVerseLoading ? (
              <div className="flex flex-col h-full justify-between gap-6 animate-pulse py-3">
                <div className="space-y-4">
                  <div className="h-5 w-40 bg-secondary rounded" />
                  <div className="h-10 w-full bg-secondary rounded mt-3" />
                  <div className="h-4 w-5/6 bg-secondary rounded mt-2" />
                  <div className="h-4 w-4/6 bg-secondary rounded" />
                </div>
                <div className="flex items-center gap-4 pt-2">
                  <div className="h-12 w-36 bg-secondary rounded" />
                  <div className="h-10 w-24 bg-secondary rounded" />
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full justify-between gap-5">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-secondary border border-border text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Quran Foundation Verified
                    <button
                      onClick={() => handlePlayToggle(userData.dailyVerseKey || '2:255')}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all border border-border ml-2 ${playingVerseKey === (userData.dailyVerseKey || '2:255') ? 'bg-primary text-black scale-105 shadow-[0_0_15px_rgba(234,88,12,0.4)]' : 'bg-background text-muted-foreground hover:text-foreground hover:border-primary/50'}`}
                      title={playingVerseKey === (userData.dailyVerseKey || '2:255') ? 'Pause recitation' : 'Play recitation'}
                    >
                      {playingVerseKey === (userData.dailyVerseKey || '2:255') ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><polygon points="5,3 19,12 5,21 5,3"/></svg>
                      )}
                    </button>
                  </div>
                  <h2 className="text-xl md:text-2xl font-semibold text-foreground leading-relaxed quran-text text-right mt-2" dir="rtl">{userData.dailyVerse}</h2>
                  {userData.dailyTranslation && (
                    <p className="text-muted-foreground font-medium italic mt-2 w-full">"{userData.dailyTranslation}"</p>
                  )}
                </div>
                
                <div className="flex items-center gap-6">
                  <Link href="/dashboard/session">
                    <Button size="lg" className="h-12 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 px-8 font-bold text-md shadow-sm transition-all">
                      <Play className="mr-2 w-4 h-4 fill-current" /> Start Session
                    </Button>
                  </Link>
                </div>

              </div>
            )}
          </CardContent>
        </Card>

        {/* Circle Card */}
        <Card className="glass-panel relative overflow-hidden group">
          <CardContent className="p-5 h-full flex flex-col justify-between">
            {isCircleLoading ? (
              <div className="animate-pulse space-y-4 py-1">
                <div className="flex justify-between items-center pb-3 border-b border-border">
                  <div className="h-4 w-28 bg-secondary rounded" />
                  <div className="h-3 w-16 bg-secondary rounded" />
                </div>
                <div className="space-y-3 pt-1">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-secondary" />
                        <div className="h-3.5 w-24 bg-secondary rounded" />
                      </div>
                      <div className="h-3.5 w-12 bg-secondary rounded" />
                    </div>
                  ))}
                </div>
              </div>
            ) : circleData && (
              <div className="flex flex-col h-full justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary animate-pulse" />
                      <h3 className="font-bold text-foreground text-sm">{circleData.name}</h3>
                    </div>
                    <span className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-wider">
                      {circleData.completedCount} of {circleData.membersCount} done
                    </span>
                  </div>

                  {circleData.membersCount <= 1 ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">Solo Journey</p>
                        <p className="text-[10px] text-muted-foreground max-w-xs mt-1">Add accountability partners in the Circle tab to track consistency together.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {circleData.members.map((member: any) => {
                        const userEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') || '' : '';
                        const isSelf = member.email?.toLowerCase() === userEmail.toLowerCase();
                        return (
                          <div key={member.id} className="flex items-center justify-between opacity-90 hover:opacity-100 transition-opacity">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center relative">
                                <img src={member.avatar} className="w-full h-full rounded-full object-cover" />
                                {member.status === 'Completed' && (
                                  <div className="absolute -bottom-0.5 -right-0.5 bg-green-500 rounded-full border border-background p-0.5">
                                    <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <span className="text-xs font-bold text-foreground block leading-tight">{member.name}{isSelf ? ' (You)' : ''}</span>
                                <span className="text-[8px] text-muted-foreground">@{member.username}</span>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded shrink-0">{member.streak}d streak</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            <Link href="/dashboard/circle" className="block w-full border-t border-border pt-4 mt-auto">
              <Button variant="ghost" className="w-full text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 text-xs font-bold uppercase tracking-widest gap-2 rounded-lg h-9">
                Circle Details <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Dynamic Growth Map & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Consistency Heatmap */}
        <Card className="lg:col-span-2 glass-panel border-none">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-border">
              <div className="flex items-center gap-2 text-foreground font-bold">
                <Calendar className="w-5 h-5 text-primary" />
                <span>Consistency Heatmap</span>
              </div>
              <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Year to date</span>
            </div>
            
            <div className="grid grid-cols-12 md:grid-cols-14 gap-2">
              {heatmapDays.map((day, i) => (
                <div 
                  key={i} 
                  title={`${day.date}: ${day.count} session${day.count !== 1 ? 's' : ''}`}
                  className={`aspect-square rounded-[4px] transition-all hover:scale-125 cursor-default ${getHeatmapStyle(day.count)}`}
                />
              ))}
            </div>
            
            {/* Legend */}
            <div className="mt-6 flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              <span>Less</span>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-[2px] bg-zinc-200/70 dark:bg-white/5 border border-zinc-300/80 dark:border-white/5" title="0 sessions" />
                <div className="w-3 h-3 rounded-[2px] bg-primary/25 border border-transparent" title="1 session" />
                <div className="w-3 h-3 rounded-[2px] bg-primary/50 border border-transparent" title="2 sessions" />
                <div className="w-3 h-3 rounded-[2px] bg-primary/75 border border-transparent shadow-[0_0_8px_rgba(234,88,12,0.3)]" title="3 sessions" />
                <div className="w-3 h-3 rounded-[2px] bg-primary border border-transparent shadow-[0_0_15px_rgba(234,88,12,0.5)]" title="4+ sessions" />
              </div>
              <span>More</span>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="glass-panel border-none flex flex-col h-full justify-between">
          <CardContent className="p-6 flex flex-col h-full space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-border">
              <span className="text-sm font-bold text-foreground">Recent Activity</span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{activities.length} sessions</span>
            </div>
            
            <div className="space-y-2 overflow-y-auto flex-1 max-h-[220px]">
              {activities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center space-y-2">
                  <Inbox className="w-8 h-8 text-muted-foreground animate-pulse" />
                  <p className="text-xs font-bold text-foreground">No recent activity</p>
                  <p className="text-[10px] text-muted-foreground">Start your first session to track progress.</p>
                </div>
              ) : (
                activities.slice(0, 5).map((item, i) => (
                  <Link 
                    key={item.id || i} 
                    href={`/dashboard/session?verse=${encodeURIComponent(item.verseKey)}`}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-primary/5 border border-transparent hover:border-primary/10 transition-all group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                      <BookOpen className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">{item.surahName}</span>
                        <span className="text-[10px] font-mono font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded shrink-0">{item.verseKey}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-medium">{getRelativeDateStr(item.timestamp)}</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
            
            <Link href="/dashboard/history" className="block w-full border-t border-border pt-3 mt-auto">
              <button className="w-full text-xs font-bold text-muted-foreground hover:text-foreground transition-all uppercase tracking-widest flex items-center justify-center gap-2 group">
                View All History <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* 5 Dynamic Verses Section */}
      {/* Inspired Verses for Reflection with audio and fallback translation */}
      {extraVerses && extraVerses.length > 0 && (
        <section className="space-y-4 pt-4">
          <div>
            <h2 className="text-xl font-bold text-foreground tracking-tight">Inspired Verses for Reflection</h2>
            <p className="text-muted-foreground text-xs mt-1">A curated flow of verses synced dynamically from the Quran Foundation API to guide your daily contemplation.</p>
          </div>
          {/* Hidden audio element for playback */}
          <audio 
            ref={audioRef} 
            onEnded={() => setPlayingVerseKey(null)}
            style={{ display: 'none' }}
          />
          <div className="grid grid-cols-1 gap-3">
            {extraVerses.slice(0, 2).map((verse, idx) => {
              // Find the first translation with text
              const translationObj = verse.translations && Array.isArray(verse.translations)
                ? verse.translations.find((t: any) => t && t.text)
                : null;
              // Fallback translation (example, can be improved)
              const fallbackTranslation =
                verse.verse_key === '2:153' ? 'O you who have believed, seek help through patience and prayer. Indeed, Allah is with the patient.' :
                verse.verse_key === '3:134' ? 'Who give, both in prosperity and adversity, who restrain their anger and pardon people—God loves those who do good.' :
                null;
              const translationText = translationObj?.text || fallbackTranslation;
              // If no translation, do not show the card
              if (!translationText) return null;
              return (
                <Card key={verse.verse_key || idx} className="glass-panel hover:shadow-md transition-all duration-300 flex flex-col justify-between">
                  <CardContent className="p-4 space-y-3 flex flex-col justify-between h-full">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-extrabold text-primary uppercase tracking-wider bg-primary/10 px-1.5 py-0.5 rounded">
                        {getSurahName(verse.verse_key)} {verse.verse_key}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-medium">
                        Verse {verse.id}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        onClick={() => handlePlayToggle(verse.verse_key)}
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all border border-border ${playingVerseKey === verse.verse_key ? 'bg-primary text-black scale-105 shadow-[0_0_15px_rgba(234,88,12,0.4)]' : 'bg-background text-muted-foreground hover:text-foreground hover:border-primary/50'}`}
                        title={playingVerseKey === verse.verse_key ? 'Pause recitation' : 'Play recitation'}
                      >
                        {playingVerseKey === verse.verse_key ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><polygon points="5,3 19,12 5,21 5,3"/></svg>
                        )}
                      </button>
                    </div>
                    <p className="quran-text text-sm md:text-base font-normal text-foreground text-right leading-loose py-2" dir="rtl">
                      {verse.text_uthmani}
                    </p>
                    <div className="border-t border-border/50 pt-2 mt-auto">
                      <p 
                        className="text-muted-foreground text-[11px] md:text-xs font-medium italic leading-relaxed"
                        dangerouslySetInnerHTML={{ 
                          __html: translationText
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

