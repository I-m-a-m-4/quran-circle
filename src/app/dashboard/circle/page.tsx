'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  MessageSquare, 
  Settings, 
  Share2, 
  CheckCircle2, 
  History,
  Zap,
  ArrowRight,
  TrendingUp,
  Inbox,
  BellRing,
  UserPlus,
  X,
  Send,
  Sparkles,
  Info
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { collection, query, where, doc, getDocs, updateDoc, onSnapshot, orderBy, limit, addDoc } from 'firebase/firestore';

const SURAH_NAMES: Record<number, string> = {
  1: "Al-Fatihah", 2: "Al-Baqarah", 3: "Al-Imran", 4: "An-Nisa", 5: "Al-Ma'idah",
  6: "Al-An'am", 7: "Al-A'raf", 8: "Al-Anfal", 9: "At-Tawbah", 10: "Yunus",
  11: "Hud", 12: "Yusuf", 13: "Ar-Ra'd", 14: "Ibrahim", 15: "Al-Hijr",
  16: "An-Nahl", 17: "Al-Isra", 18: "Al-Kahf", 19: "Maryam", 20: "Ta-Ha",
  21: "Al-Anbiya", 22: "Al-Hajj", 23: "Al-Mu'minun", 24: "An-Nur", 25: "Al-Furqan",
  26: "Ash-Shu'ara", 27: "An-Naml", 28: "Al-Qasas", 29: "Al-Ankabut", 30: "Ar-Rum",
  31: "Luqman", 32: "As-Sajdah", 33: "Al-Ahzab", 34: "Saba", 35: "Fatir",
  36: "Ya-Sin", 37: "As-Saffat", 38: "Sad", 39: "Az-Zumar", 40: "Ghafir",
  41: "Fussilat", 42: "Ash-Shura", 43: "Az-Zukhruf", 44: "Ad-Dukhan", 45: "Al-Jathiyah",
  46: "Al-Ahqaf", 47: "Muhammad", 48: "Al-Fath", 49: "Al-Hujurat", 50: "Qaf",
  51: "Adh-Dhariyat", 52: "At-Tur", 53: "An-Najm", 54: "Al-Qamar", 55: "Ar-Rahman",
  56: "Al-Waqi'ah", 57: "Al-Hadid", 58: "Al-Mujadilah", 59: "Al-Hashr", 60: "Al-Mumtahanah",
  61: "As-Saff", 62: "Al-Jumu'ah", 63: "Al-Munafiqun", 64: "At-Taghabun", 65: "At-Talaq",
  66: "At-Tahrim", 67: "Al-Mulk", 68: "Al-Qalam", 69: "Al-Haqqah", 70: "Al-Ma'arij",
  71: "Nuh", 72: "Al-Jinn", 73: "Al-Muzzammil", 74: "Al-Muddaththir", 75: "Al-Qiyamah",
  76: "Al-Insan", 77: "Al-Mursalat", 78: "An-Naba", 79: "An-Nazi'at", 80: "Abasa",
  81: "At-Takwir", 82: "Al-Infitar", 83: "Al-Mutaffifin", 84: "Al-Inshiqaq", 85: "Al-Buruj",
  86: "At-Tariq", 87: "Al-A'la", 88: "Al-Ghashiyah", 89: "Al-Fajr", 90: "Al-Balad",
  91: "Ash-Shams", 92: "Al-Layl", 93: "Ad-Duha", 94: "Ash-Sharh", 95: "At-Tin",
  96: "Al-Alaq", 97: "Al-Qadr", 98: "Al-Bayyinah", 99: "Al-Zalzalah", 100: "Al-Adiyat",
  101: "Al-Qari'ah", 102: "At-Takathur", 103: "Al-Asr", 104: "Al-Humazah", 105: "Al-Fil",
  106: "Quraysh", 107: "Al-Ma'un", 108: "Al-Kawthar", 109: "Al-Kafirun", 110: "An-Nasr",
  111: "Al-Masad", 112: "Al-Ikhlas", 113: "Al-Falaq", 114: "An-Nas"
};

function getSurahName(verseKey: string): string {
  if (!verseKey) return "";
  const num = parseInt(verseKey.split(':')[0]);
  return SURAH_NAMES[num] || `Surah ${num}`;
}

export default function CirclePage() {
  const { user, profile, loading: authLoading } = useAuth();
  
  const [members, setMembers] = useState<any[]>([]);
  const [circleName, setCircleName] = useState("Faith Seekers");
  const [membersCount, setMembersCount] = useState(0);
  const [nudgedMembers, setNudgedMembers] = useState<string[]>([]);
  const [receivedNudges, setReceivedNudges] = useState<string[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Chat panel state
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isSendingChat, setIsSendingChat] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Custom dialog/popup alert state instead of window.alert
  const [alertState, setAlertState] = useState<{ show: boolean; title: string; message: string; type: 'success' | 'info' | 'warning' }>({
    show: false,
    title: '',
    message: '',
    type: 'info'
  });

  const triggerAlert = (title: string, message: string, type: 'success' | 'info' | 'warning' = 'info') => {
    setAlertState({ show: true, title, message, type });
  };

  // Add Member form state
  const [addUsernameInput, setAddUsernameInput] = useState("");
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !profile) return;

    setIsLoading(true);

    // Set received nudges initially
    setReceivedNudges(profile.receivedNudges || []);

    // 1. Listen to accountability circle members
    const circleUsernames = [profile.username, ...(profile.circleMembers || [])];
    const usersQuery = query(collection(db, 'users'), where('username', 'in', circleUsernames));
    
    const unsubscribeCircle = onSnapshot(usersQuery, (snapshot) => {
      const circleUsers = snapshot.docs.map(doc => {
        const u = doc.data();
        return {
          id: u.id,
          name: u.name + (u.email?.toLowerCase() === user.email?.toLowerCase() ? " (You)" : ""),
          avatar: u.avatar,
          status: u.completedToday ? 'Completed' : 'Pending',
          streak: u.streak || 0,
          email: u.email,
          username: u.username
        };
      });
      setMembers(circleUsers);
      setMembersCount(circleUsers.length);
      setIsLoading(false);
    }, (err) => {
      console.error("Circle fetch error:", err);
      setIsLoading(false);
    });

    // 2. Listen to reflections (timeline posts) from members
    const postsQuery = query(
      collection(db, 'posts'),
      orderBy('timestamp', 'desc'),
      limit(20)
    );
    const unsubscribeTimeline = onSnapshot(postsQuery, (snapshot) => {
      const formattedTimeline = snapshot.docs.map(docSnap => {
        const post = docSnap.data();
        const timeDiff = Date.now() - new Date(post.timestamp).getTime();
        let timeStr = "Recently";
        const diffMins = Math.floor(timeDiff / (1000 * 60));
        const diffHours = Math.floor(timeDiff / (1000 * 60 * 60));
        const diffDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        
        if (diffMins < 60) {
          timeStr = diffMins <= 1 ? "Just now" : `${diffMins} mins ago`;
        } else if (diffHours < 24) {
          timeStr = `${diffHours} hours ago`;
        } else {
          timeStr = `${diffDays} days ago`;
        }

        return {
          title: `${post.userName}'s Reflection`,
          avatar: post.userAvatar,
          time: timeStr,
          content: `"${post.content}"`,
          verseKey: post.verseKey
        };
      });
      setTimeline(formattedTimeline);
    });

    // 3. Listen to circle chat messages
    const chatQuery = query(collection(db, 'chats'), orderBy('timestamp', 'asc'), limit(50));
    const unsubscribeChat = onSnapshot(chatQuery, (snapshot) => {
      const msgs = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      setChatMessages(msgs);
    });

    return () => {
      unsubscribeCircle();
      unsubscribeTimeline();
      unsubscribeChat();
    };
  }, [user, profile, authLoading]);

  useEffect(() => {
    // Scroll chat to bottom when message arrives
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleNudge = async (targetUsername: string, name: string) => {
    if (nudgedMembers.includes(targetUsername)) return;

    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', targetUsername));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        triggerAlert("Failed to Nudge", "User not found.", "warning");
        return;
      }

      const targetDoc = querySnapshot.docs[0];
      const targetUser = targetDoc.data();
      const currentNudges = targetUser.receivedNudges || [];

      if (!profile) return;
      if (!currentNudges.includes(profile.username)) {
        await updateDoc(doc(db, 'users', targetDoc.id), {
          receivedNudges: [...currentNudges, profile.username]
        });
      }

      setNudgedMembers(prev => [...prev, targetUsername]);
      triggerAlert("Nudge Sent!", `You nudged ${name} to complete their Quran reading session today.`, 'success');
    } catch (err) {
      console.error("Nudge error:", err);
      triggerAlert("Error", "Error sending nudge. Please check connection.", 'warning');
    }
  };

  const handleClearNudges = async () => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        receivedNudges: []
      });
      setReceivedNudges([]);
    } catch (err) {
      console.error("Failed to clear nudges:", err);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError("");
    setAddSuccess("");
    
    const targetUsername = addUsernameInput.trim().toLowerCase();
    if (!targetUsername) {
      setAddError("Please enter a username");
      return;
    }

    if (!user || !profile) return;
    if (targetUsername === profile.username) {
      setAddError("You cannot add yourself to your own circle");
      return;
    }

    if (profile.circleMembers?.includes(targetUsername)) {
      setAddError(`"${targetUsername}" is already in your circle`);
      return;
    }

    setIsAdding(true);
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', targetUsername));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setAddError(`No user found with username "${targetUsername}"`);
        setIsAdding(false);
        return;
      }

      const targetDoc = querySnapshot.docs[0];
      const targetUser = targetDoc.data();

      // Update current user's circleMembers
      await updateDoc(doc(db, 'users', user.uid), {
        circleMembers: [...(profile.circleMembers || []), targetUsername]
      });

      // Update target user's circleMembers (bi-directional circle)
      await updateDoc(doc(db, 'users', targetDoc.id), {
        circleMembers: [...(targetUser.circleMembers || []), profile.username]
      });

      setAddSuccess(`Successfully added ${targetUser.name} to your circle!`);
      setAddUsernameInput("");
      triggerAlert("Success!", `${targetUser.name} added to your Circle successfully.`, 'success');
    } catch (err) {
      console.error("Add member error:", err);
      setAddError("Server error adding member");
    } finally {
      setIsAdding(false);
    }
  };

  const handleShareCircle = () => {
    const activeUsername = profile?.username || user?.email?.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '') || 'bello';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(activeUsername);
      triggerAlert(
        "Copied to Clipboard!",
        `Your username "@${activeUsername}" has been copied! Share this with your friends so they can add you to their circle.`,
        'success'
      );
    } else {
      triggerAlert("Your Username", `Your username is: @${activeUsername}. Share it to invite friends.`, 'info');
    }
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isSendingChat || !user || !profile) return;

    const messageText = chatInput.trim();
    setChatInput("");
    setIsSendingChat(true);

    try {
      await addDoc(collection(db, 'chats'), {
        email: user.email?.toLowerCase(),
        name: profile.name,
        username: profile.username,
        avatar: profile.avatar,
        message: messageText,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error("Chat send error:", err);
    } finally {
      setIsSendingChat(false);
    }
  };


  return (
    <div className="space-y-4 pb-12 animate-in fade-in duration-500">
      
      {/* Custom Popup Alert / Toast Overlay */}
      {alertState.show && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <Card className="max-w-md w-full glass-panel border-none p-6 space-y-4 relative overflow-hidden shadow-2xl">
            <button 
              onClick={() => setAlertState(prev => ({ ...prev, show: false }))}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                alertState.type === 'success' ? 'bg-green-500/10 text-green-500' :
                alertState.type === 'warning' ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'
              }`}>
                <Info className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-foreground">{alertState.title}</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{alertState.message}</p>
            <div className="flex justify-end pt-2">
              <Button 
                onClick={() => setAlertState(prev => ({ ...prev, show: false }))}
                className="h-9 px-4 rounded-lg font-bold text-xs bg-primary text-black hover:bg-primary/90"
              >
                Okay
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Nudge Notification banner */}
      {receivedNudges.length > 0 && (
        <div className="bg-primary/20 border border-primary/40 rounded-xl p-4 flex items-center justify-between shadow-[0_0_15px_rgba(255,196,56,0.1)]">
          <div className="flex items-center gap-3">
            <BellRing className="w-5 h-5 text-primary animate-bounce shrink-0" />
            <div>
              <p className="text-sm font-bold text-foreground">Accountability Nudge!</p>
              <p className="text-xs text-muted-foreground">
                {receivedNudges.map(u => `@${u}`).join(', ')} nudged you to complete your Quran reading session today.
              </p>
            </div>
          </div>
          <button 
            onClick={handleClearNudges}
            className="text-xs font-bold bg-primary text-black px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-all shrink-0"
          >
            Acknowledge & Clear
          </button>
        </div>
      )}

      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pb-3 border-b border-border">
        <div>
          <div className="inline-flex items-center gap-2 mb-1 px-2.5 py-0.5 rounded bg-secondary border border-border text-[10px] font-bold text-muted-foreground tracking-widest uppercase">
            <Users className="w-3 h-3" /> {membersCount} Active Member{membersCount !== 1 ? 's' : ''}
          </div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">{circleName}</h1>
          <p className="text-xs text-muted-foreground font-medium">Your private accountability circle for spiritual consistency.</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleShareCircle}
            variant="outline" 
            className="h-10 px-4 rounded-lg text-foreground hover:bg-black/5 dark:hover:bg-white/5 gap-2 text-xs font-bold"
          >
            <Share2 className="w-4 h-4" /> Share Username
          </Button>
          <Button 
            onClick={() => triggerAlert("Circle Chat Mode", "Use the right chat widget directly to message your accountability group.", 'info')}
            className="h-10 px-4 rounded-lg font-bold gap-2 text-xs"
          >
            <MessageSquare className="w-4 h-4" /> Circle Chat
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Main Members List */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Add Circle Member Card */}
          <Card className="glass-panel border-none p-5">
            <h3 className="text-sm font-bold text-foreground mb-1">Add Member to Circle</h3>
            <p className="text-xs text-muted-foreground mb-4">Add a fellow believer by entering their username (e.g. the email part before @).</p>
            
            <form onSubmit={handleAddMember} className="flex gap-2">
              <div className="relative flex-1">
                <Input 
                  type="text" 
                  placeholder="Enter username (e.g. omar)" 
                  value={addUsernameInput}
                  onChange={(e) => setAddUsernameInput(e.target.value)}
                  className="h-10 bg-background/50 border-border text-xs focus:ring-primary/20"
                />
              </div>
              <Button type="submit" disabled={isAdding} className="h-10 px-4 rounded-lg font-bold text-xs shrink-0">
                {isAdding ? 'Adding...' : <><UserPlus className="w-4 h-4 mr-2" /> Add</>}
              </Button>
            </form>

            {addError && <p className="text-xs font-bold text-red-500 mt-2">{addError}</p>}
            {addSuccess && <p className="text-xs font-bold text-green-500 mt-2">{addSuccess}</p>}
          </Card>

          <h2 className="text-md font-bold text-foreground flex items-center gap-2 pt-2">
            <TrendingUp className="w-4 h-4 text-primary" /> Today's Velocity
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {members.map((member) => (
              <Card key={member.id} className="glass-panel border-none group hover:bg-white/[0.04] transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <Avatar className="w-10 h-10 border border-border group-hover:border-primary/50 transition-all">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback className="bg-primary/20 text-foreground text-xs font-bold">{member.name[0]}</AvatarFallback>
                        </Avatar>
                        {member.status === 'Completed' && (
                          <div className="absolute -bottom-0.5 -right-0.5 bg-green-500 rounded-full border border-background p-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors leading-snug">{member.name}</p>
                        <p className="text-[10px] text-muted-foreground">@{member.username}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1 bg-background border border-border rounded px-2 py-0.5 mb-1 group-hover:shadow-[0_0_10px_rgba(255,196,56,0.15)] transition-all">
                        <Zap className="w-3 h-3 text-primary fill-primary" />
                        <span className="text-[10px] font-bold text-foreground">{member.streak}d</span>
                      </div>
                      
                      {member.email?.toLowerCase() === user?.email?.toLowerCase() ? (
                        <span className="text-[9px] font-bold text-muted-foreground tracking-wider uppercase bg-secondary px-1.5 py-0.5 rounded">You</span>
                      ) : member.status === 'Completed' ? (
                        <span className="text-[9px] font-bold uppercase tracking-wider text-green-500">
                          {member.status}
                        </span>
                      ) : (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleNudge(member.username, member.name); }}
                          disabled={nudgedMembers.includes(member.username)}
                          className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
                        >
                          {nudgedMembers.includes(member.username) ? 'Nudged ✓' : <><BellRing className="w-2.5 h-2.5 text-primary"/> Nudge</>}
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="h-1 w-full bg-border rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${member.status === 'Completed' ? 'w-full bg-green-500' : 'w-1/4 bg-gray-600'}`} 
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Circle Timeline Card */}
          <Card className="glass-panel border-none">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border py-3 px-4">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <History className="w-4 h-4 text-muted-foreground" /> Circle Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {timeline.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
                  <Inbox className="w-8 h-8 text-muted-foreground animate-pulse" />
                  <p className="text-xs font-bold text-foreground">No reflections posted yet</p>
                  <p className="text-[10px] text-muted-foreground max-w-xs">Reflections from your circle will appear here when you or your partners complete a session.</p>
                </div>
              ) : (
                timeline.map((item, i) => (
                  <div key={i} className="flex gap-3 relative text-xs">
                     {i !== timeline.length - 1 && <div className="absolute left-[11px] top-6 bottom-[-20px] w-[1px] bg-border" />}
                    <Avatar className="w-6 h-6 border border-border shrink-0 z-10">
                      <AvatarImage src={item.avatar} />
                      <AvatarFallback className="text-[8px] bg-secondary text-foreground">{item.title[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-bold text-foreground">{item.title}</p>
                          {item.verseKey && (
                            <span className="text-[8px] font-extrabold text-primary bg-primary/10 border border-primary/20 px-1 py-0.5 rounded tracking-wide shrink-0">
                              {getSurahName(item.verseKey)} {item.verseKey}
                            </span>
                          )}
                        </div>
                        <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest shrink-0">{item.time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground bg-background/50 p-2.5 rounded-lg border border-border/50 italic leading-relaxed">
                        {item.content}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Side Panel: Live Group Chat */}
        <div className="space-y-4">
          <Card className="glass-panel border-none flex flex-col h-[520px] justify-between">
            <CardHeader className="border-b border-border py-3.5 px-4 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-foreground flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary animate-pulse" /> Circle Live Chat
              </CardTitle>
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping" />
            </CardHeader>

            {/* Chat message panel container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
              {chatMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-4 space-y-2">
                  <Sparkles className="w-6 h-6 text-primary animate-bounce" />
                  <p className="text-xs font-bold text-foreground">Welcome to Circle Chat</p>
                  <p className="text-[10px] text-muted-foreground">Send a message to start holding your circle partners accountable.</p>
                </div>
              ) : (
                chatMessages.map((msg) => {
                  const isMe = msg.email?.toLowerCase() === user?.email?.toLowerCase();
                  return (
                    <div key={msg.id} className={`flex gap-2 max-w-[85%] ${isMe ? 'ml-auto flex-row-reverse' : ''} text-xs`}>
                      <Avatar className="w-6 h-6 border border-border shrink-0">
                        <AvatarImage src={msg.avatar} />
                        <AvatarFallback className="text-[8px] bg-secondary text-foreground">{msg.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-0.5">
                        <div className={`flex items-center gap-1 ${isMe ? 'justify-end' : ''}`}>
                          <span className="text-[9px] font-bold text-muted-foreground">@{msg.username}</span>
                          <span className="text-[8px] text-muted-foreground/65">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className={`p-2.5 rounded-xl leading-relaxed text-xs shadow-sm ${
                          isMe ? 'bg-primary text-black font-medium rounded-tr-none' : 'bg-background border border-border rounded-tl-none text-foreground'
                        }`}>
                          {msg.message}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Send Form */}
            <form onSubmit={handleSendChat} className="p-3 border-t border-border flex gap-2">
              <Input 
                type="text"
                placeholder="Write a message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="h-10 bg-background/50 border-border text-xs focus:ring-primary/20 flex-1"
                maxLength={300}
              />
              <Button type="submit" disabled={!chatInput.trim() || isSendingChat} className="h-10 w-10 p-0 rounded-lg bg-primary text-black shrink-0">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </Card>

          <div 
            onClick={() => triggerAlert("Circle Settings", "Settings parameters for circles are managed by the admin group.", 'info')}
            className="glass-panel p-4 rounded-xl flex items-center justify-between group cursor-pointer hover:border-primary/30 transition-all border border-transparent"
          >
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded bg-secondary text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-all">
                <Settings className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">Circle Settings</span>
            </div>
            <ArrowRight className="w-3 h-3 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>
      </div>
    </div>
  );
}
