'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DayData {
  gregorian: { date: string; day: string; month: { en: string; number: number }; year: string; weekday: { en: string } };
  hijri: { date: string; day: string; month: { en: string; ar: string; number: number }; year: string; holidays: string[] };
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [days, setDays] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    
    // Fetch the Gregorian month with Hijri dates
    fetch(`https://api.aladhan.com/v1/gToHCalendar/${month}/${year}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.data) {
          setDays(data.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [currentDate]);

  const handlePrevMonth = () => {
    setCurrentDate(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  };

  // Determine starting day of week (0 = Sunday, 1 = Monday...)
  const firstDay = days.length > 0 ? new Date(days[0].gregorian.date.split('-').reverse().join('-')).getDay() : 0;
  
  // Hijri Month String for the current Gregorian month
  const hijriMonthsStr = days.length > 0 
    ? Array.from(new Set(days.map(d => d.hijri.month.en))).join(' - ')
    : '';
  const hijriYearsStr = days.length > 0
    ? Array.from(new Set(days.map(d => d.hijri.year))).join(' - ')
    : '';

  const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20">
      <div className="pt-8 pb-4 px-6 border-b border-border">
        <h1 className="text-2xl font-semibold mb-1">Calendar</h1>
        <p className="text-sm text-muted-foreground">{hijriMonthsStr} {hijriYearsStr} AH</p>
      </div>
      
      <div className="flex-1 p-6 max-w-2xl mx-auto w-full">
        {/* Controls */}
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={handlePrevMonth}
            className="p-2 rounded-full hover:bg-muted transition-colors border border-border"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-lg font-semibold">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <button 
            onClick={handleNextMonth}
            className="p-2 rounded-full hover:bg-muted transition-colors border border-border"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm relative overflow-hidden min-h-[300px]">
          {loading && (
            <div className="absolute inset-0 bg-card/80 backdrop-blur-sm z-10 flex items-center justify-center">
              <Loader2 className="animate-spin text-primary w-8 h-8" />
            </div>
          )}
          
          <div className="grid grid-cols-7 gap-1 mb-2">
            {WEEKDAYS.map(day => (
              <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {/* Empty slots for start of month */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="h-14 md:h-20" />
            ))}
            
            {/* Days */}
            {days.map((day) => {
              const dateObj = new Date(day.gregorian.date.split('-').reverse().join('-'));
              const isToday = new Date().toDateString() === dateObj.toDateString();
              const hasHoliday = day.hijri.holidays.length > 0;

              return (
                <div 
                  key={day.gregorian.date}
                  className={cn(
                    "h-14 md:h-20 p-1 md:p-2 rounded-xl flex flex-col justify-between border border-transparent transition-colors",
                    isToday ? "bg-primary/10 border-primary/30" : "hover:bg-muted/50"
                  )}
                >
                  <div className="flex justify-between items-start">
                    <span className={cn(
                      "text-xs md:text-sm font-medium",
                      isToday ? "text-primary" : "text-foreground"
                    )}>
                      {day.gregorian.day}
                    </span>
                    {hasHoliday && (
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" title={day.hijri.holidays.join(', ')} />
                    )}
                  </div>
                  <span className={cn(
                    "text-xs md:text-sm font-quran text-right",
                    isToday ? "text-primary font-bold" : "text-muted-foreground"
                  )}>
                    {day.hijri.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Holidays List */}
        <div className="mt-8">
          <h3 className="font-medium text-sm text-muted-foreground mb-4 uppercase tracking-wider">
            Events in {hijriMonthsStr}
          </h3>
          <div className="space-y-2">
            {days.filter(d => d.hijri.holidays.length > 0).map(d => (
              <div key={d.gregorian.date} className="flex items-center justify-between p-4 bg-card border border-border rounded-xl">
                <div>
                  <p className="font-medium">{d.hijri.holidays.join(', ')}</p>
                  <p className="text-sm text-muted-foreground">{d.gregorian.day} {d.gregorian.month.en}</p>
                </div>
                <div className="text-right">
                  <p className="font-quran text-lg text-primary">{d.hijri.day} {d.hijri.month.ar}</p>
                </div>
              </div>
            ))}
            {!loading && days.filter(d => d.hijri.holidays.length > 0).length === 0 && (
              <p className="text-sm text-muted-foreground p-4 text-center border border-border/50 rounded-xl bg-card">
                No Islamic events this month.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
