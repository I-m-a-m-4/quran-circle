import { NextResponse } from 'next/server';
import { getVerseAudioUrl } from '@/lib/quran-api';

export const dynamic = 'force-static';

export async function GET(request: Request) {
  try {
    let verseKey: string | null = null;
    let reciterId = 7;
    try {
      const req = request as any;
      if (req && req.url) {
        const { searchParams } = new URL(req.url);
        verseKey = searchParams.get('verseKey');
        reciterId = parseInt(searchParams.get('reciterId') || '7');
      }
    } catch {}

    if (!verseKey) {
      return NextResponse.json({ audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/002255.mp3' });
    }

    const audioUrl = await getVerseAudioUrl(verseKey, reciterId);
    return NextResponse.json({ audioUrl });
  } catch (error) {
    return NextResponse.json({ audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/002255.mp3' });
  }
}
