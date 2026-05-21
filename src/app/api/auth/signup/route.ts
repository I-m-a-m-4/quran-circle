import { NextResponse } from 'next/server';
import { addUser } from '@/lib/users-db';

export async function POST(request: Request) {
  try {
    const { name, email } = await request.json();
    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const user = addUser(name, email);
    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Signup API error:', error);
    return NextResponse.json({ error: 'Failed to complete registration' }, { status: 500 });
  }
}
