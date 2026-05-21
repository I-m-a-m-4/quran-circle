import { NextResponse } from 'next/server';
import { clearNudges } from '@/lib/users-db';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    clearNudges(email);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Clear nudges API error:', error);
    return NextResponse.json({ error: 'Failed to clear nudges' }, { status: 500 });
  }
}
