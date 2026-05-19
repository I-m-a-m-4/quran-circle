import { NextResponse } from 'next/server';
import { getUserStreak } from '@/lib/quran-api';

export async function GET() {
  try {
    const streak = await getUserStreak();
    return NextResponse.json({ streak });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch streak' }, { status: 500 });
  }
}
