'use client';

export interface AudioAlarm {
  id: string;
  label: string;
  time: string; // HH:MM (24-hour format)
  enabled: boolean;
  repeatDays: number[]; // 0 = Sunday, 1 = Monday, 2 = Tuesday, 3 = Wednesday, 4 = Thursday, 5 = Friday, 6 = Saturday. Empty = Once
  soundType: 'preset' | 'custom';
  presetId?: string;
  presetName?: string;
  presetUrl?: string;
  customAudioId?: string;
  customAudioFileName?: string;
  volume: number; // 0 to 1
  snoozeMinutes: number;
  createdAt: number;
  lastTriggeredKey?: string; // YYYY-MM-DD-HH:MM to prevent double-firing in the same minute
}

export const PRESET_ALARM_SOUNDS = [
  { id: 'azan-abdullah', name: 'Makkah Adhan (Abdullah)', url: '/azan-abdullah.m4a' },
  { id: 'azan-custom2', name: 'Special Adhan Recitation', url: '/azan-custom2.m4a' },
];

const ALARMS_STORAGE_KEY = 'md_audio_alarms';
const AUDIO_BLOBS_STORAGE_KEY = 'md_custom_audio_blobs_';

/**
 * Default starter alarms
 */
export const DEFAULT_INITIAL_ALARMS: AudioAlarm[] = [
  {
    id: 'alarm-sunnah-fasting',
    label: '🌙 Monday & Thursday Sunnah Fasting (Suhoor)',
    time: '04:30',
    enabled: true,
    repeatDays: [1, 4], // Monday & Thursday
    soundType: 'preset',
    presetId: 'azan-abdullah',
    presetName: 'Makkah Adhan (Abdullah)',
    presetUrl: '/azan-abdullah.m4a',
    volume: 0.9,
    snoozeMinutes: 5,
    createdAt: Date.now(),
  },
  {
    id: 'alarm-tahajjud',
    label: '🌌 Tahajjud Awakening (Last Third of Night)',
    time: '03:45',
    enabled: false,
    repeatDays: [0, 1, 2, 3, 4, 5, 6], // Every day
    soundType: 'preset',
    presetId: 'azan-custom2',
    presetName: 'Special Adhan Recitation',
    presetUrl: '/azan-custom2.m4a',
    volume: 0.8,
    snoozeMinutes: 10,
    createdAt: Date.now(),
  },
  {
    id: 'alarm-kahf-friday',
    label: '📖 Friday Surah Al-Kahf Reading',
    time: '09:30',
    enabled: true,
    repeatDays: [5], // Friday
    soundType: 'preset',
    presetId: 'azan-abdullah',
    presetName: 'Makkah Adhan (Abdullah)',
    presetUrl: '/azan-abdullah.m4a',
    volume: 0.85,
    snoozeMinutes: 15,
    createdAt: Date.now(),
  }
];

/**
 * Get all alarms from localStorage
 */
export function getAlarms(): AudioAlarm[] {
  if (typeof window === 'undefined') return DEFAULT_INITIAL_ALARMS;
  try {
    const raw = localStorage.getItem(ALARMS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ALARMS_STORAGE_KEY, JSON.stringify(DEFAULT_INITIAL_ALARMS));
      return DEFAULT_INITIAL_ALARMS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_INITIAL_ALARMS;
  }
}

/**
 * Save alarms to localStorage and broadcast change event
 */
export function saveAlarms(alarms: AudioAlarm[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ALARMS_STORAGE_KEY, JSON.stringify(alarms));
    window.dispatchEvent(new Event('md-alarms-updated'));
  } catch (err) {
    console.error('Failed to save alarms to localStorage:', err);
  }
}

/**
 * Add or update an alarm
 */
export function upsertAlarm(alarm: AudioAlarm) {
  const current = getAlarms();
  const index = current.findIndex(a => a.id === alarm.id);
  let updated: AudioAlarm[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = alarm;
  } else {
    updated = [alarm, ...current];
  }
  saveAlarms(updated);
}

/**
 * Toggle alarm on/off
 */
export function toggleAlarm(id: string, enabled?: boolean) {
  const current = getAlarms();
  const updated = current.map(a => {
    if (a.id === id) {
      return { ...a, enabled: enabled !== undefined ? enabled : !a.enabled };
    }
    return a;
  });
  saveAlarms(updated);
}

/**
 * Delete an alarm
 */
export function deleteAlarm(id: string) {
  const current = getAlarms();
  const alarm = current.find(a => a.id === id);
  if (alarm?.customAudioId) {
    removeCustomAudio(alarm.customAudioId);
  }
  const updated = current.filter(a => a.id !== id);
  saveAlarms(updated);
}

/**
 * Store custom uploaded audio file (as base64 data URL) in IndexedDB with localStorage fallback
 */
export async function saveCustomAudio(file: File): Promise<{ audioId: string; fileName: string; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const audioId = `custom-audio-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      try {
        // Try IndexedDB first
        saveToIndexedDB(audioId, dataUrl).then(() => {
          resolve({ audioId, fileName: file.name, dataUrl });
        }).catch(() => {
          // Fallback to localStorage
          try {
            localStorage.setItem(AUDIO_BLOBS_STORAGE_KEY + audioId, dataUrl);
            resolve({ audioId, fileName: file.name, dataUrl });
          } catch (e) {
            reject(new Error('Audio file is too large for storage. Please choose a file under 5MB.'));
          }
        });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read audio file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Retrieve custom audio data URL by ID
 */
export async function getCustomAudioDataUrl(audioId: string): Promise<string | null> {
  try {
    const fromIdb = await getFromIndexedDB(audioId);
    if (fromIdb) return fromIdb;
  } catch {}

  try {
    const fromLocal = localStorage.getItem(AUDIO_BLOBS_STORAGE_KEY + audioId);
    if (fromLocal) return fromLocal;
  } catch {}

  return null;
}

/**
 * Remove custom audio
 */
export async function removeCustomAudio(audioId: string) {
  try {
    localStorage.removeItem(AUDIO_BLOBS_STORAGE_KEY + audioId);
  } catch {}
  try {
    await deleteFromIndexedDB(audioId);
  } catch {}
}

/* ─── IndexedDB Utility ─── */
const IDB_NAME = 'muslim_desk_audio_db';
const IDB_STORE = 'custom_audio_tracks';

function openIDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'));
    }
    const request = indexedDB.open(IDB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveToIndexedDB(id: string, dataUrl: string): Promise<void> {
  const db = await openIDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).put({ id, dataUrl, savedAt: Date.now() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getFromIndexedDB(id: string): Promise<string | null> {
  const db = await openIDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readonly');
    const req = tx.objectStore(IDB_STORE).get(id);
    req.onsuccess = () => resolve(req.result ? req.result.dataUrl : null);
    req.onerror = () => reject(req.error);
  });
}

async function deleteFromIndexedDB(id: string): Promise<void> {
  const db = await openIDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Format repeat days into readable label
 */
export function formatRepeatDays(days: number[]): string {
  if (days.length === 0) return 'Once';
  if (days.length === 7) return 'Every day';
  if (days.length === 2 && days.includes(1) && days.includes(4)) {
    return 'Sunnah Fasting (Mon & Thu)';
  }
  if (days.length === 5 && !days.includes(0) && !days.includes(6)) {
    return 'Weekdays (Mon-Fri)';
  }
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days.map(d => dayNames[d]).join(', ');
}
