'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { searchQuranVersesByNiyyah } from '@/lib/serper-search';

const GeminiVerseSelectionSchema = z.object({
  verseKeys: z.array(z.string()).describe(
    'Exactly 5 unique Quranic verse keys in "chapter:verse" format. e.g., ["2:153", "94:5", "2:286", "3:134", "103:3"].'
  ),
});

/**
 * Hybrid verse discovery pipeline:
 * 
 * STEP 1 (Serper): Query Google via Serper.dev restricted to trusted Islamic sites.
 *   → Extracts actual verse keys mentioned on pages like quran.com, islamqa.info
 *   → Zero hallucination: every key found was on a real Islamic web page
 * 
 * STEP 2 (Gemini as ranker, not guesser): If Serper found ≥5 candidate keys,
 *   pass ONLY those candidates to Gemini and ask it to RANK and PICK the best 5
 *   that match the niyyah. Gemini never invents new keys at this stage.
 * 
 * STEP 3 (Gemini as fallback generator): If Serper found <5 results
 *   (e.g., no internet, or niyyah is very specific), fall back to
 *   Gemini generating keys directly with our deduplication + regex guard.
 */
export async function generatePersonalizedVerses(
  input: { niyyah: string; excludeKeys?: string[] }
) {
  const excludeSet = new Set(input.excludeKeys || []);
  const finalKeys: string[] = [];

  // ─────────────────────────────────────────────────────────
  // STEP 1: Serper.dev — Search Google for relevant verse keys
  // ─────────────────────────────────────────────────────────
  const serperCandidates = await searchQuranVersesByNiyyah(
    input.niyyah,
    Array.from(excludeSet),
    15 // Get up to 15 candidates for Gemini to choose from
  );

  // ─────────────────────────────────────────────────────────
  // STEP 2: Gemini as a RANKER (if Serper found enough candidates)
  // ─────────────────────────────────────────────────────────
  if (serperCandidates.length >= 5) {
    try {
      const response = await ai.generate({
        prompt: `You are an expert Quran scholar. 
        The user's current concern or focus is: "${input.niyyah}".
        
        Google Search has found these candidate Quranic verse keys on trusted Islamic websites:
        ${JSON.stringify(serperCandidates)}
        
        Carefully evaluate these candidates. Only select keys that have a direct, logical, and theological correlation to the user's focus.
        If a candidate is completely unrelated or a random number match, do NOT select it.
        You can return fewer than 5 keys (or even an empty list) if the candidate pool lacks high-quality matches.
        Do NOT invent or add any new keys in this step. Only choose from the candidates.
        Return them as a JSON array under the "verseKeys" field.`,
        output: { schema: GeminiVerseSelectionSchema }
      });

      const result = response.output;
      if (result?.verseKeys) {
        for (let key of result.verseKeys) {
          key = key.trim();
          // Validate format and no duplicates/exclusions
          if (/^\d+:\d+$/.test(key) && !excludeSet.has(key) && !finalKeys.includes(key)) {
            finalKeys.push(key);
          }
        }
      }
    } catch (err) {
      console.warn('[Gemini Ranker] Failed, will use Serper candidates directly:', err);
    }

    // Do not pad with raw Serper candidates directly; let the direct generator handle missing keys to ensure high-accuracy.
  }

  // ─────────────────────────────────────────────────────────
  // STEP 3: Gemini as Generator fallback (if Serper got < 5 results)
  // ─────────────────────────────────────────────────────────
  if (finalKeys.length < 5) {
    let attempts = 0;
    while (finalKeys.length < 5 && attempts < 3) {
      attempts++;
      const currentExcludes = [...Array.from(excludeSet), ...finalKeys];
      const excludesPrompt = currentExcludes.length > 0
        ? `You MUST NOT select any of the following already-shown verse keys: ${JSON.stringify(currentExcludes)}.`
        : '';

      try {
        const response = await ai.generate({
          prompt: `You are an expert Quran scholar.
          The user's personal focus or concern is: "${input.niyyah}".
          
          Your task is to select exactly 5 unique, highly relevant verse keys from the Quran that directly correlate with this concern.
          Guidelines for high-accuracy thematic mapping:
          - Longevity / Living long / Health: Look for verses referencing lifespan, health, delaying death to an appointed term, or doing good deeds/silat ar-rahim to increase blessings (e.g., 71:4, 35:11, 16:70, 6:2, 14:7).
          - Wealth / Financial Ease / Money: Look for verses about rizq, provision, spending in Allah's cause, and trust in Allah for sustenance (e.g., 65:2-3, 51:58, 71:12, 34:39, 2:261, 17:30, 2:268).
          - Patience / Hardship / Relief: Look for verses about trials, patience, and ease following difficulty (e.g., 2:153, 2:155, 94:5-6, 2:286, 3:200).
          - Guidance / Seeking Purpose: Look for verses about light, guidance, and remembrance of Allah (e.g., 2:186, 13:28, 39:53, 93:5, 103:3).

          All keys must be unique. Format: "chapter:verse" (e.g., "65:3" or "71:4"). No ranges.
          
          ${excludesPrompt}
          
          Return as JSON array under "verseKeys".`,
          output: { schema: GeminiVerseSelectionSchema }
        });

        const result = response.output;
        for (let key of (result?.verseKeys || [])) {
          key = key.trim();
          if (/^\d+:\d+$/.test(key) && !excludeSet.has(key) && !finalKeys.includes(key)) {
            finalKeys.push(key);
          }
        }
      } catch (error) {
        console.error(`[Gemini Generator] Attempt ${attempts} failed:`, error);
        break;
      }
    }
  }

  // ─────────────────────────────────────────────────────────
  // FINAL FAILSAFE: Pad from verified offline pool if still < 5
  // ─────────────────────────────────────────────────────────
  const fallbackPool = ['2:153', '94:5', '2:286', '3:200', '103:3', '2:186', '93:5', '13:28', '39:53', '65:3'];
  for (const fallback of fallbackPool) {
    if (finalKeys.length >= 5) break;
    if (!excludeSet.has(fallback) && !finalKeys.includes(fallback)) {
      finalKeys.push(fallback);
    }
  }

  return {
    verseKeys: finalKeys.slice(0, 5),
    // No AI-generated explanation returned — UI only shows verse + translation
    explanation: ''
  };
}
