export interface QuranSurah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface QuranAyah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean | object;
  audio?: string;
  translation?: string;
}

export interface QuranEdition {
  identifier: string;
  language: string;
  name: string;
  englishName: string;
  format: string;
  type: string;
  direction?: string;
}

const BASE_URL = 'https://api.alquran.cloud/v1';

export async function getSurahs(): Promise<QuranSurah[]> {
  try {
    const response = await fetch(`${BASE_URL}/surah`, {
      next: { revalidate: 86400 * 30 }, // Cache for 30 days
    });

    if (!response.ok) {
      throw new Error(`AlQuran Cloud API error: ${response.statusText}`);
    }

    const json = await response.json();
    return json.data;
  } catch (error) {
    console.error('Error fetching surahs:', error);
    return [];
  }
}

export async function getSurah(
  surahNumber: number,
  edition: string = 'quran-uthmani'
): Promise<{ surah: QuranSurah; ayahs: QuranAyah[] } | null> {
  try {
    const response = await fetch(`${BASE_URL}/surah/${surahNumber}/${edition}`, {
      next: { revalidate: 86400 * 30 }, // Cache for 30 days
    });

    if (!response.ok) {
      throw new Error(`AlQuran Cloud API error: ${response.statusText}`);
    }

    const json = await response.json();
    const data = json.data;
    const { ayahs, ...surah } = data;
    return { surah, ayahs };
  } catch (error) {
    console.error(`Error fetching surah ${surahNumber}:`, error);
    return null;
  }
}

export async function getSurahWithTranslationAndAudio(
  surahNumber: number,
  translationEdition: string = 'en.asad',
  audioEdition: string = 'ar.alafasy'
): Promise<{ surah: QuranSurah; ayahs: QuranAyah[] } | null> {
  try {
    // Fetch original Arabic text
    const arabicRes = await fetch(`${BASE_URL}/surah/${surahNumber}/quran-uthmani`, {
      next: { revalidate: 86400 * 30 },
    });
    // Fetch translation
    const translationRes = await fetch(`${BASE_URL}/surah/${surahNumber}/${translationEdition}`, {
      next: { revalidate: 86400 * 30 },
    });
    // Fetch audio
    const audioRes = await fetch(`${BASE_URL}/surah/${surahNumber}/${audioEdition}`, {
      next: { revalidate: 86400 * 30 },
    });

    if (!arabicRes.ok || !translationRes.ok || !audioRes.ok) {
      throw new Error('Error fetching comprehensive surah data from AlQuran Cloud');
    }

    const arabicJson = await arabicRes.json();
    const translationJson = await translationRes.json();
    const audioJson = await audioRes.json();

    const arabicData = arabicJson.data;
    const translationData = translationJson.data;
    const audioData = audioJson.data;

    const { ayahs: arabicAyahs, ...surah } = arabicData;

    // Combine data
    const ayahs = arabicAyahs.map((ayah: any, index: number) => ({
      ...ayah,
      translation: translationData.ayahs[index].text,
      audio: audioData.ayahs[index].audio,
    }));

    return { surah, ayahs };
  } catch (error) {
    console.error(`Error fetching comprehensive surah ${surahNumber}:`, error);
    return null;
  }
}

export async function searchQuran(query: string, language: string = 'en'): Promise<any> {
  try {
    const response = await fetch(`${BASE_URL}/search/${query}/all/${language}`, {
      next: { revalidate: 86400 }, // Cache for 1 day
    });

    if (!response.ok) {
      throw new Error(`AlQuran Cloud API error: ${response.statusText}`);
    }

    const json = await response.json();
    return json.data;
  } catch (error) {
    console.error('Error searching Quran:', error);
    return null;
  }
}
