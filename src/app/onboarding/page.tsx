'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookOpen, Sparkles, ArrowRight, CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { generatePersonalizedQuranVerse } from '@/ai/flows/generate-personalized-quran-verse-flow';

const GOALS = [
  "Daily Quran Reading (5 mins)",
  "Surah Progress Tracking",
  "Daily Reflection & Tafsir",
  "Memorization (Hifzh)",
  "Circle-based Accountability"
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedGoal, setSelectedGoal] = useState("");
  const [niyyah, setNiyyah] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleNextStep = async () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      setIsGenerating(true);
      try {
        const aiResponse = await generatePersonalizedQuranVerse({
          niyyah: niyyah,
          theme: selectedGoal
        });
        
        localStorage.setItem('userNiyyah', niyyah);
        localStorage.setItem('userGoal', selectedGoal);
        localStorage.setItem('aiVerse', JSON.stringify(aiResponse));
        
        router.push('/dashboard');
      } catch (error) {
        console.error('Failed to generate verse:', error);
        localStorage.setItem('userNiyyah', niyyah);
        localStorage.setItem('userGoal', selectedGoal);
        router.push('/dashboard');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-[10%] right-[10%] w-[300px] h-[300px] bg-amber-500/5 rounded-full blur-[80px] -z-10" />

      <header className="fixed top-12 left-1/2 -translate-x-1/2 flex items-center gap-2">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
          <BookOpen className="w-6 h-6 text-black" />
        </div>
        <span className="text-2xl font-bold tracking-tighter">Quran Circle</span>
      </header>

      <main className="max-w-xl w-full">
        {step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-4 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-primary font-bold uppercase tracking-widest">
                <Sparkles className="w-3 h-3" /> Step 1: Intention
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">What brings you to <br/><span className="text-primary">Quran Circle?</span></h1>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {GOALS.map((goal) => (
                <Card 
                  key={goal}
                  className={`border-none glass-panel cursor-pointer transition-all hover:translate-x-1 ${selectedGoal === goal ? 'ring-2 ring-primary bg-primary/10' : ''}`}
                  onClick={() => setSelectedGoal(goal)}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <span className="font-semibold text-gray-200">{goal}</span>
                    <div className={`w-5 h-5 rounded-full ${selectedGoal === goal ? 'bg-primary flex items-center justify-center' : 'border border-white/20'}`}>
                      {selectedGoal === goal && <CheckCircle2 className="w-4 h-4 text-black" />}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button 
              className="w-full h-14 bg-white text-black font-bold text-lg hover:bg-gray-200 rounded-full mt-8"
              onClick={handleNextStep}
              disabled={!selectedGoal}
            >
              Continue <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-4 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-primary font-bold uppercase tracking-widest">
                <Sparkles className="w-3 h-3" /> Step 2: Set your Niyyah
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Write down your <br/>daily commitment</h1>
              <p className="text-gray-400">This will be your anchor every day you log in.</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="niyyah" className="text-sm font-bold text-gray-400">My Niyyah is...</Label>
                <textarea 
                  id="niyyah"
                  className="w-full h-40 bg-white/5 border border-white/10 rounded-2xl p-6 text-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary resize-none placeholder:text-gray-600 transition-all font-serif italic"
                  placeholder="e.g. To read at least 5 verses daily and reflect on them during my morning commute."
                  value={niyyah}
                  onChange={(e) => setNiyyah(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-4">
                <Button 
                  className="w-full h-14 bg-primary text-black font-bold text-lg hover:bg-primary/90 rounded-full shadow-[0_15px_30px_-10px_rgba(255,196,56,0.3)]"
                  onClick={handleNextStep}
                  disabled={niyyah.length < 5 || isGenerating}
                >
                  {isGenerating ? (
                    <><Loader2 className="mr-2 w-5 h-5 animate-spin" /> Seeking Divine Insight...</>
                  ) : (
                    <>Set Niyyah & Finalize <ArrowRight className="ml-2 w-5 h-5" /></>
                  )}
                </Button>
                <button className="text-gray-500 font-medium hover:text-white transition-colors" onClick={() => setStep(1)} disabled={isGenerating}>Go Back</button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Progress indicators at bottom */}
      <footer className="fixed bottom-12 flex items-center gap-4">
        {[1, 2].map((i) => (
          <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${step >= i ? 'w-12 bg-primary' : 'w-4 bg-white/10'}`} />
        ))}
      </footer>
    </div>
  );
}
