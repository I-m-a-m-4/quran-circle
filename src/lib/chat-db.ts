import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'src/lib/chat.json');

export interface ChatMessage {
  id: string;
  email: string;
  name: string;
  username: string;
  avatar: string;
  message: string;
  timestamp: string;
}

const DEFAULT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg_1',
    email: 'sarah@example.com',
    name: 'Sarah',
    username: 'sarah',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=sarah',
    message: 'Salam everyone! Let’s keep up our consistency today.',
    timestamp: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'msg_2',
    email: 'omar@example.com',
    name: 'Omar',
    username: 'omar',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=omar',
    message: 'Wa Alaykum Assalam! Completed my daily session early today.',
    timestamp: new Date(Date.now() - 1800000).toISOString()
  }
];

export function getChatMessages(userCircleEmails: Set<string>): ChatMessage[] {
  try {
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(DEFAULT_MESSAGES, null, 2), 'utf-8');
      return DEFAULT_MESSAGES.filter(m => userCircleEmails.has(m.email.toLowerCase()));
    }

    const fileData = fs.readFileSync(filePath, 'utf-8');
    if (!fileData || fileData.trim() === '') {
      fs.writeFileSync(filePath, JSON.stringify(DEFAULT_MESSAGES, null, 2), 'utf-8');
      return DEFAULT_MESSAGES.filter(m => userCircleEmails.has(m.email.toLowerCase()));
    }

    const allMessages: ChatMessage[] = JSON.parse(fileData);
    // Filter to only messages from users in the active circle
    return allMessages.filter(m => userCircleEmails.has(m.email.toLowerCase()));
  } catch (e) {
    console.error("Failed to read chat database:", e);
    return [];
  }
}

export function addChatMessage(email: string, name: string, username: string, avatar: string, message: string): ChatMessage {
  try {
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    let allMessages: ChatMessage[] = [];
    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath, 'utf-8');
      if (fileData && fileData.trim() !== '') {
        allMessages = JSON.parse(fileData);
      }
    }

    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      email: email.toLowerCase(),
      name,
      username,
      avatar,
      message,
      timestamp: new Date().toISOString()
    };

    allMessages.push(newMessage);
    fs.writeFileSync(filePath, JSON.stringify(allMessages, null, 2), 'utf-8');
    return newMessage;
  } catch (e) {
    console.error("Failed to write to chat database:", e);
    throw new Error("Failed to send message");
  }
}
