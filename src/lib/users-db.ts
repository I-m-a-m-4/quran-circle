import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'src/lib/users.json');

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  username: string;
  niyyah?: string;
  goal?: string;
  streak: number;
  completedToday: boolean;
  avatar: string;
  lastActiveDate?: string;
  circleMembers: string[]; // List of usernames in this user's circle
  receivedNudges: string[]; // List of usernames who nudged this user
  activeSession?: {
    verseKey: string;
    niyyah: string;
    startTime: string;
    duration: number;
  };
}

const DEFAULT_USERS: UserRecord[] = [
  { id: 'user_1', name: "Bello Imam", email: "bello@example.com", username: "bello", niyyah: "Spiritual Consistency", goal: "Daily Quran Reading (5 mins)", streak: 5, completedToday: false, avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=bello", circleMembers: [], receivedNudges: [] },
  { id: 'user_2', name: "Sarah", email: "sarah@example.com", username: "sarah", niyyah: "Patience and Peace", goal: "Daily Reflection & Tafsir", streak: 8, completedToday: true, avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=sarah", circleMembers: [], receivedNudges: [] },
  { id: 'user_3', name: "Omar", email: "omar@example.com", username: "omar", niyyah: "Memorization", goal: "Memorization (Hifzh)", streak: 12, completedToday: true, avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=omar", circleMembers: [], receivedNudges: [] },
  { id: 'user_4', name: "Fatima", email: "fatima@example.com", username: "fatima", niyyah: "Closeness to Allah", goal: "Surah Progress Tracking", streak: 15, completedToday: false, avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=fatima", circleMembers: [], receivedNudges: [] }
];

export function getUsers(): UserRecord[] {
  try {
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    let loadedUsers: any[] = [];
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(DEFAULT_USERS, null, 2), 'utf-8');
      loadedUsers = DEFAULT_USERS;
    } else {
      const fileData = fs.readFileSync(filePath, 'utf-8');
      if (!fileData || fileData.trim() === '') {
        fs.writeFileSync(filePath, JSON.stringify(DEFAULT_USERS, null, 2), 'utf-8');
        loadedUsers = DEFAULT_USERS;
      } else {
        loadedUsers = JSON.parse(fileData);
      }
    }

    // Ensure all users have username, circleMembers, and receivedNudges
    let modified = false;
    const migrated = loadedUsers.map(u => {
      const updates: any = {};
      if (!u.username) {
        updates.username = u.email.split('@')[0].toLowerCase();
        modified = true;
      }
      if (!u.circleMembers) {
        updates.circleMembers = [];
        modified = true;
      }
      if (!u.receivedNudges) {
        updates.receivedNudges = [];
        modified = true;
      }
      return { ...u, ...updates };
    });

    if (modified) {
      saveUsers(migrated);
    }
    return migrated;
  } catch (e) {
    console.error("Failed to read users database:", e);
    return DEFAULT_USERS;
  }
}

export function saveUsers(users: UserRecord[]) {
  try {
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(users, null, 2), 'utf-8');
  } catch (e) {
    console.error("Failed to write to users database:", e);
  }
}

export function addUser(name: string, email: string) {
  const users = getUsers();
  
  // Check if user already exists
  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return existing;
  }

  const username = email.split('@')[0].toLowerCase();
  const newId = `user_${Date.now()}`;
  const newUser: UserRecord = {
    id: newId,
    name,
    email,
    username,
    niyyah: "Spiritual Consistency",
    goal: "Daily Quran Reading (5 mins)",
    streak: 0,
    completedToday: false,
    avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${username}`,
    circleMembers: [],
    receivedNudges: []
  };

  users.push(newUser);
  saveUsers(users);
  return newUser;
}

export function updateUserProfile(email: string, niyyah?: string, goal?: string) {
  const users = getUsers();
  const index = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
  if (index >= 0) {
    if (niyyah) users[index].niyyah = niyyah;
    if (goal) users[index].goal = goal;
    saveUsers(users);
    return users[index];
  }
  return null;
}

export function completeUserHabit(email: string) {
  const users = getUsers();
  const index = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
  if (index >= 0) {
    if (!users[index].completedToday) {
      users[index].completedToday = true;
      users[index].streak += 1;
      users[index].lastActiveDate = new Date().toISOString().split('T')[0];
      
      // Update any circle members' view (if stored locally)
      saveUsers(users);
    }
    return users[index];
  }
  return null;
}

export function addCircleMember(userEmail: string, memberUsername: string): { success: boolean; message: string; member?: any } {
  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === userEmail.toLowerCase());
  if (!user) {
    return { success: false, message: "User not found" };
  }

  const cleanUsername = memberUsername.trim().toLowerCase();
  
  // Can't add yourself
  if (user.username === cleanUsername) {
    return { success: false, message: "You cannot add yourself to your own circle" };
  }

  // Find the target member in registered users
  const targetMember = users.find(u => u.username === cleanUsername);
  if (!targetMember) {
    return { success: false, message: `No user found with username "${cleanUsername}"` };
  }

  // Check if already in circle
  if (user.circleMembers.includes(cleanUsername)) {
    return { success: false, message: `"${cleanUsername}" is already in your circle` };
  }

  // Add the member to the user's circle
  user.circleMembers.push(cleanUsername);
  
  // For bi-directional circle accountability, also add this user to the target's circle!
  if (!targetMember.circleMembers.includes(user.username)) {
    targetMember.circleMembers.push(user.username);
  }

  saveUsers(users);
  return { success: true, message: `Successfully added ${targetMember.name} to your circle!`, member: targetMember };
}

export function nudgeUser(fromEmail: string, targetUsername: string): { success: boolean; message: string } {
  const users = getUsers();
  const fromUser = users.find(u => u.email.toLowerCase() === fromEmail.toLowerCase());
  const targetUser = users.find(u => u.username === targetUsername.trim().toLowerCase());

  if (!fromUser || !targetUser) {
    return { success: false, message: "User or target not found" };
  }

  if (!targetUser.receivedNudges.includes(fromUser.username)) {
    targetUser.receivedNudges.push(fromUser.username);
    saveUsers(users);
  }

  return { success: true, message: `Nudged ${targetUser.name}!` };
}

export function clearNudges(email: string) {
  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (user && user.receivedNudges.length > 0) {
    user.receivedNudges = [];
    saveUsers(users);
  }
}
