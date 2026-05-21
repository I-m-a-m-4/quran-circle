'use server';
/**
 * @fileOverview A Genkit flow for generating a personalized Quran verse and its translation
 * based on the user's Niyyah (intention) and an optional theme.
 *
 * - generatePersonalizedQuranVerse - A function that handles the personalized Quran verse generation process.
 * - GeneratePersonalizedQuranVerseInput - The input type for the generatePersonalizedQuranVerse function.
 * - GeneratePersonalizedQuranVerseOutput - The return type for the generatePersonalizedQuranVerse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePersonalizedQuranVerseInputSchema = z.object({
  niyyah: z.string().describe('What is currently weighing on the user\'s mind (their concern or situation).'),
  theme: z.string().optional().describe('An optional theme or focus for the verse, e.g., "patience", "gratitude", "guidance".'),
  verseKey: z.string().optional().describe('The specific Quranic verse key being read, e.g., "2:255".'),
  verseText: z.string().optional().describe('The Arabic text of the verse.'),
  verseTranslation: z.string().optional().describe('The translation of the verse.')
});
export type GeneratePersonalizedQuranVerseInput = z.infer<typeof GeneratePersonalizedQuranVerseInputSchema>;

const GeneratePersonalizedQuranVerseOutputSchema = z.object({
  arabicVerse: z.string().describe('The Quranic verse in Arabic text.'),
  translation: z.string().describe('The English translation of the Quranic verse.'),
  reflectionPrompt: z.string().describe('A deeply personal, Tafsir-grounded explanation connecting the verse to what is weighing on the user\'s mind.')
});
export type GeneratePersonalizedQuranVerseOutput = z.infer<typeof GeneratePersonalizedQuranVerseOutputSchema>;

export async function generatePersonalizedQuranVerse(
  input: GeneratePersonalizedQuranVerseInput
): Promise<GeneratePersonalizedQuranVerseOutput> {
  return generatePersonalizedQuranVerseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedQuranVersePrompt',
  input: {schema: GeneratePersonalizedQuranVerseInputSchema},
  output: {schema: GeneratePersonalizedQuranVerseOutputSchema},
  prompt: `You are an AI Islamic scholar and spiritual companion. Your mission is to help the user connect deeply with the Quran by showing how specific verses speak directly to their real-life situations.

The user has shared what is currently weighing on their mind:
"{{{niyyah}}}"

{{#if theme}}
Focus Theme: {{{theme}}}
{{/if}}

{{#if verseKey}}
The user is currently reading the following verse:
- Verse Key: {{{verseKey}}}
- Arabic: {{{verseText}}}
- Translation: {{{verseTranslation}}}

Your task:
1. Ground your explanation in classical Tafsir (e.g., Ibn Kathir, Al-Jalalayn, Maariful Quran, or Tafsir al-Kabir). Do not hallucinate or make up custom interpretations.
2. Directly connect this specific verse to the user's concern: "{{{niyyah}}}". Explain exactly how it applies to what they are facing (e.g. anxiety, decision, family, etc.).
3. Write a highly empathetic, personal, and encouraging message that guides them on how to apply the verse's wisdom. Speak to them directly in a warm, comforting tone.
4. Output:
   - 'arabicVerse': "{{{verseText}}}"
   - 'translation': "{{{verseTranslation}}}"
   - 'reflectionPrompt': Your Tafsir-grounded reflection/connection explaining how this verse addresses their concern.
{{else}}
Your task:
1. Select a single, highly relevant verse from the Quran that speaks directly to their situation: "{{{niyyah}}}".
2. Ground your selection in classical Tafsir.
3. Output:
   - 'arabicVerse': The Arabic text of the selected verse.
   - 'translation': The English translation of the selected verse.
   - 'reflectionPrompt': A comforting, Tafsir-grounded reflection showing why this verse is relevant to what is weighing on their mind.
{{/if}}
`
});

const generatePersonalizedQuranVerseFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedQuranVerseFlow',
    inputSchema: GeneratePersonalizedQuranVerseInputSchema,
    outputSchema: GeneratePersonalizedQuranVerseOutputSchema
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);