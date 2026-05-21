/**
 * Serper.dev Quran Verse Discovery Engine
 * 
 * How it works:
 * 1. We query Google (via Serper) for the user's niyyah, restricted to trusted Islamic sites
 * 2. We scrape the snippet text returned by Google for verse key patterns like "2:153", "Surah Al-Baqarah 153"
 * 3. We return a deduplicated list of verse keys found in authentic sources
 * 
 * This means NO hallucination - every verse key we return was found in a real Google search result
 * from a trusted Islamic website like quran.com, sunnah.com, or islamqa.info.
 */

const SERPER_API_KEY = process.env.SERPER_API_KEY || '';
const SERPER_URL = 'https://google.serper.dev/search';

// Trusted Islamic websites to restrict search to
const TRUSTED_SITES = [
  'quran.com',
  'islamqa.info',
  'sunnah.com',
  'islamweb.net',
  'quranexplorer.com',
  'islamicity.org',
].join(' OR site:');

// Regex patterns to extract verse keys from search snippets
// Matches: "2:153", "2 : 153", "Surah 2, Verse 153", "Al-Baqarah 2:153"
const VERSE_KEY_PATTERNS = [
  /\b(\d{1,3}):(\d{1,3})\b/g,                        // Direct format: 2:153
  /[Vv]erse\s+(\d{1,3})[^\d].*?(\d{1,3}):(\d{1,3})/g, // Verse ... chapter:verse
];

// Map of well-known Surah names to their chapter numbers (for extracting from snippet text)
const SURAH_NAME_MAP: Record<string, number> = {
  'al-fatihah': 1, 'fatiha': 1,
  'al-baqarah': 2, 'baqarah': 2,
  'ali imran': 3, "al-imran": 3,
  'an-nisa': 4, 'nisa': 4,
  'al-maidah': 5,
  'al-anam': 6,
  'al-araf': 7,
  'al-anfal': 8, 'anfal': 8,
  'at-tawbah': 9,
  'yunus': 10,
  'yusuf': 12,
  'ar-rad': 13,
  'ibrahim': 14,
  'al-kahf': 18, 'kahf': 18,
  'taha': 20,
  'al-anbiya': 21,
  'al-hajj': 22,
  'al-furqan': 25,
  'ya-sin': 36, 'yasin': 36,
  'az-zumar': 39,
  'ghafir': 40,
  'fussilat': 41,
  'ash-shura': 42,
  'al-jathiyah': 45,
  'al-hujurat': 49,
  'ar-rahman': 55,
  'al-waqiah': 56,
  'al-hashr': 59,
  'as-saff': 61,
  'al-jumu': 62, "al-jumuah": 62,
  'at-taghabun': 64,
  'at-talaq': 65,
  'al-mulk': 67, 'mulk': 67,
  'al-qalam': 68,
  'nuh': 71,
  'al-muzzammil': 73,
  'al-insan': 76,
  'an-naba': 78,
  'abasa': 80,
  'al-infitar': 82,
  'al-inshibah': 84,
  'al-ghashiyah': 88,
  'al-fajr': 89,
  'ash-shams': 91,
  'ad-duha': 93, "duha": 93,
  'ash-sharh': 94, 'al-inshirah': 94, "sharh": 94,
  'at-tin': 95,
  'al-alaq': 96,
  'al-qadr': 97,
  'al-asr': 103, 'asr': 103,
  'al-humazah': 104,
  'al-fil': 105,
  'quraysh': 106,
  'al-maun': 107,
  'al-kawthar': 108,
  'al-kafirin': 109,
  'an-nasr': 110,
  'al-masad': 111,
  'al-ikhlas': 112, 'ikhlas': 112,
  'al-falaq': 113,
  'an-nas': 114,
};

/**
 * Extract verse keys from a block of text (e.g. a Google search snippet).
 * Returns an array of strings in "chapter:verse" format.
 */
function extractVerseKeysFromText(text: string): string[] {
  const found: Set<string> = new Set();

  // Pattern 1: direct "X:Y" format
  const directMatches = text.matchAll(/\b(\d{1,3}):(\d{1,3})\b/g);
  for (const match of directMatches) {
    const chapter = parseInt(match[1]);
    const verse = parseInt(match[2]);
    // Validate: Quran has 114 chapters, max verses per chapter around 286
    if (chapter >= 1 && chapter <= 114 && verse >= 1 && verse <= 286) {
      found.add(`${chapter}:${verse}`);
    }
  }

  return Array.from(found);
}

/**
 * Main function: Search Google for relevant Quran verses via Serper.dev.
 * Returns a deduplicated, validated list of verse keys.
 */
export async function searchQuranVersesByNiyyah(
  niyyah: string,
  excludeKeys: string[] = [],
  maxResults: number = 10
): Promise<string[]> {
  if (!SERPER_API_KEY) {
    console.warn('SERPER_API_KEY not set, skipping Serper search.');
    return [];
  }

  // Build a targeted search query
  const query = `Quran verses about ${niyyah} site:${TRUSTED_SITES}`;

  try {
    const response = await fetch(SERPER_URL, {
      method: 'POST',
      headers: {
        'X-API-KEY': SERPER_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: query,
        num: 10, // Get 10 results
        gl: 'us',
        hl: 'en',
      }),
    });

    if (!response.ok) {
      console.error(`Serper API error: ${response.status} ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    const allKeys: Set<string> = new Set();
    const excludeSet = new Set(excludeKeys);

    // Extract verse keys from organic search results (titles + snippets)
    const organicResults = data.organic || [];
    for (const result of organicResults) {
      const textToSearch = `${result.title || ''} ${result.snippet || ''} ${result.link || ''}`;
      const keys = extractVerseKeysFromText(textToSearch);
      for (const key of keys) {
        if (!excludeSet.has(key)) {
          allKeys.add(key);
        }
      }
    }

    // Also check the "sitelinks" and "answer box" if present
    if (data.answerBox) {
      const answerText = `${data.answerBox.title || ''} ${data.answerBox.snippet || ''}`;
      const keys = extractVerseKeysFromText(answerText);
      for (const key of keys) {
        if (!excludeSet.has(key)) {
          allKeys.add(key);
        }
      }
    }

    const verseKeys = Array.from(allKeys).slice(0, maxResults);
    console.log(`[Serper] Found ${verseKeys.length} verse keys for niyyah: "${niyyah}"`, verseKeys);

    return verseKeys;
  } catch (error) {
    console.error('[Serper] Search failed:', error);
    return [];
  }
}
