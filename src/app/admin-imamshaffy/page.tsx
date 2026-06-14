'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, Clock, Flame, ShieldAlert, CheckCircle2, AlertCircle, ArrowLeft, Loader2, Send } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, updateDoc, doc, arrayUnion } from 'firebase/firestore';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  username: string;
  streak: number;
  completedToday: boolean;
  avatar: string;
  receivedNudges?: string[];
}

interface PostRecord {
  id: string;
  userName: string;
  userAvatar: string;
  content: string;
  verseKey: string;
  timestamp: string;
  email: string;
}

export default function AdminPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [posts, setPosts] = useState<PostRecord[]>([]);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [nudgeLoading, setNudgeLoading] = useState<Record<string, boolean>>({});

  const isAdmin = user?.email?.toLowerCase() === 'belloimam431@gmail.com';

  useEffect(() => {
    if (authLoading) return;
    if (!user || !isAdmin) {
      return; // Handled by UI warning
    }

    const fetchData = async () => {
      try {
        setIsLoadingData(true);
        
        // 1. Fetch Users
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersList = usersSnapshot.docs.map(d => ({
          id: d.id,
          ...d.data()
        })) as UserRecord[];
        setUsers(usersList);

        // 2. Fetch Posts
        const postsSnapshot = await getDocs(collection(db, 'posts'));
        const postsList = postsSnapshot.docs.map(d => ({
          id: d.id,
          ...d.data()
        })) as PostRecord[];
        // Sort by timestamp desc
        postsList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setPosts(postsList);

        // 3. Fetch Activities to compute total minutes
        const activitiesSnapshot = await getDocs(collection(db, 'activities'));
        let mins = 0;
        activitiesSnapshot.docs.forEach(docSnap => {
          const act = docSnap.data();
          if (act.activityType === 'session') {
            mins += Number(act.duration || 5);
          }
        });
        setTotalMinutes(mins);

      } catch (err) {
        console.error("Failed to load admin stats:", err);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, [user, isAdmin, authLoading]);

  // Send a nudge directly via Firestore updates
  const handleNudge = async (targetUserId: string, targetUsername: string) => {
    if (nudgeLoading[targetUserId]) return;
    setNudgeLoading(prev => ({ ...prev, [targetUserId]: true }));
    try {
      const targetUserRef = doc(db, 'users', targetUserId);
      await updateDoc(targetUserRef, {
        receivedNudges: arrayUnion(profile?.username || 'admin')
      });
      
      // Update local state to show updated nudge list
      setUsers(prev => prev.map(u => {
        if (u.id === targetUserId) {
          return {
            ...u,
            receivedNudges: [...(u.receivedNudges || []), (profile?.username || 'admin')]
          };
        }
        return u;
      }));
    } catch (err) {
      console.error("Failed to nudge user:", err);
    } finally {
      setNudgeLoading(prev => ({ ...prev, [targetUserId]: false }));
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  // Unauthorized page view
  if (!user || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <Card className="max-w-md w-full glass-panel border-none p-8 space-y-6 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(239,68,68,0.1)]">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Access Denied</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              This area is restricted to authorized personnel. Only the chief Imam account has permission to access the Imam Shaffy admin control system.
            </p>
          </div>
          <div className="pt-2">
            <Button 
              onClick={() => router.push('/dashboard')}
              className="w-full h-11 bg-primary text-black font-bold hover:bg-primary/90 rounded-lg flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-primary uppercase tracking-[0.2em] bg-primary/10 px-2.5 py-0.5 rounded">
              Secure Imam Console
            </span>
            <span className="text-xs text-green-500 font-extrabold uppercase tracking-wider bg-green-500/10 px-2 py-0.5 rounded flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Root Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">Imam Shaffy Control</h1>
        </div>
        <Button 
          variant="outline" 
          onClick={() => router.push('/dashboard')}
          className="text-xs font-bold uppercase tracking-widest gap-2 h-10 px-4 rounded-lg text-foreground hover:bg-black/5 dark:hover:bg-white/5 border border-border"
        >
          <ArrowLeft className="w-4 h-4" /> Dashboard View
        </Button>
      </div>

      {isLoadingData ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="glass-panel border-none">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10 text-primary">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Students</p>
                  <p className="text-2xl font-extrabold text-foreground">{users.length}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-panel border-none">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10 text-primary">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Reflections Shared</p>
                  <p className="text-2xl font-extrabold text-foreground">{posts.length}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-panel border-none">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10 text-primary">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Minutes Read</p>
                  <p className="text-2xl font-extrabold text-foreground">{totalMinutes}m</p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-panel border-none">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10 text-primary">
                  <Flame className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Avg Streak</p>
                  <p className="text-2xl font-extrabold text-foreground">
                    {users.length > 0 
                      ? Math.round(users.reduce((acc, u) => acc + (u.streak || 0), 0) / users.length) 
                      : 0} Days
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* User Directory Column */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between pb-2">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" /> Active Quran Circle Members
                </h2>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">
                  {users.filter(u => u.completedToday).length}/{users.length} Completed Today
                </span>
              </div>

              <div className="space-y-4">
                {users.map(u => {
                  const hasNudge = u.receivedNudges?.includes(profile?.username || 'admin');
                  return (
                    <Card key={u.id} className="glass-panel border-none overflow-hidden hover:translate-y-[-1px] transition-all duration-300">
                      <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={u.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${u.username}`} 
                            alt={u.name}
                            className="w-11 h-11 rounded-full border border-border bg-card p-0.5 shrink-0" 
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-foreground">{u.name}</p>
                              <span className={`text-[9px] uppercase tracking-widest font-extrabold px-1.5 py-0.5 rounded ${
                                u.completedToday ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                              }`}>
                                {u.completedToday ? 'Completed' : 'Pending'}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">@{u.username} • {u.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-border/40 pt-3 sm:pt-0">
                          <div className="flex items-center gap-1.5 bg-orange-500/10 text-orange-500 px-3 py-1 rounded-full text-xs font-extrabold">
                            <Flame className="w-3.5 h-3.5 fill-current" /> {u.streak || 0}
                          </div>
                          
                          {u.completedToday ? (
                            <span className="text-xs text-green-500 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4" /> Good work
                            </span>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleNudge(u.id, u.username)}
                              disabled={hasNudge || nudgeLoading[u.id]}
                              className={`h-9 px-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                                hasNudge 
                                  ? 'text-muted-foreground border-border bg-transparent' 
                                  : 'text-primary border-primary/20 hover:border-primary/50 bg-primary/5 hover:bg-primary/10'
                              }`}
                            >
                              {nudgeLoading[u.id] ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <>
                                  <Send className="w-3 h-3" /> {hasNudge ? 'Nudged' : 'Nudge'}
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Recent Reflections Column */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" /> Recent Reflection Logs
              </h2>
              
              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                {posts.length === 0 ? (
                  <Card className="glass-panel border-none p-6 text-center text-muted-foreground text-xs">
                    No reflections logged yet.
                  </Card>
                ) : (
                  posts.map(p => (
                    <Card key={p.id} className="glass-panel border-none hover:shadow-md transition-all duration-300">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center gap-2 border-b border-border/40 pb-2">
                          <img 
                            src={p.userAvatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=bello`}
                            alt={p.userName}
                            className="w-6 h-6 rounded-full border border-border" 
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-foreground truncate">{p.userName}</p>
                          </div>
                          <span className="text-[9px] font-mono text-muted-foreground uppercase bg-primary/10 text-primary px-1.5 py-0.5 rounded shrink-0">
                            {p.verseKey}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground italic leading-relaxed">
                          "{p.content}"
                        </p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
}
