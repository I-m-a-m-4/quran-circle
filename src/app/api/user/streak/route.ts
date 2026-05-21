import { NextResponse } from 'next/server';
import { getUsers } from '@/lib/users-db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email') || 'bello@example.com';
    
    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    return NextResponse.json({ streak: user ? user.streak : 0 });
  } catch (error) {
    console.error('Streak fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch streak' }, { status: 500 });
  }
}
