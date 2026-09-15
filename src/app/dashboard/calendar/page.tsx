'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Loader2, Bell, Moon, Star, Utensils, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getUpcomingEvents, scheduleIslamicNotifications, WEEKLY_EVENTS, IslamicEvent } from '@/lib/islamic-events';

interface DayData {
  gregorian: { date: string; day: string; month: { en: string; number: number }; year: string; weekday: { en: string } };
  hijri: { date: string; day: string; month: { en: string; ar: string; number: number }; year: string; holidays: string[] };
}

const EVENT_TYPE_STYLES: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  fast:         { icon: <Utensils className="w-3.5 h-3.5" />, color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/20' },
  celebration:  { icon: <Star className="w-3.5 h-3.5" />, color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20' },
  'holy-night': { icon: <Moon className="w-3.5 h-3.5" />, color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/20' },
  memorial:     { icon: <Calendar className="w-3.5 h-3.5" />, color: 'text-rose-500', bg: 'bg-rose-500/10 border-rose-500/20' },
  weekly:       { icon: <Star className="w-3.5 h-3.5" />, color: 'text-green-500', bg: 'bg-green-500/10 border-green-500/20' },
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [days, setDays] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<IslamicEvent[]>([]);
  const [notifGranted, setNotifGranted] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotifGranted(Notification.permission === 'granted');
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    
    fetch(`https://api.aladhan.com/v1/gToHCalendar/${month}/${year}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.data) {
          setDays(data.data);
          
          // Get today's hijri info and schedule notifications
          const today = new Date();
          const todayData = (data.data as DayData[]).find(d => {
            const dObj = new Date(d.gregorian.date.split('-').reverse().join('-'));
            return dObj.toDateString() === today.toDateString();
          });
          
          if (todayData) {
            const hDay = parseInt(todayData.hijri.day, 10);
            const hMonth = todayData.hijri.month.number;
            setUpcomingEvents(getUpcomingEvents(hDay, hMonth));
            scheduleIslamicNotifications(hDay, hMonth);
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [currentDate]);

  const requestNotifPermission = async () => {
    const perm = await Notification.requestPermission();
    setNotifGranted(perm === 'granted');
  };

  const handlePrevMonth = () => setCurrentDate(prev => { const d = new Date(prev); d.setMonth(d.getMonth() - 1); return d; });
  const handleNextMonth = () => setCurrentDate(prev => { const d = new Date(prev); d.setMonth(d.getMonth() + 1); return d; });

  const firstDay = days.length > 0 ? new Date(days[0].gregorian.date.split('-').reverse().join('-')).getDay() : 0;
  const hijriMonthsStr = days.length > 0 ? Array.from(new Set(days.map(d => d.hijri.month.en))).join(' / ') : '';
  const hijriYearsStr = days.length > 0 ? Array.from(new Set(days.map(d => d.hijri.year))).join(' / ') : '';

  const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 fade-in">
      <div className="pt-8 pb-4 px-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold mb-1">Hijri Calendar</h1>
            <p className="text-sm text-muted-foreground">{hijriMonthsStr} {hijriYearsStr} AH</p>
          </div>
          {!notifGranted && (
            <button 
              onClick={requestNotifPermission}
              className="flex items-center gap-2 text-xs bg-primary/10 text-primary border border-primary/20 rounded-full px-3 py-2 hover:bg-primary/20 transition-colors"
            >
              <Bell className="w-3.5 h-3.5" /> Enable Event Alerts
            </button>
          )}
        </div>
      </div>
      
      <div className="flex-1 p-6 max-w-5xl mx-auto w-full flex flex-col lg:flex-row gap-8">
        
        {/* Left: Calendar */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-muted transition-colors border border-border">
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-lg font-semibold">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-muted transition-colors border border-border">
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="bg-card border border-border rounded-2xl p-4 shadow-sm relative overflow-hidden min-h-[300px]">
            {loading && (
              <div className="absolute inset-0 bg-card/80 backdrop-blur-sm z-10 flex items-center justify-center">
                <Loader2 className="animate-spin text-primary w-8 h-8" />
              </div>
            )}
            
            <div className="grid grid-cols-7 gap-1 mb-2">
              {WEEKDAYS.map(day => (
                <div key={day} className={cn("text-center text-xs font-semibold py-2", day === 'Fri' ? 'text-primary' : 'text-muted-foreground')}>
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="h-14 md:h-16" />
              ))}
              
              {days.map((day) => {
                const dateObj = new Date(day.gregorian.date.split('-').reverse().join('-'));
                const isToday = new Date().toDateString() === dateObj.toDateString();
                const hasHoliday = day.hijri.holidays.length > 0;
                const isFriday = dateObj.getDay() === 5;
                const isSelected = selectedDay?.gregorian.date === day.gregorian.date;

                return (
                  <button
                    key={day.gregorian.date}
                    onClick={() => setSelectedDay(isSelected ? null : day)}
                    className={cn(
                      "h-14 md:h-16 p-1 md:p-2 rounded-xl flex flex-col justify-between border transition-all text-left",
                      isSelected ? "bg-primary/15 border-primary/50 ring-1 ring-primary/30" :
                      isToday ? "bg-primary/10 border-primary/30" : 
                      isFriday ? "hover:bg-green-500/5 border-transparent" :
                      "hover:bg-muted/50 border-transparent"
                    )}
                  >
                    <div className="flex justify-between items-start">
                      <span className={cn(
                        "text-xs md:text-sm font-medium leading-none",
                        isToday ? "text-primary" : isFriday ? "text-green-500" : "text-foreground"
                      )}>
                        {day.gregorian.day}
                      </span>
                      {hasHoliday && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                      )}
                    </div>
                    <span className={cn(
                      "text-[10px] md:text-xs font-quran text-right leading-none",
                      isToday ? "text-primary font-bold" : "text-muted-foreground"
                    )}>
                      {day.hijri.day}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" /> Islamic event</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary" /> Today</span>
            <span className="flex items-center gap-1.5 text-green-500">Fri = Jumu'ah</span>
          </div>
        </div>

        {/* Right: Selected Day Info + Upcoming Events */}
        <div className="w-full lg:w-80 space-y-6">
          
          {/* Selected Day Detail */}
          {selectedDay && (
            <div className="bg-card border border-border rounded-2xl p-5 animate-in fade-in slide-in-from-top-2">
              <h3 className="font-semibold mb-1">
                {selectedDay.gregorian.weekday.en}, {selectedDay.gregorian.day} {selectedDay.gregorian.month.en}
              </h3>
              <p className="text-sm text-muted-foreground mb-4 font-quran">
                {selectedDay.hijri.day} {selectedDay.hijri.month.ar} {selectedDay.hijri.year} AH
              </p>
              {selectedDay.hijri.holidays.length > 0 ? (
                <div className="space-y-2">
                  {selectedDay.hijri.holidays.map(h => (
                    <div key={h} className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm">
                      <Star className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span className="text-foreground font-medium">{h}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No special events on this day.</p>
              )}
            </div>
          )}

          {/* Upcoming Islamic Events */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Moon className="w-4 h-4 text-primary" /> Upcoming Events
            </h3>
            <div className="space-y-3">
              {upcomingEvents.length > 0 ? upcomingEvents.map((event, i) => {
                const style = EVENT_TYPE_STYLES[event.type] || EVENT_TYPE_STYLES.celebration;
                return (
                  <div key={i} className={cn("flex items-start gap-3 p-3 rounded-xl border text-sm", style.bg)}>
                    <span className={cn("mt-0.5", style.color)}>{style.icon}</span>
                    <div>
                      <p className={cn("font-semibold", style.color)}>{event.name}</p>
                      <p className="text-muted-foreground text-xs mt-0.5 leading-relaxed">{event.description}</p>
                    </div>
                  </div>
                );
              }) : (
                <p className="text-sm text-muted-foreground">No upcoming events in the next 30 days.</p>
              )}
            </div>
          </div>

          {/* Weekly Sunnah Summary */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Star className="w-4 h-4 text-green-500" /> Weekly Sunnah
            </h3>
            <div className="space-y-3">
              {WEEKLY_EVENTS.map((event, i) => {
                const style = EVENT_TYPE_STYLES[event.type] || EVENT_TYPE_STYLES.weekly;
                return (
                  <div key={i} className={cn("flex items-start gap-3 p-3 rounded-xl border text-sm", style.bg)}>
                    <span className={cn("mt-0.5", style.color)}>{style.icon}</span>
                    <div>
                      <p className={cn("font-semibold", style.color)}>{event.name}</p>
                      <p className="text-muted-foreground text-xs mt-0.5 leading-relaxed">{event.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
