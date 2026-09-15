'use client';

import { useState, useEffect } from 'react';
import { Moon, Sun, Sunrise, Sunset, Heart } from 'lucide-react';
import { ADHKAR, type AdhkarCategory, getAdhkarByCategory } from '@/data/adhkar';
import { cn } from '@/lib/utils';

const CATEGORIES: { id: AdhkarCategory; label: string; icon: any }[] = [
  { id: 'morning', label: 'Morning', icon: Sunrise },
  { id: 'evening', label: 'Evening', icon: Sunset },
  { id: 'after_salah', label: 'After Salah', icon: Moon },
  { id: 'before_sleeping', label: 'Before Sleep', icon: Moon },
  { id: 'general', label: 'General', icon: Heart },
];

export default function AdhkarPage() {
  const [activeTab, setActiveTab] = useState<AdhkarCategory>('morning');
  const items = getAdhkarByCategory(activeTab);

  // Local state to track remaining counts for the session
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem(`adhkar_counts_${activeTab}`);
    if (saved) {
      setCounts(JSON.parse(saved));
    } else {
      setCounts(items.reduce((acc, item) => ({ ...acc, [item.id]: item.count }), {}));
    }
    setIsLoaded(true);
  }, [activeTab]); // intentionally not including items to avoid loop, items change when activeTab changes

  useEffect(() => {
    if (isLoaded) {
      sessionStorage.setItem(`adhkar_counts_${activeTab}`, JSON.stringify(counts));
    }
  }, [counts, activeTab, isLoaded]);

  // Reset counts when tab changes
  const handleTabChange = (cat: AdhkarCategory) => {
    setIsLoaded(false);
    setActiveTab(cat);
  };

  const handleDecrement = (id: string) => {
    setCounts(prev => ({
      ...prev,
      [id]: Math.max(0, prev[id] - 1)
    }));
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border pt-8 pb-4 px-4">
        <h1 className="text-2xl font-semibold mb-6 px-2">Adhkar</h1>
        
        <div className="flex overflow-x-auto hide-scrollbar gap-2 px-2 pb-2">
          {CATEGORIES.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => handleTabChange(id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors border",
                  isActive 
                    ? "bg-primary text-primary-foreground border-primary" 
                    : "bg-card text-muted-foreground border-border hover:border-primary/30"
                )}
              >
                <Icon size={14} />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {items.map((item) => {
          const remaining = counts[item.id] ?? item.count;
          const isDone = remaining === 0;

          return (
            <div 
              key={item.id} 
              className={cn(
                "p-5 bg-card rounded-2xl border transition-all",
                isDone ? "border-primary/20 bg-primary/5" : "border-border",
                "relative overflow-hidden"
              )}
            >
              {isDone && (
                <div className="absolute top-0 right-0 p-4">
                  <span className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                    ✓
                  </span>
                </div>
              )}

              <p className="font-arabic text-2xl leading-loose text-right mb-6 text-foreground" dir="rtl">
                {item.arabic}
              </p>
              
              <div className="space-y-3 mb-6">
                <p className="text-sm italic text-muted-foreground">
                  {item.transliteration}
                </p>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {item.translation}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-primary/80 mt-2">
                  {item.reference}
                </p>
              </div>

              {/* Counter Button */}
              <button
                onClick={() => handleDecrement(item.id)}
                disabled={isDone}
                className={cn(
                  "w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all",
                  isDone 
                    ? "bg-muted text-muted-foreground cursor-not-allowed" 
                    : "bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
                )}
              >
                {isDone ? (
                  <span>Completed</span>
                ) : (
                  <>
                    <span className="text-sm">Repeat</span>
                    <span className="w-6 h-6 rounded-md bg-background/50 flex items-center justify-center text-xs">
                      {remaining}
                    </span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
