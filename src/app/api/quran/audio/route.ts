import { NextResponse } from 'next/server';
import { getVerseAudioUrl } from '@/lib/quran-api';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const verseKey = searchParams.get('verseKey');
    const reciterId = parseInt(searchParams.get('reciterId') || '7');

    if (!verseKey) {
      return NextResponse.json({ error: 'Missing verseKey parameter' }, { status: 400 });
    }

    const audioUrl = await getVerseAudioUrl(verseKey, reciterId);
    return NextResponse.json({ audioUrl });
  } catch (error) {
    console.error('Audio API endpoint error:', error);
    return NextResponse.json({ error: 'Failed to fetch audio url' }, { status: 500 });
  }
}
