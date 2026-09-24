'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { 
  BookOpen, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  Moon, 
  Hand, 
  Heart, 
  Check, 
  Loader2 
} from 'lucide-react';
import { Logo } from '@/components/logo';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';

const FOCUS_AREAS = [
  { id: 'prayer', label: 'Prayer Time Tracking', desc: 'Get accurate daily Athan & prayer schedules', icon: Clock },
  { id: 'quran', label: 'Quran & Reflections', desc: 'Build daily reading habits with AI Tafsir', icon: BookOpen },
  { id: 'adhkar', label: 'Daily Adhkar & Tasbih', desc: 'Morning & evening remembrance tracker', icon: Moon },
  { id: 'worship', label: 'Worship Goals & Habits', desc: 'Monitor your spiritual consistency', icon: Heart },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedGoals, setSelectedGoals] = useState<string[]>(['prayer', 'quran']);
  const [customGoal, setCustomGoal] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const toggleGoal = (id: string) => {
    setSelectedGoals(prev => 
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  const handleFinalize = async () => {
    setIsSaving(true);
    try {
      if (user) {
        await updateDoc(doc(db, 'users', user.uid), { 
          focusAreas: selectedGoals,
          niyyah: customGoal || "Spiritual Consistency & Growth"
        });
      }
      localStorage.setItem('userFocusAreas', JSON.stringify(selectedGoals));
      if (customGoal) localStorage.setItem('userNiyyah', customGoal);
      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to save preferences:', error);
      router.push('/dashboard');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between items-center p-6 relative overflow-hidden">
      {/* Background ambient subtle gradients */}
      <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

      {/* Top Header */}
      <header className="w-full max-w-4xl flex items-center justify-between py-4">
        <Logo showText className="w-9 h-9" />
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => router.push('/dashboard')}
          className="text-muted-foreground hover:text-foreground text-xs font-semibold"
        >
          Skip for now
        </Button>
      </header>

      {/* Main Content Area */}
      <main className="max-w-2xl w-full my-auto py-8">
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <div className="space-y-3 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Personalize Your Experience
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">What do you want to focus on?</h1>
            <p className="text-muted-foreground text-sm max-w-lg mx-auto">
              Muslim Desk organizes your daily prayers, Quran reading, habits, and tasbih in one place. Choose your primary goals:
            </p>
          </div>

          {/* Interactive Feature Selection Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FOCUS_AREAS.map(({ id, label, desc, icon: Icon }) => {
              const isSelected = selectedGoals.includes(id);
              return (
                <Card 
                  key={id}
                  onClick={() => toggleGoal(id)}
                  className={`cursor-pointer transition-all duration-200 border-2 relative overflow-hidden ${
                    isSelected 
                      ? 'border-primary bg-primary/5 shadow-md shadow-primary/10' 
                      : 'border-border/60 bg-card hover:border-border hover:bg-accent/40'
                  }`}
                >
                  <CardContent className="p-5 flex items-start gap-4">
                    <div className={`p-3 rounded-xl shrink-0 transition-colors ${
                      isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0 pr-4">
                      <h3 className="font-bold text-sm tracking-tight">{label}</h3>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{desc}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors shrink-0 ${
                      isSelected ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground/30'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Optional Personal Goal */}
          <div className="space-y-2 pt-2">
            <Label htmlFor="niyyah" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Personal Reflection or Intention (Optional)
            </Label>
            <input 
              id="niyyah"
              type="text"
              className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary placeholder:text-muted-foreground/60 transition-all"
              placeholder="e.g., Read 1 page of Quran daily after Fajr"
              value={customGoal}
              onChange={(e) => setCustomGoal(e.target.value)}
            />
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <Button 
              className="w-full h-12 bg-primary text-primary-foreground font-bold text-base hover:bg-primary/90 rounded-xl shadow-lg shadow-primary/20 transition-all"
              onClick={handleFinalize}
              disabled={isSaving}
            >
              {isSaving ? (
                <><Loader2 className="mr-2 w-5 h-5 animate-spin" /> Saving preferences...</>
              ) : (
                <>Enter Muslim Desk Dashboard <ArrowRight className="ml-2 w-5 h-5" /></>
              )}
            </Button>
          </div>

        </div>
      </main>

      {/* Simple Footer */}
      <footer className="py-4 text-center text-xs text-muted-foreground">
        Muslim Desk • Your daily spiritual companion
      </footer>
    </div>
  );
}


