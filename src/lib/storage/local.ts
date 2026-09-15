// Local storage utilities for Muslim Desk
// Designed so data model can later be migrated to PostgreSQL/Supabase

export interface AppSettings {
  // Location
  locationMode: 'auto' | 'manual';
  latitude?: number;
  longitude?: number;
  city?: string;
  country?: string;
  timezone?: string;
  // Prayer
  calculationMethod: number; // AlAdhan method ID
  school: number; // 0 = Shafi, 1 = Hanafi
  // Quran
  translationEdition: string;
  audioEdition: string;
  arabicFontSize: number;
  // Appearance
  theme: 'light' | 'dark' | 'system';
  // Notifications
  notificationsEnabled: boolean;
  prayerNotifications: {
    Fajr: boolean;
    Dhuhr: boolean;
    Asr: boolean;
    Maghrib: boolean;
    Isha: boolean;
  };
  notificationMinutesBefore: number;
}

export interface BookmarkItem {
  id: string;
  type: 'ayah' | 'adhkar';
  surahNumber?: number;
  ayahNumber?: number;
  surahName?: string;
  arabicText?: string;
  translation?: string;
  adhkarId?: string;
  adhkarText?: string;
  createdAt: number;
}

export interface Worship {
  date: string; // YYYY-MM-DD
  Fajr: boolean;
  Dhuhr: boolean;
  Asr: boolean;
  Maghrib: boolean;
  Isha: boolean;
  quranMinutes: number;
  morningAdhkar: boolean;
  eveningAdhkar: boolean;
  tasbihCount: number;
}

export interface TasbihSession {
  id: string;
  dhikr: string;
  count: number;
  target: number;
  createdAt: number;
}

export interface ReadingProgress {
  lastSurah: number;
  lastAyah: number;
  updatedAt: number;
}

const KEYS = {
  SETTINGS: 'md_settings',
  BOOKMARKS: 'md_bookmarks',
  WORSHIP: 'md_worship',
  TASBIH: 'md_tasbih',
  READING_PROGRESS: 'md_reading_progress',
} as const;

function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('LocalStorage write failed:', e);
  }
}

// SETTINGS
export const DEFAULT_SETTINGS: AppSettings = {
  locationMode: 'auto',
  calculationMethod: 2,
  school: 0,
  translationEdition: 'en.asad',
  audioEdition: 'ar.alafasy',
  arabicFontSize: 28,
  theme: 'system',
  notificationsEnabled: false,
  prayerNotifications: {
    Fajr: false,
    Dhuhr: false,
    Asr: false,
    Maghrib: false,
    Isha: false,
  },
  notificationMinutesBefore: 0,
};

export function getSettings(): AppSettings {
  return { ...DEFAULT_SETTINGS, ...safeGet<Partial<AppSettings>>(KEYS.SETTINGS, {}) };
}

export function saveSettings(settings: Partial<AppSettings>): void {
  const current = getSettings();
  safeSet(KEYS.SETTINGS, { ...current, ...settings });
}

// BOOKMARKS
export function getBookmarks(): BookmarkItem[] {
  return safeGet<BookmarkItem[]>(KEYS.BOOKMARKS, []);
}

export function addBookmark(item: Omit<BookmarkItem, 'id' | 'createdAt'>): BookmarkItem {
  const bookmarks = getBookmarks();
  const newItem: BookmarkItem = {
    ...item,
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    createdAt: Date.now(),
  };
  safeSet(KEYS.BOOKMARKS, [newItem, ...bookmarks]);
  return newItem;
}

export function removeBookmark(id: string): void {
  const bookmarks = getBookmarks().filter((b) => b.id !== id);
  safeSet(KEYS.BOOKMARKS, bookmarks);
}

export function isBookmarked(surahNumber: number, ayahNumber: number): boolean {
  return getBookmarks().some(
    (b) => b.type === 'ayah' && b.surahNumber === surahNumber && b.ayahNumber === ayahNumber
  );
}

// WORSHIP TRACKING
function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

export function getWorshipLog(): Record<string, Worship> {
  return safeGet<Record<string, Worship>>(KEYS.WORSHIP, {});
}

export function getTodayWorship(): Worship {
  const log = getWorshipLog();
  const today = getTodayKey();
  return (
    log[today] ?? {
      date: today,
      Fajr: false,
      Dhuhr: false,
      Asr: false,
      Maghrib: false,
      Isha: false,
      quranMinutes: 0,
      morningAdhkar: false,
      eveningAdhkar: false,
      tasbihCount: 0,
    }
  );
}

export function updateTodayWorship(update: Partial<Omit<Worship, 'date'>>): void {
  const log = getWorshipLog();
  const today = getTodayKey();
  log[today] = { ...getTodayWorship(), ...update };
  safeSet(KEYS.WORSHIP, log);
}

export function getWorshipStreak(): number {
  const log = getWorshipLog();
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    const entry = log[key];
    if (entry && (entry.Fajr || entry.Dhuhr || entry.Asr || entry.Maghrib || entry.Isha)) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

// TASBIH
export function getTasbihSessions(): TasbihSession[] {
  return safeGet<TasbihSession[]>(KEYS.TASBIH, []);
}

export function saveTasbihSession(session: Omit<TasbihSession, 'id'>): TasbihSession {
  const sessions = getTasbihSessions();
  const newSession: TasbihSession = {
    ...session,
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  };
  safeSet(KEYS.TASBIH, [newSession, ...sessions].slice(0, 100)); // keep last 100
  return newSession;
}

// READING PROGRESS
export function getReadingProgress(): ReadingProgress | null {
  return safeGet<ReadingProgress | null>(KEYS.READING_PROGRESS, null);
}

export function saveReadingProgress(surah: number, ayah: number): void {
  safeSet(KEYS.READING_PROGRESS, { lastSurah: surah, lastAyah: ayah, updatedAt: Date.now() });
}
