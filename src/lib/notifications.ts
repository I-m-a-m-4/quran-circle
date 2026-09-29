import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  serverTimestamp 
} from 'firebase/firestore';
import { getCustomPrayerTimes } from './storage/local';

export type NotificationIconType = 
  | 'sunnah-fasting' 
  | 'kahf' 
  | 'adhkar' 
  | 'tahajjud' 
  | 'prayer' 
  | 'admin-broadcast' 
  | 'nudge' 
  | 'general';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  timestamp: number;
  unread: boolean;
  href: string;
  iconType: NotificationIconType;
  category: 'Sunnah Fasting' | 'Jumu\'ah' | 'Adhkar' | 'Prayer' | 'Admin Announcement' | 'Spiritual Nudge' | 'General';
  isAutomated?: boolean;
  fromAdmin?: boolean;
  startTime?: number; // epoch ms when notification becomes visible
  expiresAt?: number; // epoch ms when notification automatically disappears
}

export interface AdminBroadcastPayload {
  title: string;
  message: string;
  href?: string;
  category?: 'Sunnah Fasting' | 'Jumu\'ah' | 'Adhkar' | 'Prayer' | 'Admin Announcement' | 'Spiritual Nudge' | 'General';
  iconType?: NotificationIconType;
  expiresAt?: number;
}

const LOCAL_STORAGE_BROADCASTS_KEY = 'md_local_admin_broadcasts';
const READ_IDS_KEY = 'md_read_notif_ids';
const CLEARED_TIME_KEY = 'md_notifs_cleared_time';
const DISMISSED_IDS_KEY = 'md_dismissed_notif_ids';

/**
 * Resolves today's prayer times from local custom overrides, cached API timings, or standard defaults.
 */
function getResolvedPrayerTimes(): {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
} {
  let cached: Record<string, string> = {};
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('md_cached_prayer_timings');
      if (raw) {
        const parsed = JSON.parse(raw);
        for (const [k, v] of Object.entries(parsed)) {
          if (typeof v === 'string') cached[k] = v.split(' ')[0];
        }
      }
    } catch {}
  }

  let custom: Record<string, string> = {};
  try {
    custom = getCustomPrayerTimes();
  } catch {}

  return {
    Fajr: custom.Fajr || cached.Fajr || '05:30',
    Sunrise: cached.Sunrise || '06:45',
    Dhuhr: custom.Dhuhr || cached.Dhuhr || '13:00',
    Asr: custom.Asr || cached.Asr || '16:15',
    Maghrib: custom.Maghrib || cached.Maghrib || '18:45',
    Isha: custom.Isha || cached.Isha || '20:00',
  };
}

function parseHHMM(timeStr: string, baseDate: Date): Date {
  const [hStr, mStr] = timeStr.split(':');
  const d = new Date(baseDate);
  d.setHours(parseInt(hStr, 10) || 0, parseInt(mStr, 10) || 0, 0, 0);
  return d;
}

/**
 * Calculates automated Islamic notifications based on the current local time, day, and Hijri calendar.
 * Every notification has a precise startTime and expiresAt window:
 * - Appears automatically when current time enters the window
 * - Disappears automatically the moment the window expires
 */
export function getAutomatedIslamicNotifications(): AppNotification[] {
  const now = new Date();
  const nowMs = now.getTime();
  const day = now.getDay(); // 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat
  const dateStr = now.toISOString().slice(0, 10);
  
  const prayerTimes = getResolvedPrayerTimes();
  const fajrTime = parseHHMM(prayerTimes.Fajr, now);
  const sunriseTime = parseHHMM(prayerTimes.Sunrise, now);
  const dhuhrTime = parseHHMM(prayerTimes.Dhuhr, now);
  const asrTime = parseHHMM(prayerTimes.Asr, now);
  const maghribTime = parseHHMM(prayerTimes.Maghrib, now);
  const ishaTime = parseHHMM(prayerTimes.Isha, now);

  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  const candidates: AppNotification[] = [];

  // ==========================================
  // 1. FIVE DAILY PRAYER NOTIFICATIONS
  // (Appear at prayer time, disappear at next prayer time)
  // ==========================================

  // Fajr: Active from Fajr until Sunrise (or Fajr + 90m)
  const fajrEnd = sunriseTime.getTime() > fajrTime.getTime() 
    ? sunriseTime.getTime() 
    : fajrTime.getTime() + 90 * 60 * 1000;

  candidates.push({
    id: `auto-prayer-fajr-${dateStr}`,
    title: '🌅 Time for Fajr Prayer',
    message: 'Prayer is better than sleep. Rise to fulfill your dawn obligation and greet the day in Allah’s light.',
    time: 'Prayer Time',
    timestamp: fajrTime.getTime(),
    startTime: fajrTime.getTime(),
    expiresAt: fajrEnd,
    unread: true,
    href: '/dashboard/prayer',
    iconType: 'prayer',
    category: 'Prayer',
    isAutomated: true,
  });

  // Dhuhr: Active from Dhuhr until Asr
  candidates.push({
    id: `auto-prayer-dhuhr-${dateStr}`,
    title: '☀️ Time for Dhuhr Prayer',
    message: 'The sun has passed its zenith. Pause your work to align your heart with prayer and recharge with tranquility.',
    time: 'Prayer Time',
    timestamp: dhuhrTime.getTime(),
    startTime: dhuhrTime.getTime(),
    expiresAt: asrTime.getTime(),
    unread: true,
    href: '/dashboard/prayer',
    iconType: 'prayer',
    category: 'Prayer',
    isAutomated: true,
  });

  // Asr: Active from Asr until Maghrib
  candidates.push({
    id: `auto-prayer-asr-${dateStr}`,
    title: '🌤️ Time for Asr Prayer',
    message: 'Guard strictly your prayers, especially the middle prayer (Asr). Fulfill your afternoon devotion promptly.',
    time: 'Prayer Time',
    timestamp: asrTime.getTime(),
    startTime: asrTime.getTime(),
    expiresAt: maghribTime.getTime(),
    unread: true,
    href: '/dashboard/prayer',
    iconType: 'prayer',
    category: 'Prayer',
    isAutomated: true,
  });

  // Maghrib: Active from Maghrib until Isha
  candidates.push({
    id: `auto-prayer-maghrib-${dateStr}`,
    title: '🌇 Time for Maghrib Prayer',
    message: 'The sun has set. Give thanks for the day’s blessings and hasten to perform the Maghrib prayer.',
    time: 'Prayer Time',
    timestamp: maghribTime.getTime(),
    startTime: maghribTime.getTime(),
    expiresAt: ishaTime.getTime(),
    unread: true,
    href: '/dashboard/prayer',
    iconType: 'prayer',
    category: 'Prayer',
    isAutomated: true,
  });

  // Isha: Active from Isha until midnight
  candidates.push({
    id: `auto-prayer-isha-${dateStr}`,
    title: '🌌 Time for Isha Prayer',
    message: 'Conclude your daytime deeds with the tranquil night prayer before resting. May Allah protect your sleep.',
    time: 'Prayer Time',
    timestamp: ishaTime.getTime(),
    startTime: ishaTime.getTime(),
    expiresAt: endOfDay.getTime(),
    unread: true,
    href: '/dashboard/prayer',
    iconType: 'prayer',
    category: 'Prayer',
    isAutomated: true,
  });

  // ==========================================
  // 2. SUNNAH ADHKAR REMINDERS
  // ==========================================

  // Morning Adhkar: From Fajr time until 11:30 AM
  const morningAdhkarEnd = new Date(now);
  morningAdhkarEnd.setHours(11, 30, 0, 0);
  candidates.push({
    id: `auto-adhkar-morning-${dateStr}`,
    title: '🌅 Morning Adhkar Reminder',
    message: 'Fortify your soul and day with authentic morning remembrance from the Sunnah.',
    time: 'Morning',
    timestamp: fajrTime.getTime(),
    startTime: fajrTime.getTime(),
    expiresAt: morningAdhkarEnd.getTime(),
    unread: true,
    href: '/dashboard/adhkar',
    iconType: 'adhkar',
    category: 'Adhkar',
    isAutomated: true,
  });

  // Evening Adhkar: From 16:00 until 21:00
  const eveningAdhkarStart = new Date(now);
  eveningAdhkarStart.setHours(16, 0, 0, 0);
  const eveningAdhkarEnd = new Date(now);
  eveningAdhkarEnd.setHours(21, 0, 0, 0);
  candidates.push({
    id: `auto-adhkar-evening-${dateStr}`,
    title: '🌇 Evening Adhkar Reminder',
    message: 'Seal your daytime deeds and protect your home with the evening remembrances.',
    time: 'Evening',
    timestamp: eveningAdhkarStart.getTime(),
    startTime: eveningAdhkarStart.getTime(),
    expiresAt: eveningAdhkarEnd.getTime(),
    unread: true,
    href: '/dashboard/adhkar',
    iconType: 'adhkar',
    category: 'Adhkar',
    isAutomated: true,
  });

  // ==========================================
  // 3. TAHAJJUD REMINDER (01:00 - Fajr)
  // ==========================================
  const tahajjudStart = new Date(now);
  tahajjudStart.setHours(1, 0, 0, 0);
  candidates.push({
    id: `auto-tahajjud-${dateStr}`,
    title: '🌌 Tahajjud: The Last Third of the Night',
    message: 'The gates of divine mercy are open. Stand before Allah in quiet worship and pour your heart out in sincere dua.',
    time: 'Last Third of Night',
    timestamp: tahajjudStart.getTime(),
    startTime: tahajjudStart.getTime(),
    expiresAt: fajrTime.getTime(),
    unread: true,
    href: '/dashboard/worship',
    iconType: 'tahajjud',
    category: 'Prayer',
    isAutomated: true,
  });

  // ==========================================
  // 4. MONDAY & THURSDAY SUNNAH FASTING
  // ==========================================

  // Sunday Eve: Sunday 16:00 to 23:59:59 (Reminder for Monday fast)
  if (day === 0) {
    const sunEveStart = new Date(now);
    sunEveStart.setHours(16, 0, 0, 0);
    candidates.push({
      id: `auto-fasting-eve-mon-${dateStr}`,
      title: '🌙 Sunnah Fasting Tomorrow (Monday)',
      message: 'Revive the Sunnah tomorrow! Deeds and the Prophet’s birth ﷺ are commemorated. Set your intention for fasting.',
      time: 'Evening Reminder',
      timestamp: sunEveStart.getTime(),
      startTime: sunEveStart.getTime(),
      expiresAt: endOfDay.getTime(),
      unread: true,
      href: '/dashboard/prayer',
      iconType: 'sunnah-fasting',
      category: 'Sunnah Fasting',
      isAutomated: true,
    });
  }

  // Monday Fasting Day: Monday 04:00 to Maghrib (Iftar)
  if (day === 1) {
    const monFastStart = new Date(now);
    monFastStart.setHours(4, 0, 0, 0);
    candidates.push({
      id: `auto-fasting-day-mon-${dateStr}`,
      title: '✨ Sunnah Fasting Today (Monday)',
      message: 'Blessed Monday fast! The Prophet ﷺ said deeds are presented on Monday. May Allah accept your fast and answered dua.',
      time: 'Fast in Progress',
      timestamp: monFastStart.getTime(),
      startTime: monFastStart.getTime(),
      expiresAt: maghribTime.getTime(),
      unread: true,
      href: '/dashboard/prayer',
      iconType: 'sunnah-fasting',
      category: 'Sunnah Fasting',
      isAutomated: true,
    });
  }

  // Wednesday Eve: Wednesday 16:00 to 23:59:59 (Reminder for Thursday fast)
  if (day === 3) {
    const wedEveStart = new Date(now);
    wedEveStart.setHours(16, 0, 0, 0);
    candidates.push({
      id: `auto-fasting-eve-thu-${dateStr}`,
      title: '🌙 Sunnah Fasting Tomorrow (Thursday)',
      message: 'Deeds are presented to Allah on Thursdays. The Prophet ﷺ loved to be fasting when deeds are presented.',
      time: 'Evening Reminder',
      timestamp: wedEveStart.getTime(),
      startTime: wedEveStart.getTime(),
      expiresAt: endOfDay.getTime(),
      unread: true,
      href: '/dashboard/prayer',
      iconType: 'sunnah-fasting',
      category: 'Sunnah Fasting',
      isAutomated: true,
    });
  }

  // Thursday Fasting Day: Thursday 04:00 to Maghrib (Iftar)
  if (day === 4) {
    const thuFastStart = new Date(now);
    thuFastStart.setHours(4, 0, 0, 0);
    candidates.push({
      id: `auto-fasting-day-thu-${dateStr}`,
      title: '✨ Sunnah Fasting Today (Thursday)',
      message: 'Today is Thursday, a cherished Sunnah fasting day. The supplication of a fasting servant at iftar is never rejected.',
      time: 'Fast in Progress',
      timestamp: thuFastStart.getTime(),
      startTime: thuFastStart.getTime(),
      expiresAt: maghribTime.getTime(),
      unread: true,
      href: '/dashboard/prayer',
      iconType: 'sunnah-fasting',
      category: 'Sunnah Fasting',
      isAutomated: true,
    });
  }

  // ==========================================
  // 5. FRIDAY SURAH AL-KAHF NOTIFICATION
  // (Begins Thursday 18:00, disappears Friday Maghrib)
  // ==========================================
  if (day === 4) {
    // Thursday evening: from 18:00 until end of day
    const kahfStartThu = new Date(now);
    kahfStartThu.setHours(18, 0, 0, 0);
    candidates.push({
      id: `auto-kahf-${dateStr}`,
      title: '📖 Blessed Jumu\'ah Eve: Surah Al-Kahf',
      message: 'The blessed night of Jumu\'ah has arrived. Begin reciting Surah Al-Kahf for light shining between both Fridays.',
      time: 'Thursday Eve',
      timestamp: kahfStartThu.getTime(),
      startTime: kahfStartThu.getTime(),
      expiresAt: endOfDay.getTime(),
      unread: true,
      href: '/dashboard/quran/18',
      iconType: 'kahf',
      category: 'Jumu\'ah',
      isAutomated: true,
    });
  } else if (day === 5) {
    // Friday: from 00:00 until Maghrib (sunset)
    candidates.push({
      id: `auto-kahf-${dateStr}`,
      title: '📖 Blessed Jumu\'ah: Surah Al-Kahf',
      message: 'The Prophet ﷺ said: "Whoever reads Surah Al-Kahf on the day of Jumu\'ah will have light illuminating from one Friday to the next."',
      time: 'Jumu\'ah Sunnah',
      timestamp: startOfDay.getTime(),
      startTime: startOfDay.getTime(),
      expiresAt: maghribTime.getTime(),
      unread: true,
      href: '/dashboard/quran/18',
      iconType: 'kahf',
      category: 'Jumu\'ah',
      isAutomated: true,
    });
  }

  // ==========================================
  // 6. WHITE DAYS (AYYAM AL-BEED) FASTING
  // ==========================================
  try {
    const hijriFormatter = new Intl.DateTimeFormat('en-US-u-ca-islamic', { day: 'numeric', month: 'numeric' });
    const parts = hijriFormatter.formatToParts(now);
    const hijriDayStr = parts.find(p => p.type === 'day')?.value;
    const hijriDay = hijriDayStr ? parseInt(hijriDayStr, 10) : 0;

    if (hijriDay === 12) {
      const beedEveStart = new Date(now);
      beedEveStart.setHours(16, 0, 0, 0);
      candidates.push({
        id: `auto-ayyam-beed-eve-${dateStr}`,
        title: '🌕 White Days Fasting Starts Tomorrow (13th Hijri)',
        message: 'Ayyam al-Beed starts tomorrow. Fasting the 13th, 14th, and 15th of the lunar month is equivalent to fasting the entire year!',
        time: 'Monthly Sunnah',
        timestamp: beedEveStart.getTime(),
        startTime: beedEveStart.getTime(),
        expiresAt: endOfDay.getTime(),
        unread: true,
        href: '/dashboard/calendar',
        iconType: 'sunnah-fasting',
        category: 'Sunnah Fasting',
        isAutomated: true,
      });
    } else if (hijriDay >= 13 && hijriDay <= 15) {
      const beedDayStart = new Date(now);
      beedDayStart.setHours(4, 0, 0, 0);
      candidates.push({
        id: `auto-ayyam-beed-day-${hijriDay}-${dateStr}`,
        title: `🌕 The White Days (Ayyam al-Beed) — Day ${hijriDay - 12} of 3`,
        message: `Today is the ${hijriDay}th of the lunar month. Fasting these 3 days brings peace, purification, and immense reward.`,
        time: 'Fast in Progress',
        timestamp: beedDayStart.getTime(),
        startTime: beedDayStart.getTime(),
        expiresAt: maghribTime.getTime(),
        unread: true,
        href: '/dashboard/calendar',
        iconType: 'sunnah-fasting',
        category: 'Sunnah Fasting',
        isAutomated: true,
      });
    }
  } catch {}

  // STRICT TIME-WINDOW FILTER:
  // ONLY return candidates that are ACTIVE RIGHT NOW (nowMs >= startTime and nowMs < expiresAt)
  // When expiresAt is reached, the candidate is naturally omitted and disappears!
  return candidates.filter(item => {
    const start = item.startTime ?? item.timestamp;
    const end = item.expiresAt ?? Infinity;
    return nowMs >= start && nowMs < end;
  });
}

/**
 * Format relative time (e.g. "Just now", "10m ago", "2h ago", "Yesterday")
 */
export function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  if (diff < 0) return 'Just now';
  const minutes = Math.floor(diff / (1000 * 60));
  if (minutes < 2) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

/**
 * Reads local cached admin broadcasts
 */
export function getLocalAdminBroadcasts(): AppNotification[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_BROADCASTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Saves local admin broadcasts
 */
function saveLocalAdminBroadcasts(broadcasts: AppNotification[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_BROADCASTS_KEY, JSON.stringify(broadcasts));
    window.dispatchEvent(new Event('md-notifications-updated'));
  } catch {}
}

/**
 * Send an Admin Broadcast notification.
 * Saves to Firestore `notifications` collection and also syncs to localStorage.
 */
export async function sendAdminBroadcast(payload: AdminBroadcastPayload): Promise<{ success: boolean; id: string }> {
  const notificationId = `broadcast-${Date.now()}`;
  const nowMs = Date.now();
  const defaultExpiry = nowMs + 7 * 24 * 60 * 60 * 1000; // 7 days default
  const newNotif: AppNotification = {
    id: notificationId,
    title: payload.title.trim(),
    message: payload.message.trim(),
    time: 'Just now',
    timestamp: nowMs,
    startTime: nowMs,
    expiresAt: payload.expiresAt || defaultExpiry,
    unread: true,
    href: payload.href || '/dashboard',
    iconType: payload.iconType || 'admin-broadcast',
    category: payload.category || 'Admin Announcement',
    fromAdmin: true,
    isAutomated: false,
  };

  // 1. Always save locally immediately
  const localList = getLocalAdminBroadcasts();
  saveLocalAdminBroadcasts([newNotif, ...localList]);

  // 2. Try Firestore broadcast
  try {
    const docRef = await addDoc(collection(db, 'notifications'), {
      title: newNotif.title,
      message: newNotif.message,
      href: newNotif.href,
      iconType: newNotif.iconType,
      category: newNotif.category,
      fromAdmin: true,
      timestamp: serverTimestamp(),
      createdAtMs: nowMs,
      expiresAt: newNotif.expiresAt,
    });
    return { success: true, id: docRef.id };
  } catch (err) {
    console.warn('Firestore notification broadcast fallback to local sync:', err);
    return { success: true, id: notificationId };
  }
}

/**
 * Delete an Admin Broadcast
 */
export async function deleteAdminBroadcast(id: string): Promise<boolean> {
  const localList = getLocalAdminBroadcasts().filter(n => n.id !== id);
  saveLocalAdminBroadcasts(localList);

  try {
    await deleteDoc(doc(db, 'notifications', id));
  } catch {}
  return true;
}

/**
 * Subscribe to the combined stream of notifications (Automated time-bound + Admin Broadcasts).
 * Includes an automated background clock ticker (every 15s) so that:
 * - When a notification's startTime arrives, it automatically appears.
 * - When a notification's expiresAt passes, it automatically disappears without page reload.
 */
export function subscribeToNotifications(
  callback: (notifications: AppNotification[]) => void
): () => void {
  let isSubscribed = true;
  let currentFsBroadcasts: AppNotification[] = [];

  const getCombined = (firestoreBroadcasts: AppNotification[] = currentFsBroadcasts) => {
    let readIds: string[] = [];
    let dismissedIds: string[] = [];
    let clearedTime = 0;

    if (typeof window !== 'undefined') {
      try {
        readIds = JSON.parse(localStorage.getItem(READ_IDS_KEY) || '[]');
        dismissedIds = JSON.parse(localStorage.getItem(DISMISSED_IDS_KEY) || '[]');
        clearedTime = parseInt(localStorage.getItem(CLEARED_TIME_KEY) || '0', 10);
      } catch {}
    }

    const nowMs = Date.now();
    const automated = getAutomatedIslamicNotifications();
    const localBroadcasts = getLocalAdminBroadcasts();

    // Deduplicate broadcasts by ID
    const broadcastMap = new Map<string, AppNotification>();
    [...firestoreBroadcasts, ...localBroadcasts].forEach(b => {
      broadcastMap.set(b.id, b);
    });

    const all = [...Array.from(broadcastMap.values()), ...automated];

    // Filter rules:
    // 1. Must not have been explicitly dismissed by the user
    // 2. Must not be expired (nowMs < item.expiresAt)
    // 3. Must be active (nowMs >= item.startTime)
    // 4. Must not have started before clearedTime (unless clearedTime was prior to startTime)
    const filtered = all
      .filter(item => {
        if (dismissedIds.includes(item.id)) return false;

        const start = item.startTime ?? item.timestamp;
        const expiry = item.expiresAt ?? (item.fromAdmin ? item.timestamp + 7 * 86400 * 1000 : Infinity);

        if (nowMs < start) return false;
        if (nowMs >= expiry) return false;
        if (start < clearedTime) return false;

        return true;
      })
      .map(item => ({
        ...item,
        time: item.isAutomated ? item.time : formatRelativeTime(item.timestamp),
        unread: !readIds.includes(item.id),
      }))
      .sort((a, b) => b.timestamp - a.timestamp);

    return filtered;
  };

  // Initial call with local + automated
  callback(getCombined());

  // Listen for local updates across tabs & components
  const handleLocalUpdate = () => {
    if (isSubscribed) callback(getCombined());
  };
  window.addEventListener('md-notifications-updated', handleLocalUpdate);
  window.addEventListener('custom-prayer-times-changed', handleLocalUpdate);
  window.addEventListener('storage', handleLocalUpdate);

  // Background ticker: Evaluates every 15 seconds.
  // Guarantees real-time dynamic showing and disappearing based on current time!
  const ticker = setInterval(() => {
    if (isSubscribed) {
      callback(getCombined());
    }
  }, 15000);

  // Firestore real-time listener for admin announcements
  let unsubscribeFirestore = () => {};
  try {
    const q = query(collection(db, 'notifications'), orderBy('createdAtMs', 'desc'), limit(20));
    unsubscribeFirestore = onSnapshot(q, (snapshot) => {
      if (!isSubscribed) return;
      currentFsBroadcasts = snapshot.docs.map(d => {
        const data = d.data();
        const created = data.createdAtMs || Date.now();
        return {
          id: d.id,
          title: data.title || 'Announcement',
          message: data.message || '',
          time: 'Recently',
          timestamp: created,
          startTime: created,
          expiresAt: data.expiresAt || (created + 7 * 86400 * 1000),
          unread: true,
          href: data.href || '/dashboard',
          iconType: (data.iconType as NotificationIconType) || 'admin-broadcast',
          category: data.category || 'Admin Announcement',
          fromAdmin: true,
          isAutomated: false,
        };
      });
      callback(getCombined(currentFsBroadcasts));
    }, (err) => {
      console.warn('Real-time notifications snapshot unavailable, using local & automated fallback:', err);
    });
  } catch (e) {
    console.warn('Firestore subscription bypassed:', e);
  }

  return () => {
    isSubscribed = false;
    clearInterval(ticker);
    window.removeEventListener('md-notifications-updated', handleLocalUpdate);
    window.removeEventListener('custom-prayer-times-changed', handleLocalUpdate);
    window.removeEventListener('storage', handleLocalUpdate);
    unsubscribeFirestore();
  };
}

/**
 * Mark a single notification as read
 */
export function markNotificationRead(id: string) {
  try {
    const readIds: string[] = JSON.parse(localStorage.getItem(READ_IDS_KEY) || '[]');
    if (!readIds.includes(id)) {
      readIds.push(id);
      localStorage.setItem(READ_IDS_KEY, JSON.stringify(readIds));
      window.dispatchEvent(new Event('md-notifications-updated'));
    }
  } catch {}
}

/**
 * Mark all notifications as read
 */
export function markAllNotificationsRead(notifications: AppNotification[]) {
  try {
    const readIds: string[] = JSON.parse(localStorage.getItem(READ_IDS_KEY) || '[]');
    const newIds = Array.from(new Set([...readIds, ...notifications.map(n => n.id)]));
    localStorage.setItem(READ_IDS_KEY, JSON.stringify(newIds));
    window.dispatchEvent(new Event('md-notifications-updated'));
  } catch {}
}

/**
 * Dismiss a single notification so it disappears immediately
 */
export function dismissNotification(id: string) {
  try {
    const list: string[] = JSON.parse(localStorage.getItem(DISMISSED_IDS_KEY) || '[]');
    if (!list.includes(id)) {
      list.push(id);
      localStorage.setItem(DISMISSED_IDS_KEY, JSON.stringify(list));
      window.dispatchEvent(new Event('md-notifications-updated'));
    }
  } catch {}
}

/**
 * Clear all current notifications from view
 */
export function clearAllNotifications() {
  try {
    localStorage.setItem(CLEARED_TIME_KEY, String(Date.now()));
    window.dispatchEvent(new Event('md-notifications-updated'));
  } catch {}
}
