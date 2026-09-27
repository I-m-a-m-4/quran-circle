import { NextResponse } from 'next/server';
import { getAccessToken } from '@/lib/quran-api';

const BASE_URL = process.env.QF_ENV === 'production'
  ? 'https://apis.quran.foundation/content/api/v4'
  : 'https://apis-prelive.quran.foundation/content/api/v4';

const TAFSIR_IDS: Record<string, number> = {
  'ibn-kathir': 169,
  'maarif': 168,
};

export const dynamic = 'force-static';

export async function GET(request: Request) {
  try {
    let verseKey: string | null = null;
    let tafsirSlug = 'ibn-kathir';
    try {
      const req = request as any;
      if (req && req.url) {
        const { searchParams } = new URL(req.url);
        verseKey = searchParams.get('verseKey');
        tafsirSlug = searchParams.get('tafsir') || 'ibn-kathir';
      }
    } catch {}

    if (!verseKey || !/^\d+:\d+$/.test(verseKey)) {
      return NextResponse.json({ text: '' });
    }

    const tafsirId = TAFSIR_IDS[tafsirSlug] || 169;

    try {
      const token = await getAccessToken();
      const response = await fetch(
        `${BASE_URL}/tafsirs/${tafsirId}/by_ayah/${verseKey}`,
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
        if (data.tafsir?.text) {
          return NextResponse.json({
            verseKey,
            tafsirId,
            tafsirName: tafsirSlug === 'maarif' ? "Ma'arif al-Qur'an" : 'Ibn Kathir (Abridged)',
            text: data.tafsir.text,
          });
        }
      }
    } catch (authErr) {}

    try {
      const backupRes = await fetch(`https://api.quran.com/api/v4/tafsirs/${tafsirId}/by_ayah/${verseKey}`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      if (backupRes.ok) {
        const backupData = await backupRes.json();
        if (backupData.tafsir?.text) {
          return NextResponse.json({
            verseKey,
            tafsirId,
            tafsirName: tafsirSlug === 'maarif' ? "Ma'arif al-Qur'an" : 'Ibn Kathir (Abridged)',
            text: backupData.tafsir.text,
          });
        }
      }
    } catch (backupErr) {}

    return NextResponse.json({ text: '' });
  } catch (error) {
    return NextResponse.json({ text: '' });
  }
}
