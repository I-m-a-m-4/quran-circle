import { NextResponse } from 'next/server';
import { getVerseContent } from '@/lib/quran-api';
import { LOCAL_VERSE_FALLBACKS } from '@/app/api/quran/personalized/route';

const DEFAULT_VERSE_KEYS = ['2:153', '94:5', '2:286', '3:134', '103:3'];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const translationId = parseInt(searchParams.get('translationId') || '131');

    // Shuffle and pick exactly two dynamic keys that change on refresh
    const shuffledKeys = [...DEFAULT_VERSE_KEYS].sort(() => 0.5 - Math.random());
    const selectedKeys = shuffledKeys.slice(0, 2);

    const versesPromises = selectedKeys.map(async (key) => {
      const content = await getVerseContent(key, translationId);
      if (content) return content;

      // Fallback to local dictionary if API is down
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
    console.error('Failed to fetch verses:', error);
    return NextResponse.json({ error: 'Failed to fetch verses' }, { status: 500 });
  }
}
