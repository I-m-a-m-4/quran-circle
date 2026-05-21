import fs from 'fs';
import path from 'path';
import { SURAH_NAMES } from './quran-api';

const filePath = path.join(process.cwd(), 'src/lib/activities.json');

export interface ActivityRecord {
  id: string;
  userEmail: string;
  verseKey: string;
  surahName: string;
  timestamp: string;
  duration: number;
}

// Generate templates for a specific user
const getInitialTemplates = (email: string): ActivityRecord[] => [
  {
    id: `act_1_${Date.now()}`,
    userEmail: email.toLowerCase(),
    verseKey: '2:153',
    surahName: 'Al-Baqarah',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
    duration: 5
  },
  {
    id: `act_2_${Date.now()}`,
    userEmail: email.toLowerCase(),
    verseKey: '94:5',
    surahName: 'Ash-Sharh',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    duration: 5
  },
  {
    id: `act_3_${Date.now()}`,
    userEmail: email.toLowerCase(),
    verseKey: '18:1',
    surahName: 'Al-Kahf',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    duration: 5
  },
  {
    id: `act_4_${Date.now()}`,
    userEmail: email.toLowerCase(),
    verseKey: '112:1',
    surahName: 'Al-Ikhlas',
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    duration: 5
  },
  {
    id: `act_5_${Date.now()}`,
    userEmail: email.toLowerCase(),
    verseKey: '110:1-3',
    surahName: 'An-Nasr',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    duration: 5
  }
];

export function getActivities(userEmail?: string): ActivityRecord[] {
  try {
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    let list: ActivityRecord[] = [];
    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath, 'utf-8');
      if (fileData && fileData.trim() !== '') {
        list = JSON.parse(fileData);
      }
    }

    if (userEmail) {
      const cleanEmail = userEmail.toLowerCase();
      // Filter list to see if this user has any activities
      const userList = list.filter(a => a.userEmail === cleanEmail);
      
      // If the user has no history, seed their initial 5 default templates
      if (userList.length === 0) {
        const templates = getInitialTemplates(cleanEmail);
        list.push(...templates);
        saveActivities(list);
        return templates;
      }
      return userList;
    }
    
    return list;
  } catch (e) {
    console.error("Failed to read activities database:", e);
    return [];
  }
}

export function saveActivities(activities: ActivityRecord[]) {
  try {
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(activities, null, 2), 'utf-8');
  } catch (e) {
    console.error("Failed to write to activities database:", e);
  }
}

export function addActivity(userEmail: string, verseKey: string, duration: number) {
  const surahNum = parseInt(verseKey.split(':')[0]) || 1;
  const surahName = SURAH_NAMES[surahNum] || `Surah ${surahNum}`;
  
  const activities = getActivities();
  const newActivity: ActivityRecord = {
    id: `act_${Date.now()}`,
    userEmail: userEmail.toLowerCase(),
    verseKey,
    surahName,
    timestamp: new Date().toISOString(),
    duration
  };
  
  activities.unshift(newActivity);
  saveActivities(activities);
  return newActivity;
}
