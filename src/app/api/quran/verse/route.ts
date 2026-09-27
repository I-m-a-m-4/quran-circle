import { NextResponse } from 'next/server';
import { getRandomVerse, getVerseContent } from '@/lib/quran-api';

export const dynamic = 'force-static';

export async function GET(request: Request) {
  try {
    let verseKey: string | null = null;
    try {
      const req = request as any;
      if (req && req.url) {
        const { searchParams } = new URL(req.url);
        verseKey = searchParams.get('verseKey');
      }
    } catch {}

    let verse;
    if (verseKey) {
      verse = await getVerseContent(verseKey);
    } else {
      verse = await getRandomVerse();
    }

    if (!verse) {
      return NextResponse.json({
        id: 255,
        verse_key: '2:255',
        text_uthmani: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ',
        translations: [{ text: 'Allah - there is no deity except Him, the Ever-Living, the Sustainer of [all] existence.' }]
      });
    }

    return NextResponse.json(verse);
  } catch (error) {
    return NextResponse.json({
      id: 255,
      verse_key: '2:255',
      text_uthmani: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ',
      translations: [{ text: 'Allah - there is no deity except Him, the Ever-Living, the Sustainer of [all] existence.' }]
    });
  }
}
