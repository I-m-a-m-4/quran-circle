'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Sparkles, CheckCircle2, MessageSquareCode, Zap, Loader2, Play, Pause, Headphones, Save, X } from 'lucide-react';

interface VerseData {
  verse_key: string;
  text_uthmani: string;
  translations: { text: string }[];
}

export default function SessionPage() {
  const router = useRouter();
  const [verse, setVerse] = useState<VerseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [reciter, setReciter] = useState('Alafasy_128kbps');
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const [aiVerse, setAiVerse] = useState<any>(null);
  const [isReflecting, setIsReflecting] = useState(false);
  const [reflectionText, setReflectionText] = useState('');
  const [userNiyyah, setUserNiyyah] = useState('Build a lasting relationship with the Quran');
  const [sessionDuration, setSessionDuration] = useState('5');

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch(e => {
            console.error(e);
            setIsPlaying(false);
        });
      }
    }
  }, [reciter, verse?.verse_key]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => {
            console.error(e);
            setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  const toggleAudio = () => setIsPlaying(!isPlaying);

  const getAudioUrl = (verseKey: string) => {
    if (!verseKey) return "";
    const [chapter, v] = verseKey.split(':');
    return `https://everyayah.com/data/${reciter}/${chapter.padStart(3, '0')}${v.padStart(3, '0')}.mp3`;
  };

  useEffect(() => {
    async function fetchVerse() {
      try {
        const response = await fetch('/api/quran/verse');
        const data = await response.json();
        
        const localAIVerse = localStorage.getItem('aiVerse');
        if (localAIVerse) {
            try {
                const parsed = JSON.parse(localAIVerse);
                setAiVerse(parsed);
                setVerse({
                    verse_key: data.verse_key, // using random verse key if we don't have one
                    text_uthmani: parsed.arabicVerse,
                    translations: [{ text: parsed.translation }]
                });
            } catch (e) {
                setVerse(data);
            }
        } else {
            setVerse(data);
        }
      } catch (error) {
        console.error('Failed to fetch verse:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchVerse();
    
    const savedNiyyah = localStorage.getItem('userNiyyah');
    if (savedNiyyah) {
        setUserNiyyah(savedNiyyah);
    }
  }, []);

  const handleFinish = async () => {
    setIsCompleted(true);
    
    // 1. Hit the Mock Post API for Reflection
    const finalReflection = reflectionText.trim() || 'Completed daily session without a written reflection.';
    localStorage.setItem('userReflection', finalReflection);
    
    try {
      await fetch('/api/quran/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: finalReflection, verse: verse?.verse_key })
      });
      
      // 2. Hit the Mock Activity API for tracking Goals/Streaks
      await fetch('/api/user/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activityType: 'session', duration: parseInt(sessionDuration) })
      });
    } catch (e) {
      console.error("API Mock Failed", e);
    }

    setTimeout(() => {
      router.push('/dashboard/circle');
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] space-y-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-gray-500 font-medium animate-pulse">Loading daily session...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[80vh] w-full max-w-4xl mx-auto space-y-8 py-10 animate-in fade-in duration-700">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-bold text-primary uppercase tracking-[0.2em]">Today's Session</p>
          <h1 className="text-4xl font-extrabold text-foreground tracking-tight">Focus & Reflection</h1>
        </div>
        <div className="flex items-center gap-4">
          <select 
            value={sessionDuration}
            onChange={(e) => setSessionDuration(e.target.value)}
            className="bg-card border border-border text-foreground text-sm font-bold rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer shadow-sm"
          >
            <option value="5">Micro-Session (5 min)</option>
            <option value="20" disabled>Standard (20 min) - V2</option>
            <option value="60" disabled>Deep Dive (1 hr) - V2</option>
          </select>
          <div className="hidden md:flex items-center gap-3 bg-background border border-border rounded-lg px-6 py-3">
            <Zap className="w-5 h-5 text-primary fill-primary animate-pulse" />
            <span className="text-lg font-bold text-foreground tracking-tight text-nowrap">Real Streak active</span>
          </div>
        </div>
      </header>

      <main className="flex-1 space-y-12">
        {/* Verse Section */}
        <section className="space-y-8">
          <div className="flex items-center gap-3 text-muted-foreground mb-6 font-mono text-sm uppercase tracking-widest border-b border-border pb-4">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span>Verse {verse?.verse_key}</span>
          </div>

          <div className="space-y-10">
            <div className="flex flex-col items-end gap-6">
              <p className="quran-text text-5xl md:text-6xl text-foreground leading-[1.8] text-right drop-shadow-sm">
                {verse?.text_uthmani}
              </p>
              
              {/* Audio Player */}
              <div className="flex items-center gap-4 bg-background border border-border rounded-lg p-2 pr-6 shadow-sm w-fit">
                <button 
                  onClick={toggleAudio}
                  className="w-12 h-12 rounded-full bg-primary text-black flex items-center justify-center hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(255,196,56,0.2)]"
                >
                  {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
                </button>
                <div className="flex items-center gap-3">
                  <Headphones className="w-4 h-4 text-primary" />
                  <select 
                    value={reciter}
                    onChange={(e) => { setReciter(e.target.value); setIsPlaying(false); }}
                    className="bg-transparent text-sm font-bold text-foreground focus:outline-none cursor-pointer"
                  >
                    <option value="Alafasy_128kbps" className="text-foreground">Mishary Alafasy</option>
                    <option value="Husary_128kbps" className="text-foreground">Mahmoud Al-Husary</option>
                    <option value="Abdul_Basit_Murattal_64kbps" className="text-foreground">AbdulBaset AbdulSamad</option>
                  </select>
                </div>
                {verse?.verse_key && (
                  <audio 
                    ref={audioRef} 
                    src={getAudioUrl(verse?.verse_key)} 
                    onEnded={() => setIsPlaying(false)}
                  />
                )}
              </div>
            </div>
            
            <div className="flex flex-col lg:flex-row gap-12 items-start">
              <div className="flex-1 glass-panel p-8 relative overflow-hidden group">
                <div 
                  className="text-xl md:text-2xl font-serif italic text-foreground leading-[1.6] select-none text-balance"
                  dangerouslySetInnerHTML={{ __html: verse?.translations?.[0]?.text || "" }}
                />
                <div className="mt-8 pt-8 border-t border-border flex items-center justify-between">
                  <span className="text-xs font-bold text-primary tracking-widest uppercase">Verified Translation</span>
                  <BookOpen className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>

              <div className="w-full lg:w-80 space-y-4">
                <div className="p-6 rounded-lg bg-background border border-border space-y-4 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl -z-10" />
                  <div className="flex items-center gap-2 text-primary">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">AI Spiritual Context</span>
                  </div>
                  <div className="space-y-1 pb-3 border-b border-border/50">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Your Niyyah</span>
                    <p className="text-sm font-semibold text-foreground">"{userNiyyah}"</p>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                    {aiVerse?.reflectionPrompt || "Connected to Quran Foundation API. Deepen your understanding with real-time data."}
                  </p>
                </div>
                
                {!isReflecting ? (
                  <div 
                    onClick={() => setIsReflecting(true)}
                    className="p-6 rounded-lg border border-dashed border-border text-center py-10 group cursor-pointer hover:border-primary/50 transition-all bg-background hover:bg-black/5 dark:hover:bg-white/5"
                  >
                    <MessageSquareCode className="w-10 h-10 text-muted-foreground mx-auto mb-4 group-hover:text-primary transition-colors" />
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest group-hover:text-foreground transition-colors">Add a personal reflection</p>
                  </div>
                ) : (
                  <div className="p-6 rounded-lg border border-primary/30 bg-primary/5 space-y-4 animate-in fade-in zoom-in-95 duration-300">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-primary uppercase tracking-widest">Your Journal</span>
                        <button onClick={() => setIsReflecting(false)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4"/></button>
                    </div>
                    <textarea 
                        autoFocus
                        value={reflectionText}
                        onChange={(e) => setReflectionText(e.target.value)}
                        placeholder="What are your thoughts on this verse?"
                        className="w-full h-32 bg-background border border-border rounded-md p-4 text-sm text-foreground focus:outline-none focus:border-primary/50 resize-none shadow-inner"
                    />
                    <div className="flex justify-end">
                        <Button size="sm" onClick={() => setIsReflecting(false)} className="bg-primary text-black font-bold gap-2">
                            <Save className="w-4 h-4" /> Save
                        </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Action Button */}
        <div className="flex flex-col items-center justify-center py-12">
          {isCompleted ? (
            <div className="flex flex-col items-center gap-6 animate-in zoom-in duration-500">
              <div className="w-24 h-24 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-green-500 shadow-[0_0_40px_rgba(34,197,94,0.2)]">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-extrabold text-foreground tracking-tight">BarakAllah!</h2>
                <p className="text-muted-foreground font-medium">Your habit for today is officially logged.</p>
              </div>
            </div>
          ) : (
            <Button 
              size="lg" 
              className="h-14 px-12 rounded-lg bg-primary text-black font-extrabold text-xl hover:bg-primary/90 shadow-sm transition-all flex items-center gap-4 group"
              onClick={handleFinish}
            >
              Complete Habit <CheckCircle2 className="ml-2 w-6 h-6 group-hover:rotate-12 transition-transform" />
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
