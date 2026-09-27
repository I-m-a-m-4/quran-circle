import { NextResponse } from 'next/server';
import { getVerseContent } from '@/lib/quran-api';
import { LOCAL_VERSE_FALLBACKS } from '@/app/api/quran/personalized/route';

export const dynamic = 'force-static';

const DEFAULT_VERSE_KEYS = ['2:153', '94:5', '2:286', '3:134', '103:3'];

export async function GET(request: Request) {
  try {
    let translationId = 131;
    try {
      const req = request as any;
      if (req && req.url) {
        const { searchParams } = new URL(req.url);
        translationId = parseInt(searchParams.get('translationId') || '131');
      }
    } catch {}

    const shuffledKeys = [...DEFAULT_VERSE_KEYS].sort(() => 0.5 - Math.random());
    const selectedKeys = shuffledKeys.slice(0, 2);

    const versesPromises = selectedKeys.map(async (key) => {
      const content = await getVerseContent(key, translationId);
      if (content) return content;

      const [, verseNum] = key.split(':');
      const local = LOCAL_VERSE_FALLBACKS[key];
      return {
        id: parseInt(verseNum) || 1,
        verse_key: key,
        text_uthmani: local?.arabic || '',
        translations: [{ text: local?.english || '' }]
      };
    });

    const verses = await Promise.all(versesPromises);
    return NextResponse.json(verses.filter(Boolean));
  } catch (error) {
    return NextResponse.json([]);
  }
}
