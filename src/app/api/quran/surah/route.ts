import { NextResponse } from 'next/server';
import { getAccessToken } from '@/lib/quran-api';

const BASE_URL = process.env.QF_ENV === 'production'
  ? 'https://apis.quran.foundation/content/api/v4'
  : 'https://apis-prelive.quran.foundation/content/api/v4';

// Default to Saheeh International, but accept any QF translation ID
const DEFAULT_TRANSLATION = 131;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const surahNumber = searchParams.get('surah');
    const translationId = parseInt(searchParams.get('translation') || String(DEFAULT_TRANSLATION), 10);

    if (!surahNumber) {
      return NextResponse.json({ error: 'Missing surah parameter' }, { status: 400 });
    }

    // 1. Try authenticated Quran Foundation API
    try {
      const token = await getAccessToken();
      const response = await fetch(
        `${BASE_URL}/verses/by_chapter/${surahNumber}?language=en&words=true&translations=${translationId}&fields=text_uthmani&per_page=300`,
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
      } else {
        console.warn('QF API by_chapter returned:', response.status);
      }
    } catch (authErr) {
      console.warn('Authenticated QF API failed, trying public backup:', authErr);
    }

    // 2. Backup: public Quran.com API
    try {
      const backupUrl = `https://api.quran.com/api/v4/verses/by_chapter/${surahNumber}?language=en&words=true&translations=${translationId}&fields=text_uthmani&per_page=300`;
      
      const backupRes = await fetch(backupUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        }
      });
      
      if (backupRes.ok) {
        const backupData = await backupRes.json();
        return NextResponse.json({ verses: backupData.verses });
      } else {
        console.warn('Backup Quran.com API returned:', backupRes.status);
      }
    } catch (backupErr) {
      console.error('Backup QF API failed:', backupErr);
    }

    return NextResponse.json(
      { error: 'Verses not available at this time.' },
      { status: 502 }
    );
  } catch (error) {
    console.error('Quran chapter route error:', error);
    return NextResponse.json({ error: 'Failed to fetch chapter' }, { status: 500 });
  }
}
