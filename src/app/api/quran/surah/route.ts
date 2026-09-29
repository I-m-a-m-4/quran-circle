import { NextResponse } from 'next/server';
import { getAccessToken } from '@/lib/quran-api';

const BASE_URL = process.env.QF_ENV === 'production'
  ? 'https://apis.quran.foundation/content/api/v4'
  : 'https://apis-prelive.quran.foundation/content/api/v4';

const DEFAULT_TRANSLATION = 131;

export const dynamic = 'force-static';

export async function GET(request: Request) {
  try {
    let surahNumber: string | null = null;
    let translationId = DEFAULT_TRANSLATION;
    try {
      const req = request as any;
      if (req && req.url) {
        const { searchParams } = new URL(req.url);
        surahNumber = searchParams.get('surah');
        translationId = parseInt(searchParams.get('translation') || String(DEFAULT_TRANSLATION), 10);
      }
    } catch {}

    if (!surahNumber) {
      return NextResponse.json({ verses: [] });
    }

    const translationsParam = translationId === 57 ? '57' : `${translationId},57`;

    try {
      const token = await getAccessToken();
      const response = await fetch(
        `${BASE_URL}/verses/by_chapter/${surahNumber}?language=en&words=false&translations=${translationsParam}&fields=text_uthmani&per_page=300`,
        {
          headers: {
            'x-auth-token': token,
            'x-client-id': process.env.QF_CLIENT_ID || '',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({ verses: data.verses });
      }
    } catch (authErr) {}

    try {
      const backupUrl = `https://api.quran.com/api/v4/verses/by_chapter/${surahNumber}?language=en&words=false&translations=${translationsParam}&fields=text_uthmani&per_page=300`;
      const backupRes = await fetch(backupUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      if (backupRes.ok) {
        const backupData = await backupRes.json();
        return NextResponse.json({ verses: backupData.verses });
      }
    } catch (backupErr) {}

    return NextResponse.json({ verses: [] });
  } catch (error) {
    return NextResponse.json({ verses: [] });
  }
}
