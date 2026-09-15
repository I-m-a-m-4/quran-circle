/**
 * Offline Quran Storage - Abstraction Layer
 * 
 * Currently uses IndexedDB for the browser/Next.js phase.
 * When migrated to Tauri, swap this module to use `tauri-plugin-sql` 
 * with SQLite — the interface (get/set/clear) stays identical.
 */

const DB_NAME = 'muslim-desk-quran';
const DB_VERSION = 1;
const STORE_SURAHS = 'surahs';
const STORE_AUDIO = 'audio-urls';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('SSR'));
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_SURAHS)) {
        db.createObjectStore(STORE_SURAHS, { keyPath: 'surahNumber' });
      }
      if (!db.objectStoreNames.contains(STORE_AUDIO)) {
        db.createObjectStore(STORE_AUDIO, { keyPath: 'key' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export interface CachedSurah {
  surahNumber: number;
  name: string;
  arabicName: string;
  ayahs: {
    verseKey: string;
    numberInSurah: number;
    arabicText: string;
    translation: string;
  }[];
  cachedAt: number;
}

// Save a full surah to offline cache
export async function saveSurahOffline(surah: CachedSurah): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_SURAHS, 'readwrite');
    tx.objectStore(STORE_SURAHS).put({ ...surah, cachedAt: Date.now() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Retrieve a single surah from offline cache
export async function getSurahOffline(surahNumber: number): Promise<CachedSurah | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_SURAHS, 'readonly');
      const req = tx.objectStore(STORE_SURAHS).get(surahNumber);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

// Get list of all cached surah numbers
export async function getCachedSurahNumbers(): Promise<number[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_SURAHS, 'readonly');
      const req = tx.objectStore(STORE_SURAHS).getAllKeys();
      req.onsuccess = () => resolve(req.result as number[]);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

// Clear all cached surahs
export async function clearOfflineCache(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_SURAHS, 'readwrite');
    tx.objectStore(STORE_SURAHS).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
