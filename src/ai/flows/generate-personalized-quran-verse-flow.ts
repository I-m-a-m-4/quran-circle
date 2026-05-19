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
  niyyah: z.string().describe('The user\'s spiritual intention or goal.'),
  theme: z.string().optional().describe('An optional theme or focus for the verse, e.g., "patience", "gratitude", "guidance".')
});
export type GeneratePersonalizedQuranVerseInput = z.infer<typeof GeneratePersonalizedQuranVerseInputSchema>;

const GeneratePersonalizedQuranVerseOutputSchema = z.object({
  arabicVerse: z.string().describe('The Quranic verse in Arabic text.'),
  translation: z.string().describe('The English translation of the Quranic verse.'),
  reflectionPrompt: z.string().describe('A personalized thought-provoking question or mini-tafsir based on the user\'s intention and the selected verse.')
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
  prompt: `You are an AI assistant specialized in providing relevant Quranic verses and their English translations.
The user has a spiritual intention (niyyah) and may also provide a specific theme.
Your task is to select and present a single Quranic verse (in Arabic and its English translation) that best aligns with the user's niyyah and theme.
Focus on providing a verse that inspires reflection and guidance for the user's stated intention.

User's Niyyah: {{{niyyah}}}
{{#if theme}}
Theme: {{{theme}}}
{{/if}}

Provide only one verse that is most relevant to the user's input. Also provide a 'reflectionPrompt' which is a thought-provoking question or a short, practical modern explanation (like a mini-tafsir) connecting the verse directly back to their niyyah.
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