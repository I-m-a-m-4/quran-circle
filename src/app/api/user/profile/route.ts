import { NextResponse } from 'next/server';
import { updateUserProfile } from '@/lib/users-db';

export async function POST(request: Request) {
  try {
    const { email, niyyah, goal } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = updateUserProfile(email, niyyah, goal);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Update Profile API error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
