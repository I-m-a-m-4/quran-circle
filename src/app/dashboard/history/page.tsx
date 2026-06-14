'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, BookOpen, Clock, ArrowLeft, Calendar, Flame } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';

interface ActivityRecord {
  id: string;
  verseKey: string;
  surahName: string;
  timestamp: string;
  duration: number;
}

function getRelativeDateStr(timestamp: string): string {
  const diffTime = Date.now() - new Date(timestamp).getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} days ago`;
}

function getFormattedDate(timestamp: string): string {
  return new Date(timestamp).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function getFormattedTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalMinutes, setTotalMinutes] = useState(0);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchHistory = async () => {
      try {
        const activitiesRef = collection(db, 'activities');
        const q = query(
          activitiesRef,
          where('email', '==', user.email?.toLowerCase()),
          orderBy('timestamp', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const list = querySnapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        })) as ActivityRecord[];
        
        setActivities(list);
        setTotalMinutes(list.reduce((sum: number, a: any) => sum + (a.duration || 5), 0));
      } catch (err) {
        console.error("Failed to fetch history:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [user, authLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard" 
          className="w-9 h-9 rounded-lg border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Session History</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{activities.length} sessions · {totalMinutes} minutes read</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="glass-panel border-none">
          <CardContent className="p-4 flex flex-col items-center gap-1">
            <BookOpen className="w-5 h-5 text-primary" />
            <span className="text-xl font-extrabold text-foreground">{activities.length}</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Sessions</span>
          </CardContent>
        </Card>
        <Card className="glass-panel border-none">
          <CardContent className="p-4 flex flex-col items-center gap-1">
            <Clock className="w-5 h-5 text-primary" />
            <span className="text-xl font-extrabold text-foreground">{totalMinutes}</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Minutes</span>
          </CardContent>
        </Card>
        <Card className="glass-panel border-none">
          <CardContent className="p-4 flex flex-col items-center gap-1">
            <Flame className="w-5 h-5 text-primary" />
            <span className="text-xl font-extrabold text-foreground">
              {activities.filter(a => {
                const d = Math.floor((Date.now() - new Date(a.timestamp).getTime()) / 86400000);
                return d < 7;
              }).length}
            </span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">This Week</span>
          </CardContent>
        </Card>
      </div>

      {/* Activity List */}
      {activities.length === 0 ? (
        <Card className="glass-panel border-none">
          <CardContent className="p-12 text-center space-y-3">
            <BookOpen className="w-10 h-10 text-muted-foreground mx-auto" />
            <p className="font-bold text-foreground">No sessions yet</p>
            <p className="text-sm text-muted-foreground">Complete your first session to see your history here.</p>
            <Link href="/dashboard/session" className="inline-block mt-4 px-6 py-2.5 bg-primary text-black rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors">
              Start a Session
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {activities.map((activity, i) => (
            <Link 
              key={activity.id || i}
              href={`/dashboard/session?verse=${encodeURIComponent(activity.verseKey)}`}
            >
              <Card className="glass-panel border-none hover:border hover:border-primary/20 hover:shadow-md transition-all duration-200 cursor-pointer group">
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
                          {activity.surahName}
                        </span>
                        <span className="text-[10px] font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded shrink-0">
                          {activity.verseKey}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="font-bold">{getRelativeDateStr(activity.timestamp)}</span>
                        <span className="text-border">·</span>
                        <span>{getFormattedDate(activity.timestamp)}</span>
                        <span className="text-border">·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {activity.duration || 5} min
                        </span>
                      </div>
                    </div>

                    {/* Arrow indicator */}
                    <ArrowLeft className="w-4 h-4 text-muted-foreground rotate-180 opacity-0 group-hover:opacity-100 shrink-0 transition-all group-hover:translate-x-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
