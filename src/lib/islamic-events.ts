/**
 * Islamic Events Engine
 * 
 * Maps Hijri month + day to significant Islamic events.
 * Used to power smart "eve of Arafah" style notifications.
 */

export interface IslamicEvent {
  hijriMonth: number;  // 1-12
  hijriDay: number;
  name: string;
  description: string;
  type: 'fast' | 'celebration' | 'holy-night' | 'memorial' | 'weekly';
  notifyDayBefore: boolean;
  notifyMorningOf: boolean;
}

export const ISLAMIC_EVENTS: IslamicEvent[] = [
  // Muharram (1)
  { hijriMonth: 1, hijriDay: 1, name: "Islamic New Year", description: "The first day of the Hijri year. A time for reflection.", type: 'celebration', notifyDayBefore: false, notifyMorningOf: true },
  { hijriMonth: 1, hijriDay: 10, name: "Day of Ashura", description: "The Prophet ﷺ fasted on this day. It is Sunnah to fast on Ashura and the day before it (9th).", type: 'fast', notifyDayBefore: true, notifyMorningOf: true },

  // Rajab (7)
  { hijriMonth: 7, hijriDay: 27, name: "Isra wal Mi'raj", description: "The Night Journey and Ascension of the Prophet ﷺ. Increase your dhikr and prayers tonight.", type: 'holy-night', notifyDayBefore: true, notifyMorningOf: false },

  // Sha'ban (8)
  { hijriMonth: 8, hijriDay: 15, name: "Laylatul Bara'ah (Shab-e-Barat)", description: "The night of mid-Sha'ban. Many scholars encourage worship and seeking forgiveness.", type: 'holy-night', notifyDayBefore: true, notifyMorningOf: false },

  // Ramadan (9)
  { hijriMonth: 9, hijriDay: 1, name: "First Day of Ramadan", description: "Ramadan Mubarak! The blessed month of fasting begins today.", type: 'celebration', notifyDayBefore: true, notifyMorningOf: true },
  { hijriMonth: 9, hijriDay: 21, name: "Laylatul Qadr (could be tonight)", description: "Look for Laylatul Qadr in the odd nights of the last 10 days. Tonight is the 21st — stay up for Tahajjud.", type: 'holy-night', notifyDayBefore: false, notifyMorningOf: false },
  { hijriMonth: 9, hijriDay: 23, name: "Laylatul Qadr (could be tonight)", description: "The 23rd night of Ramadan. Increase your worship — 'Allahumma innaka 'afuwwun tuhibbul 'afwa fa'fu 'anni.'", type: 'holy-night', notifyDayBefore: false, notifyMorningOf: false },
  { hijriMonth: 9, hijriDay: 25, name: "Laylatul Qadr (could be tonight)", description: "The 25th night of Ramadan. Pray Tahajjud and recite the du'a of Laylatul Qadr.", type: 'holy-night', notifyDayBefore: false, notifyMorningOf: false },
  { hijriMonth: 9, hijriDay: 27, name: "Laylatul Qadr (most likely tonight)", description: "The 27th night — most scholars consider this the most likely Laylatul Qadr. Do not let this night pass!", type: 'holy-night', notifyDayBefore: false, notifyMorningOf: false },
  { hijriMonth: 9, hijriDay: 29, name: "Laylatul Qadr (could be tonight)", description: "The last odd night of Ramadan. Seek Laylatul Qadr tonight.", type: 'holy-night', notifyDayBefore: false, notifyMorningOf: false },
  { hijriMonth: 9, hijriDay: 30, name: "Last Day of Ramadan", description: "Ramadan is ending. Pay your Zakat al-Fitr today before Eid prayer.", type: 'celebration', notifyDayBefore: false, notifyMorningOf: true },

  // Shawwal (10)
  { hijriMonth: 10, hijriDay: 1, name: "Eid al-Fitr", description: "Eid Mubarak! Perform Ghusl, wear your best clothes, and attend Eid prayer.", type: 'celebration', notifyDayBefore: true, notifyMorningOf: true },
  { hijriMonth: 10, hijriDay: 6, name: "Sunnah Fasts of Shawwal", description: "Fasting 6 days of Shawwal is like fasting the whole year. Start your 6 days this week!", type: 'fast', notifyDayBefore: false, notifyMorningOf: true },

  // Dhul Hijjah (12)
  { hijriMonth: 12, hijriDay: 1, name: "First Days of Dhul Hijjah", description: "The first 10 days of Dhul Hijjah are the best days of the year. Increase your worship, fasting, and dhikr!", type: 'celebration', notifyDayBefore: true, notifyMorningOf: true },
  { hijriMonth: 12, hijriDay: 9, name: "Day of Arafah", description: "The greatest day of the year! It is Sunnah to fast today. This fast expiates sins of the past and coming year.", type: 'fast', notifyDayBefore: true, notifyMorningOf: true },
  { hijriMonth: 12, hijriDay: 10, name: "Eid al-Adha", description: "Eid al-Adha Mubarak! Attend Eid prayer and perform your Udhiyah (sacrifice).", type: 'celebration', notifyDayBefore: true, notifyMorningOf: true },
];

// Weekly events (checked by day of week separately)
export const WEEKLY_EVENTS = [
  {
    dayOfWeek: 5, // Friday (0=Sun, 1=Mon...)
    name: "Jumu'ah (Friday)",
    description: "It is Sunnah to: read Surah Al-Kahf, send extra Salawat on the Prophet ﷺ, make du'a in the last hour before Maghrib.",
    type: 'weekly' as const,
  },
  {
    dayOfWeek: 1, // Monday
    name: "Sunnah Fast (Monday)",
    description: "The Prophet ﷺ was asked about fasting on Mondays. He said: 'That is the day I was born and the day revelation first came to me.' (Muslim)",
    type: 'fast' as const,
  },
  {
    dayOfWeek: 4, // Thursday
    name: "Sunnah Fast (Thursday)",
    description: "The Prophet ﷺ used to fast on Thursdays. He said: 'Deeds are shown on Mondays and Thursdays, and I like my deeds to be shown when I am fasting.' (Tirmidhi)",
    type: 'fast' as const,
  },
];

/**
 * Check today's date for Islamic events and fire native notifications.
 * Call this once per day, ideally at app startup.
 */
export function scheduleIslamicNotifications(hijriDay: number, hijriMonth: number) {
  if (typeof window === 'undefined') return;
  if (Notification.permission !== 'granted') return;

  const today = new Date();
  const todayWeekday = today.getDay();

  // Check annual Islamic events
  for (const event of ISLAMIC_EVENTS) {
    if (event.hijriMonth === hijriMonth) {
      // Notify morning of
      if (event.notifyMorningOf && event.hijriDay === hijriDay) {
        new Notification(`🌙 ${event.name}`, {
          body: event.description,
          icon: '/icon-192x192.png',
          tag: `islamic-event-${event.hijriMonth}-${event.hijriDay}`,
        });
      }
      // Notify eve (day before)
      if (event.notifyDayBefore && event.hijriDay === hijriDay + 1) {
        new Notification(`📅 Tomorrow: ${event.name}`, {
          body: `Reminder: ${event.description}`,
          icon: '/icon-192x192.png',
          tag: `islamic-event-eve-${event.hijriMonth}-${event.hijriDay}`,
        });
      }
    }
  }

  // Check weekly events
  for (const event of WEEKLY_EVENTS) {
    if (event.dayOfWeek === todayWeekday) {
      new Notification(`🌟 ${event.name}`, {
        body: event.description,
        icon: '/icon-192x192.png',
        tag: `weekly-event-${event.dayOfWeek}`,
      });
    }
  }
}

/**
 * Returns upcoming events in the next 7 days based on current Hijri date.
 */
export function getUpcomingEvents(hijriDay: number, hijriMonth: number, count = 5): IslamicEvent[] {
  const upcoming: IslamicEvent[] = [];
  
  for (let i = 0; i <= 30; i++) {
    let checkDay = hijriDay + i;
    let checkMonth = hijriMonth;
    if (checkDay > 30) { checkDay -= 30; checkMonth = (checkMonth % 12) + 1; }
    
    const matches = ISLAMIC_EVENTS.filter(e => e.hijriMonth === checkMonth && e.hijriDay === checkDay);
    upcoming.push(...matches);
    if (upcoming.length >= count) break;
  }
  
  return upcoming.slice(0, count);
}
