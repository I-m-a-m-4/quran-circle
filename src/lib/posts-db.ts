import fs from 'fs';
import path from 'path';
import { getUsers } from './users-db';

const filePath = path.join(process.cwd(), 'src/lib/posts.json');

export interface PostRecord {
  id: string;
  userName: string;
  userEmail: string;
  userAvatar: string;
  content: string;
  verseKey: string;
  timestamp: string;
}

const DEFAULT_POSTS: PostRecord[] = [
  {
    id: 'post_1',
    userName: 'Sarah',
    userEmail: 'sarah@example.com',
    userAvatar: 'https://picsum.photos/seed/user2/100/100',
    content: "Patience and steadfastness are so vital when we face decisions. Seeking help through prayer is a reminder that we are never alone on this path.",
    verseKey: '2:153',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
  },
  {
    id: 'post_2',
    userName: 'Omar',
    userEmail: 'omar@example.com',
    userAvatar: 'https://picsum.photos/seed/user3/100/100',
    content: "Quran Memorization becomes easier when you reflect deeply on the meaning first. Today's verse really opened my eyes.",
    verseKey: '94:5',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
  }
];

export function getPosts(): PostRecord[] {
  try {
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(DEFAULT_POSTS, null, 2), 'utf-8');
      return DEFAULT_POSTS;
    }
    
    const fileData = fs.readFileSync(filePath, 'utf-8');
    if (!fileData || fileData.trim() === '') {
      fs.writeFileSync(filePath, JSON.stringify(DEFAULT_POSTS, null, 2), 'utf-8');
      return DEFAULT_POSTS;
    }
    
    return JSON.parse(fileData);
  } catch (e) {
    console.error("Failed to read posts database:", e);
    return DEFAULT_POSTS;
  }
}

export function savePosts(posts: PostRecord[]) {
  try {
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(posts, null, 2), 'utf-8');
  } catch (e) {
    console.error("Failed to write to posts database:", e);
  }
}

export function addPost(userEmail: string, content: string, verseKey: string) {
  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === userEmail.toLowerCase());
  
  const posts = getPosts();
  const newPost: PostRecord = {
    id: `post_${Date.now()}`,
    userName: user ? user.name : 'Anonymous',
    userEmail: userEmail,
    userAvatar: user ? user.avatar : 'https://picsum.photos/seed/anon/100/100',
    content,
    verseKey,
    timestamp: new Date().toISOString()
  };
  
  posts.unshift(newPost);
  savePosts(posts);
  return newPost;
}
