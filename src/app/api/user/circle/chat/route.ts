import { NextResponse } from 'next/server';
import { getChatMessages, addChatMessage } from '@/lib/chat-db';
import { getUsers } from '@/lib/users-db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email') || '';

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const users = getUsers();
    const currentUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!currentUser) {
      return NextResponse.json([]);
    }

    // Get emails of all circle members
    const circleUsernames = new Set([currentUser.username, ...(currentUser.circleMembers || [])]);
    const circleEmails = new Set(
      users.filter(u => circleUsernames.has(u.username)).map(u => u.email.toLowerCase())
    );

    const messages = getChatMessages(circleEmails);
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Failed to load chat messages:', error);
    return NextResponse.json({ error: 'Failed to load chat messages' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { email, message } = await request.json();

    if (!email || !message) {
      return NextResponse.json({ error: 'Email and message are required' }, { status: 400 });
    }

    const users = getUsers();
    const currentUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const chatMsg = addChatMessage(
      currentUser.email,
      currentUser.name,
      currentUser.username,
      currentUser.avatar,
      message
    );

    return NextResponse.json({ success: true, message: chatMsg });
  } catch (error) {
    console.error('Failed to post chat message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
