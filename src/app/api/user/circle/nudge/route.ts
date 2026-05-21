import { NextResponse } from 'next/server';
import { nudgeUser } from '@/lib/users-db';

export async function POST(request: Request) {
  try {
    const { email, username } = await request.json();

    if (!email || !username) {
      return NextResponse.json({ error: 'Email and username are required' }, { status: 400 });
    }

    const result = nudgeUser(email, username);
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: result.message });
  } catch (error) {
    console.error('Nudge user API error:', error);
    return NextResponse.json({ error: 'Failed to send nudge' }, { status: 500 });
  }
}
