'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, Send, BookOpen, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/logo';

interface Verse {
  verse_key: string;
  text_uthmani: string;
  translations: { text: string }[];
}

export default function AiSearchPage() {
  const [prompt, setPrompt] = useState('');
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    setError(null);
    setVerses([]);
    setExplanation(null);

    try {
      const res = await fetch('/api/quran/personalized', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niyyah: prompt })
      });

      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch verses');
      }

      setVerses(data.verses);
      if (data.explanation) {
        setExplanation(data.explanation);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="flex px-6 h-16 max-w-5xl mx-auto items-center justify-between">
          <Link href="/" className="flex items-center gap-2 cursor-pointer group">
            <Logo className="w-8 h-8 text-primary" />
            <span className="text-xl font-semibold tracking-tighter">Muslim Desk</span>
          </Link>
          <div className="flex gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12 flex flex-col gap-8">
        {/* Intro */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-xs font-medium text-primary">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Quran Search</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Find guidance for what&apos;s on your mind.
          </h1>
          <p className="text-muted-foreground text-lg">
            Describe your situation, feelings, or thoughts, and our AI will find verses from the Quran that speak directly to you.
          </p>
        </div>

        {/* Search Input */}
        <div className="space-y-4">
          <Textarea 
            placeholder="E.g., I'm feeling stressed about my finances and need patience..." 
            className="min-h-[120px] resize-none text-base p-4 glass-card focus-visible:ring-primary"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSearch();
              }
            }}
          />
          <div className="flex justify-end">
            <Button 
              onClick={handleSearch} 
              disabled={loading || !prompt.trim()}
              className="rounded-full px-8 gap-2 shadow-lg hover:shadow-primary/20 transition-all"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  Find Verses <Send className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 rounded-xl bg-destructive/10 text-destructive flex gap-3 items-start fade-in">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {/* Results */}
        <div className="space-y-6 mt-4">
          {loading && (
            <div className="space-y-4 fade-in">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden border-border/40">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-5 w-20" />
                    </div>
                    <Skeleton className="h-12 w-full ml-auto rounded" />
                    <Skeleton className="h-16 w-full rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!loading && verses.length > 0 && (
            <div className="space-y-6 fade-in">
              <div className="flex items-center gap-2 pb-2 border-b border-border/40">
                <BookOpen className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Recommended for you</h2>
              </div>
              
              {verses.map((verse) => (
                <Card key={verse.verse_key} className="glass-card overflow-hidden hover:border-primary/30 transition-colors">
                  <CardContent className="p-6 md:p-8 flex flex-col gap-6">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold tracking-wider text-primary bg-primary/10 px-2 py-1 rounded">
                        {verse.verse_key}
                      </span>
                    </div>
                    
                    <p className="quran-text text-2xl md:text-3xl text-right leading-[2.5]">
                      {verse.text_uthmani}
                    </p>
                    
                    <div className="w-full h-px bg-border/40" />
                    
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      {verse.translations?.[0]?.text}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
