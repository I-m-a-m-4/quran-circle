'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Sparkles, CheckCircle2, MessageSquareCode, Zap, Loader2, Play, Pause, Headphones, Save, X, ArrowRight, RefreshCw, Plus, Info } from 'lucide-react';
import { getSurahName } from '@/lib/quran-api';

interface VerseData {
  id: number;
  verse_key: string;
  text_uthmani: string;
  translations: { text: string }[];
}

export default function SessionPage() {
  const router = useRouter();
  
  // Niyyah Setup State
  const [hasSubmittedNiyyah, setHasSubmittedNiyyah] = useState(false);
  const [niyyahInput, setNiyyahInput] = useState('');
  
  // Loaded Session State
  const [verses, setVerses] = useState<VerseData[]>([]);
  const [aiExplanations, setAiExplanations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMoreLoading, setIsMoreLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  
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

  // Audio Playback
  const [playingVerseKey, setPlayingVerseKey] = useState<string | null>(null);
  const [reciter, setReciter] = useState('Alafasy_128kbps');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Journaling
  const [reflectionText, setReflectionText] = useState('');
  const [sessionDuration, setSessionDuration] = useState('5');

  // Translation language preference (synced with top bar)
  const [translationId, setTranslationId] = useState(131); // Default: Saheeh International

  const generateSequentialKeys = (verseKey: string): string[] => {
    const [chapterStr, verseStr] = verseKey.split(':');
    const chapter = parseInt(chapterStr);
    const startVerse = parseInt(verseStr);
    
    const surahLengths: Record<number, number> = {
      1: 7, 2: 286, 3: 200, 4: 176, 5: 120, 6: 165, 7: 206, 8: 75, 9: 129, 10: 109,
      11: 123, 12: 111, 13: 43, 14: 52, 15: 99, 16: 128, 17: 111, 18: 110, 19: 98, 20: 135,
      21: 112, 22: 78, 23: 118, 24: 64, 25: 77, 26: 227, 27: 93, 28: 88, 29: 69, 30: 60,
      31: 34, 32: 30, 33: 73, 34: 54, 35: 45, 36: 83, 37: 182, 38: 88, 39: 75, 40: 85,
      41: 54, 42: 53, 43: 89, 44: 59, 45: 37, 46: 35, 47: 38, 48: 29, 49: 18, 50: 45,
      51: 60, 52: 49, 53: 62, 54: 55, 55: 78, 56: 96, 57: 29, 58: 22, 59: 24, 60: 13,
      61: 14, 62: 11, 63: 11, 64: 18, 65: 12, 66: 12, 67: 30, 68: 52, 69: 52, 70: 44,
      71: 28, 72: 28, 73: 20, 74: 56, 75: 40, 76: 31, 77: 50, 78: 40, 79: 46, 80: 42,
      81: 29, 82: 19, 83: 36, 84: 25, 85: 22, 86: 17, 87: 19, 88: 26, 89: 30, 90: 20,
      91: 15, 92: 21, 93: 11, 94: 8, 95: 8, 96: 19, 97: 5, 98: 8, 99: 8, 100: 11,
      101: 11, 102: 8, 103: 3, 104: 9, 105: 5, 106: 4, 107: 7, 108: 3, 109: 6, 110: 3,
      111: 5, 112: 4, 113: 5, 114: 6
    };
    const totalVerses = surahLengths[chapter] || 286;
    
    const keys: string[] = [];
    for (let i = 0; i < 5; i++) {
      const currentVerse = startVerse + i;
      if (currentVerse <= totalVerses) {
        keys.push(`${chapter}:${currentVerse}`);
      } else {
        break;
      }
    }
    return keys;
  };

  const loadSpecificVerse = async (verseKey: string, transId: number) => {
    setIsLoading(true);
    setHasSubmittedNiyyah(true);
    setVerses([]);
    setAiExplanations([]);

    try {
      const keys = generateSequentialKeys(verseKey);
      const res = await fetch('/api/quran/personalized', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verseKeys: keys, translationId: transId }),
      });
      const data = await res.json();

      if (data.success) {
        setVerses(data.verses || []);
        if (data.explanation) {
          setAiExplanations([data.explanation]);
        }
      } else {
        triggerAlert('Error', data.error || 'Failed to load session details.', 'warning');
        setHasSubmittedNiyyah(false);
      }
    } catch (err) {
      console.error(err);
      triggerAlert('Error', 'Connection error loading session details.', 'warning');
      setHasSubmittedNiyyah(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Load existing niyyah + translation preference from local storage on component mount
  useEffect(() => {
    const savedNiyyah = localStorage.getItem('userNiyyah') || 'Build a lasting relationship with the Quran';
    setNiyyahInput(savedNiyyah);

    const savedTransId = localStorage.getItem('preferredTranslationId');
    const transId = savedTransId ? parseInt(savedTransId) : 131;
    setTranslationId(transId);

    // Listen for translation changes from the TopBar dropdown
    const handleTranslationChange = (e: CustomEvent) => {
      setTranslationId(e.detail.translationId);
    };
    window.addEventListener('translationChanged', handleTranslationChange as EventListener);

    // Check if we are viewing a specific session / verse from recent activity
    const params = new URLSearchParams(window.location.search);
    const verseParam = params.get('verse');
    if (verseParam && /^\d+:\d+$/.test(verseParam)) {
      loadSpecificVerse(verseParam, transId);
    }

    return () => window.removeEventListener('translationChanged', handleTranslationChange as EventListener);
  }, []);

  // Format audio URL for the given verse key
  const getAudioUrl = (verseKey: string) => {
    if (!verseKey) return "";
    const [chapter, v] = verseKey.split(':');
    return `https://everyayah.com/data/${reciter}/${chapter.padStart(3, '0')}${v.padStart(3, '0')}.mp3`;
  };

  const handlePlayToggle = (verseKey: string) => {
    if (!audioRef.current) return;

    if (playingVerseKey === verseKey) {
      if (audioRef.current.paused) {
        audioRef.current.play().catch(err => {
          console.error("Audio playback error:", err);
        });
      } else {
        audioRef.current.pause();
        setPlayingVerseKey(null);
      }
    } else {
      setPlayingVerseKey(verseKey);
      audioRef.current.src = getAudioUrl(verseKey);
      audioRef.current.load();
      audioRef.current.play().catch(err => {
        console.error("Audio playback error:", err);
        setPlayingVerseKey(null);
      });
    }
  };

  // Triggers the initial dynamic session generation
  const handleNiyyahSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!niyyahInput.trim()) return;

    setIsLoading(true);
    setHasSubmittedNiyyah(true);
    localStorage.setItem('userNiyyah', niyyahInput.trim());
    setVerses([]);
    setAiExplanations([]);

    try {
      const res = await fetch('/api/quran/personalized', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niyyah: niyyahInput.trim(), excludeKeys: [], translationId }),
      });
      const data = await res.json();

      if (data.success) {
        setVerses(data.verses || []);
        if (data.explanation) {
          setAiExplanations([data.explanation]);
        }
        
        // Log session start to simulated Firestore (active session state)
        const primaryVerseKey = data.verses?.[0]?.verse_key || '2:255';
        const userEmail = localStorage.getItem('userEmail') || 'bello@example.com';
        fetch('/api/user/activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: userEmail, 
            activityType: 'session-start', 
            duration: parseInt(sessionDuration),
            verse: primaryVerseKey,
            niyyah: niyyahInput.trim()
          })
        }).catch(err => console.error("Logging session start failed:", err));
      } else {
        triggerAlert('Error', data.error || 'Failed to craft personalized session.', 'warning');
        setHasSubmittedNiyyah(false);
      }
    } catch (err) {
      console.error(err);
      triggerAlert('Connection Error', 'Error fetching dynamic session. Please check your network.', 'warning');
      setHasSubmittedNiyyah(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Triggers fetching 5 *more* verses based on the same niyyah (infinite scroll feature)
  const handleLoadMore = async () => {
    if (isMoreLoading) return;
    setIsMoreLoading(true);

    const currentKeys = verses.map(v => v.verse_key);

    try {
      const res = await fetch('/api/quran/personalized', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niyyah: niyyahInput.trim(), excludeKeys: currentKeys }),
      });
      const data = await res.json();

      if (data.success) {
        setVerses(prev => [...prev, ...(data.verses || [])]);
        if (data.explanation) {
          setAiExplanations(prev => [...prev, data.explanation]);
        }
      } else {
        triggerAlert('Session Warning', 'Could not fetch more verses. Please try again.', 'warning');
      }
    } catch (err) {
      console.error("Load more error:", err);
    } finally {
      setIsMoreLoading(false);
    }
  };

  // Reset page state to start a new session
  const handleStartNewSession = () => {
    setHasSubmittedNiyyah(false);
    setVerses([]);
    setAiExplanations([]);
    setReflectionText('');
    setPlayingVerseKey(null);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const handleFinish = async () => {
    setIsCompleted(true);
    
    const finalReflection = reflectionText.trim() || 'Completed daily session without a written reflection.';
    localStorage.setItem('userReflection', finalReflection);
    
    // Save last dynamic verse generated to cache in localstorage
    if (verses.length > 0) {
      localStorage.setItem('aiVerse', JSON.stringify({
        arabicVerse: verses[0].text_uthmani,
        translation: verses[0].translations?.[0]?.text || ''
      }));
    }

    try {
      const userEmail = localStorage.getItem('userEmail') || 'bello@example.com';
      const primaryVerseKey = verses[0]?.verse_key || '2:255';

      // 1. Save reflection
      await fetch('/api/quran/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, content: finalReflection, verse: primaryVerseKey })
      });
      
      // 2. Log activity
      await fetch('/api/user/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: userEmail, 
          activityType: 'session', 
          duration: parseInt(sessionDuration),
          verse: primaryVerseKey 
        })
      });
    } catch (e) {
      console.error("API Logging failed:", e);
    }

    setTimeout(() => {
      router.push('/dashboard');
    }, 2000);
  };

  // 1. Initial State: Ask user what is weighing on their heart/niyyah
  if (!hasSubmittedNiyyah) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] max-w-xl mx-auto px-4 py-12 animate-in fade-in duration-500">
        <Card className="glass-panel border-none w-full shadow-2xl relative overflow-hidden">
          {/* Decorative glows */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
          
          <CardContent className="p-8 sm:p-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">Set Your Focus</h1>
                <p className="text-xs text-muted-foreground mt-0.5">Craft a personalized Quran study session today</p>
              </div>
            </div>

            <form onSubmit={handleNiyyahSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground/80 uppercase tracking-widest">What's weighing on your mind right now?</label>
                <textarea 
                  value={niyyahInput}
                  onChange={(e) => setNiyyahInput(e.target.value)}
                  placeholder="e.g. Seeking direction in career decisions, feeling anxious about a family situation, or wanting to practice gratitude..."
                  className="w-full h-32 bg-background border border-border rounded-lg p-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none shadow-inner"
                  required
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-bold uppercase">Duration:</span>
                  <select 
                    value={sessionDuration}
                    onChange={(e) => setSessionDuration(e.target.value)}
                    className="bg-background border border-border text-foreground text-xs font-bold rounded-lg px-3 py-2 cursor-pointer focus:outline-none"
                  >
                    <option value="5">5 Minutes</option>
                    <option value="15">15 Minutes</option>
                    <option value="30">30 Minutes</option>
                  </select>
                </div>

                <Button 
                  type="submit" 
                  className="w-full sm:w-auto h-12 px-8 rounded-lg bg-primary text-black font-bold hover:bg-primary/90 shadow-[0_4px_15px_rgba(234,88,12,0.3)] transition-all flex items-center gap-2"
                >
                  Craft 5 Verses <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 2. Loading State: Generating personalized content
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[75vh] space-y-6 animate-in fade-in duration-500">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <div className="text-center space-y-2 max-w-sm">
          <p className="text-foreground font-bold text-lg">AI Orchestrator Active</p>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Gemini is matching verses, translations, and recitations dynamically from the Quran Foundation...
          </p>
        </div>
      </div>
    );
  }

  // 3. Main Session State: Display 5 verses (or more) and reflection box
  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto space-y-8 py-8 px-4 animate-in fade-in duration-700">
      
      {/* Hidden audio player */}
      <audio 
        ref={audioRef} 
        onEnded={() => setPlayingVerseKey(null)}
      />

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-primary uppercase tracking-[0.2em] bg-primary/10 px-2 py-0.5 rounded">Tailored Session</span>
            <span className="text-xs text-muted-foreground font-bold uppercase font-mono">{verses.length} Verses Loaded</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">Focus: "{niyyahInput}"</h1>
        </div>

        <div className="flex flex-row items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-muted-foreground uppercase hidden sm:inline">Reciter:</span>
            <select 
              value={reciter}
              onChange={(e) => { setReciter(e.target.value); setPlayingVerseKey(null); }}
              className="bg-card border border-border text-foreground text-xs font-bold rounded-lg px-3 py-2 cursor-pointer focus:outline-none"
            >
              <option value="Alafasy_128kbps">Mishary Alafasy</option>
              <option value="Husary_128kbps">Mahmoud Al-Husary</option>
              <option value="Abdul_Basit_Murattal_64kbps">AbdulBaset AbdulSamad</option>
            </select>
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleStartNewSession}
            className="text-xs font-bold uppercase tracking-widest gap-2 h-9 px-4 rounded-lg text-foreground hover:bg-black/5 dark:hover:bg-white/5 border border-border"
          >
            <RefreshCw className="w-3.5 h-3.5" /> New Session
          </Button>
        </div>
      </header>



      {/* Main Single-Column Verses Stack */}
      <div className="space-y-6">
        {verses.map((verse, index) => (
          <Card key={verse.verse_key} className="glass-panel border-none hover:shadow-md transition-all duration-300">
            <CardContent className="p-6 space-y-4">
              
              {/* Card Header info */}
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded">
                    {getSurahName(verse.verse_key)} {verse.verse_key}
                  </span>
                  <span className="text-xs text-muted-foreground font-bold font-mono">
                    Verse {verse.id}
                  </span>
                </div>
                
                {/* Audio controls */}
                <button
                  onClick={() => handlePlayToggle(verse.verse_key)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                    playingVerseKey === verse.verse_key 
                      ? 'bg-primary text-black scale-105 shadow-[0_0_15px_rgba(234,88,12,0.4)]'
                      : 'bg-background border border-border text-muted-foreground hover:text-foreground hover:border-primary/50'
                  }`}
                  title={playingVerseKey === verse.verse_key ? "Pause recitation" : "Play recitation"}
                >
                  {playingVerseKey === verse.verse_key ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </button>
              </div>

              {/* Arabic verse text - Reduced font size for mobile view optimization */}
              <div className="py-2">
                <p className="quran-text text-xl md:text-2xl text-foreground leading-[1.8] text-right font-medium drop-shadow-sm" dir="rtl">
                  {verse.text_uthmani}
                </p>
              </div>

              {/* English translation */}
              <div className="pt-3 border-t border-border/40">
                <p 
                  className="text-muted-foreground text-sm font-medium italic leading-relaxed text-balance"
                  dangerouslySetInnerHTML={{ __html: verse.translations?.[0]?.text || "" }}
                />
              </div>

            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More Verses / Infinite Scroll Trigger */}
      <div className="flex justify-center pt-2">
        <Button 
          variant="outline" 
          onClick={handleLoadMore} 
          disabled={isMoreLoading}
          className="h-12 px-6 rounded-lg text-foreground hover:bg-black/5 dark:hover:bg-white/5 border border-border gap-2 text-xs font-bold uppercase tracking-widest"
        >
          {isMoreLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-primary" /> Loading More Verses...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 text-primary" /> Keep Reading / Load 5 More Verses
            </>
          )}
        </Button>
      </div>

      {/* Unified Reflection Journal Area */}
      <Card className="glass-panel border-none p-6">
        <CardContent className="p-0 space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <MessageSquareCode className="w-5 h-5" />
            <span className="text-xs font-extrabold uppercase tracking-widest">Unified Reflection Journal</span>
          </div>
          
          <textarea 
            value={reflectionText}
            onChange={(e) => setReflectionText(e.target.value)}
            placeholder="Write down what you have learned from these verses. How do they speak to your situation today?"
            className="w-full h-32 bg-background border border-border rounded-lg p-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none shadow-inner"
          />
        </CardContent>
      </Card>

      {/* Completion Button */}
      <div className="flex flex-col items-center justify-center py-6">
        {isCompleted ? (
          <div className="flex flex-col items-center gap-6 animate-in zoom-in duration-500">
            <div className="w-20 h-20 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-green-500 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-extrabold text-foreground tracking-tight">BarakAllah!</h2>
              <p className="text-muted-foreground font-medium text-sm">Your reflections are logged and shared with your Circle.</p>
            </div>
          </div>
        ) : (
          <Button 
            size="lg" 
            className="h-14 px-12 rounded-lg bg-primary text-black font-extrabold text-lg hover:bg-primary/90 shadow-[0_4px_15px_rgba(234,88,12,0.3)] transition-all flex items-center gap-3 group"
            onClick={handleFinish}
          >
            Complete Daily Habit <CheckCircle2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          </Button>
        )}
      </div>

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

    </div>
  );
}
