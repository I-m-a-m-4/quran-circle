import { NextResponse } from 'next/server';
import { generatePersonalizedVerses } from '@/ai/flows/generate-personalized-verses-flow';
import { getVerseContent } from '@/lib/quran-api';

export interface VerseData {
  arabic: string;
  english: string;
  theme: string;
}

export const LOCAL_VERSE_FALLBACKS: Record<string, VerseData> = {
  // ==========================================
  // THEME: PATIENCE (SABR) & PERSEVERANCE
  // ==========================================
  '2:153': {
    theme: 'Patience & Prayer',
    arabic: 'يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ ٱسْتَعِينُوا۟ بِٱلصَّبْرِ وَٱلصَّلَوٰةِ ۚ إِنَّ ٱللَّهَ مَعَ ٱلصَّٰبِرِينَ',
    english: 'O you who have believed, seek help through patience and prayer. Indeed, Allah is with the patient.'
  },
  '2:155': {
    theme: 'Trials & Tribulations',
    arabic: 'وَلَنَبْلُوَنَّكُم بِشَىْءٍ مِّنَ ٱلْخَوْفِ وَٱلْجُوعِ وَنَقْصٍ مِّنَ ٱلْأَمْوَٰلِ وَٱلْأَنفُسِ وَٱلثَّمَرَٰتِ ۗ وَبَشِّرِ ٱلصَّٰبِرِينَ',
    english: 'And We will surely test you with something of fear and hunger and a loss of wealth and lives and fruits, but give good tidings to the patient,'
  },
  '2:156': {
    theme: 'Affliction & Return',
    arabic: 'ٱلَّذِينَ إِذَٰٓأَصَٰبَتْهُم مُّصِيبَةٌ قَالُوٓا۟ إِنَّا لِلَّهِ وَإِنَّآ إِلَيْهِ رَٰجِعُونَ',
    english: 'Who, when disaster strikes them, say, "Indeed we belong to Allah, and indeed to Him we will return."'
  },
  '2:157': {
    theme: 'Divine Blessings',
    arabic: 'أُو۟لَٰٓئِكَ عَلَيْهِمْ صَلَوَٰتٌ مِّن رَّبِّهِمْ وَرَحْمَةٌ ۖ وَأُو۟لَٰٓئِكَ هُمُ ٱلْمُهْتَدُونَ',
    english: 'Those are the ones upon whom are blessings from their Lord and mercy. And it is those who are the [rightly] guided.'
  },
  '3:200': {
    theme: 'Endurance & Success',
    arabic: 'يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ ٱصْبِرُوا۟ وَصَابِرُوا۟ وَرَابِطُوا۟ وَٱتَّقُوا۟ ٱللَّهَ لَعَلَّكُمْ تُفْلِحُونَ',
    english: 'O you who have believed, persevere and endure and remain stationed and fear Allah that you may be successful.'
  },
  '103:1': {
    theme: 'Time and Reflection',
    arabic: 'وَٱلْعَصْرِ',
    english: 'By time,'
  },
  '103:2': {
    theme: 'Human Condition',
    arabic: 'إِنَّ ٱلْإِنسَٰنَ لَفِى خُسْرٍ',
    english: 'Indeed, mankind is in loss,'
  },
  '103:3': {
    theme: 'Truth and Patience',
    arabic: 'إِلَّا ٱلَّذِينَ ءَامَنُوا۟ وَعَمِلُوا۟ ٱلصَّٰلِحَٰتِ وَتَوَاصَوْا۟ بِٱلْحَقِّ وَتَوَاصَوْا۟ بِٱلصَّبْرِ',
    english: 'Except those who have believed and done righteous deeds and advised each other to truth and advised each other to patience.'
  },

  // ==========================================
  // THEME: ANXIETY, COMFORT, & HOPE
  // ==========================================
  '3:139': {
    theme: 'Overcoming Despair',
    arabic: 'وَلَا تَهِنُوا۟ وَلَا تَحْزَنُوا۟ وَأَنتُمُ ٱلْأَعْلَوْنَ إِن كُنتُم مُّؤْمِنِينَ',
    english: 'So do not weaken and do not grieve, and you will be superior if you are [true] believers.'
  },
  '13:28': {
    theme: 'Tranquility of Heart',
    arabic: 'ٱلَّذِينَ ءَامَنُوا۟ وَتَطْمَئِنُّ قُلُوبُهُم بِذِكْرِ ٱللَّهِ ۗ أَلَا بِذِكْرِ ٱللَّهِ تَطْمَئِنُّ ٱلْقُلُوبُ',
    english: 'Those who have believed and whose hearts are assured by the remembrance of Allah. Unquestionably, by the remembrance of Allah hearts are assured.'
  },
  '20:46': {
    theme: 'Divine Presence',
    arabic: 'قَالَ لَا تَخَافَآ ۖ إِنَّنِى Mَعَكُمَآ أَسْمَعُ وَأَرَىٰ',
    english: '[Allah] said, "Do not be afraid. Indeed, I am with you both; I hear and I see."'
  },
  '39:53': {
    theme: 'Infinite Forgiveness',
    arabic: 'قُلْ يَٰعِبَادِىَ ٱلَّذِينَ أَسْرَفُوا۟ عَلَىٰٓ أَنفُسِهِمْ لَا تَقْنَطُوا۟ مِن رَّحْمَةِ ٱللَّهِ ۚ إِنَّ ٱللَّهَ يَغْفِرُ ٱلذُّنُوبَ جَمِيعًا ۚ إِنَّهُۥ هُوَ ٱلْغَفُورُ ٱلرَّحِيمُ',
    english: 'Say, "O My servants who have transgressed against themselves [by sinning], do not despair of the mercy of Allah. Indeed, Allah forgives all sins. Indeed, it is He who is the Forgiving, the Merciful."'
  },
  '93:1': {
    theme: 'Morning Brightness',
    arabic: 'وَٱلضُّحَىٰ',
    english: 'By the morning brightness'
  },
  '93:2': {
    theme: 'The Still Night',
    arabic: 'وَٱلَّيْلِ إِذَا سَجَىٰ',
    english: 'And [by] the night when it covers with darkness,'
  },
  '93:3': {
    theme: 'Divine Care',
    arabic: 'مَا وَدَّعَكَ رَبُّكَ وَمَا قَلَىٰ',
    english: 'Your Lord has not taken leave of you, [O Muhammad], nor has He detested [you].'
  },
  '93:4': {
    theme: 'The Better Future',
    arabic: 'وَلَلْءَاخِرَةُ خَيْرٌ لَّكَ مِنَ ٱلْأُولَىٰ',
    english: 'And the Hereafter is better for you than the first [life].'
  },
  '93:5': {
    theme: 'Ultimate Satisfaction',
    arabic: 'وَلَسَوْفَ يُعْطِيكُ رَبُّكَ فَتَرْضَىٰ',
    english: 'And your Lord is going to give you, and you will be satisfied.'
  },
  '93:6': {
    theme: 'Shelter in Need',
    arabic: 'أَلَمْ يَجِدْكَ يَتِيمًا فَـَٔاوَىٰ',
    english: 'Did He not find you an orphan and give [you] shelter?'
  },
  '93:7': {
    theme: 'Guidance',
    arabic: 'وَوَجَدَكَ ضَآلًّا فَهَدَىٰ',
    english: 'And He found you lost and guided [you].'
  },
  '93:8': {
    theme: 'Enrichment',
    arabic: 'وَوَجَدَكَ عَآئِلًا فَأَغْنَىٰ',
    english: 'And He found you poor and made [you] self-sufficient.'
  },
  '93:9': {
    theme: 'Kindness to Vulnerable',
    arabic: 'فَأَمَّا ٱلْيَتِيمَ فَلَا تَقْهَرْ',
    english: 'So as for the orphan, do not oppress [him].'
  },
  '93:10': {
    theme: 'Kindness to Petitioners',
    arabic: 'وَأَمَّا ٱلسَّآئِلَ فَلَا تَنْهَرْ',
    english: 'And as for the petitioner, do not repel [him].'
  },
  '93:11': {
    theme: 'Proclaiming Blessings',
    arabic: 'وَأَمَّا بِنِعْمَةِ رَبِّكَ فَحَدِّثْ',
    english: 'But as for the favor of your Lord, report [it].'
  },

  // ==========================================
  // THEME: RELIEF (YUSR) AFTER DIFFICULTY
  // ==========================================
  '2:286': {
    theme: 'Soul’s Capacity',
    arabic: 'لَا يُكَلِّفُ ٱللَّهُ نَفْسًا إِلَّا وُسْعَهَا ۚ لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا ٱكْتَسَبَتْ',
    english: 'Allah does not charge a soul except with that within its capacity. It will have the consequence of what good it has gained, and it will bear the consequence of what evil it has earned.'
  },
  '94:1': {
    theme: 'Opening the Chest',
    arabic: 'أَلَمْ نَشْرَحْ لَكَ صَدْرَكَ',
    english: 'Did We not expand for you, [O Muhammad], your breast?'
  },
  '94:2': {
    theme: 'Removing Burdens',
    arabic: 'وَوَضَعْنَا عَنكَ وِزْرَكَ',
    english: 'And We removed from you your burden'
  },
  '94:3': {
    theme: 'Weight on the Back',
    arabic: 'ٱلَّذِىٓ أَنقَضَ ظَهْرَكَ',
    english: 'Which weighed upon your back'
  },
  '94:4': {
    theme: 'Exalting Esteem',
    arabic: 'وَرَفَعْنَا لَكَ ذِكْرَكَ',
    english: 'And raised high for you your repute.'
  },
  '94:5': {
    theme: 'Ease with Hardship',
    arabic: 'فَإِنَّ مَعَ ٱلْعُسْرِ يُسْرًا',
    english: 'For indeed, with hardship [will be] ease.'
  },
  '94:6': {
    theme: 'Ease with Hardship Counterpart',
    arabic: 'إِنَّ مَعَ ٱلْعُسْرِ يُسْرًا',
    english: 'Indeed, with hardship [will be] ease.'
  },
  '94:7': {
    theme: 'Labor in Devotion',
    arabic: 'فَإِذَا فَرَغْتَ فَٱنصَبْ',
    english: 'So when you have finished [your duties], labor [in devotion].'
  },
  '94:8': {
    theme: 'Directing Desire',
    arabic: 'وَإِلَىٰ رَبِّكَ فَٱرْغَب',
    english: 'And to your Lord direct [your] longing.'
  },

  // ==========================================
  // THEME: TRUST (TAWAKKUL) & DECISION MAKING
  // ==========================================
  '2:216': {
    theme: 'Hidden Wisdom',
    arabic: 'وَعَسَىٰٓ أَن تَكْرَهُوا۟ شَيْـًٔا وَهُوَ خَيْرٌ لَّكُمْ ۖ وَعَسَىٰٓ أَن تُحِبُّوا۟ شَيْـًٔا وَهُوَ شَرٌّ لَّكُمْ ۗ وَٱللَّهُ يَعْلَمُ وَأَنتُمْ لَا تَعْلَمُونَ',
    english: 'But perhaps you hate a thing and it is good for you; and perhaps you love a thing and it is bad for you. And Allah knows, while you know not.'
  },
  '2:255': {
    theme: 'The Throne Verse',
    arabic: 'ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ ۚ لَا تَأْخُذُهُۥ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُۥ مَا فِى ٱلسَّمَٰوَٰتِ وَمَا فِى ٱلْأَرْضِ',
    english: 'Allah - there is no deity except Him, the Ever-Living, the Sustainer of [all] existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth.'
  },
  '3:159': {
    theme: 'Consultation & Trust',
    arabic: 'فَإِذَا عَزَمْتَ فَتَوَكَّلْ عَلَى ٱللَّهِ ۚ إِنَّ ٱللَّهَ يُحِبُّ ٱلْمُتَوَكِّلِينَ',
    english: 'And when you have decided, then rely upon Allah. Indeed, Allah loves those who rely [upon Him].'
  },
  '9:51': {
    theme: 'The Decreed Path',
    arabic: 'قُل لَّن يُصِيبَنَآ إِلَّا مَا كَتَبَ ٱللَّهُ لَنَا هُوَ مَوْلَىٰنَا ۚ وَعَلَى ٱللَّهِ فَلْيَتَوَكَّلِ ٱلْمُؤْمِنُونَ',
    english: 'Say, "Never will we be struck except by what Allah has decreed for us; He is our protector." And upon Allah let the believers rely.'
  },
  '9:129': {
    theme: 'Sufficiency of Allah',
    arabic: 'فَقُلْ حَسْبِىَ ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ ۖ عَلَيْهِ تَوَكَّلْتُ ۖ وَهُوَ رَبُّ ٱلْعَرْشِ ٱلْعَظِيمِ',
    english: 'Say, "Sufficient for me is Allah; there is no deity except Him. On Him I have relied, and He is the Lord of the Great Throne."'
  },
  '11:88': {
    theme: 'Success from Allah',
    arabic: 'وَمَا تَوْفِيقِىٓ إِلَّا بِٱللَّهِ ۚ عَلَيْهِ تَوَكَّلْتُ وَإِلَيْهِ أُنِيبُ',
    english: 'And my success is not but through Allah. Upon Him I have relied, and to Him I return.'
  },
  '39:38': {
    theme: 'The Ultimate Reliance',
    arabic: 'قُلْ حَسْبِىَ ٱللَّهُ ۖ عَلَيْهِ يَتَوَكَّلُ ٱلْمُتَوَكِّلُونَ',
    english: 'Say, "Sufficient is Allah for me; upon Him [alone] rely the reliant."'
  },

  // ==========================================
  // THEME: PROVISIONS & SUSTENANCE (RIZQ)
  // ==========================================
  '11:6': {
    theme: 'Sustenance of All Creatures',
    arabic: 'وَمَا مِن دَآبَّةٍ فِى ٱلْأَرْضِ إِلَّا عَلَى ٱللَّهِ رِزْقُهَا وَيَعْلَمُ مُسْتَقَرَّهَا وَمُسْتَوْدَعَهَا',
    english: 'And there is no creature on earth but that upon Allah is its provision, and He knows its place of dwelling and its place of storage.'
  },
  '14:7': {
    theme: 'Gratitude & Increase',
    arabic: 'وَإِذْ تَأَذَّنَ رَبُّكُمْ لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ ۖ وَلَئِن كَفَرْتُمْ إِنَّ عَذَابِى لَشَدِيدٌ',
    english: 'And [remember] when your Lord proclaimed, "If you are grateful, I will surely increase you [in favor]; but if you show ingratitude, indeed, My punishment is severe."'
  },
  '29:60': {
    theme: 'Uncalculated Provision',
    arabic: 'وَكَأَيِّن مِّن دَآبَّةٍ لَّا تَحْمِلُ رِزْقَهَا ٱللَّهُ يَرْزُقُهَا وَإِيَّاكُمْ ۚ وَهُوَ ٱلسَّمِيعُ ٱلْعَلِيمُ',
    english: 'And how many a creature carries not its provision. Allah provides for it and for you. And He is the Hearing, the Knowing.'
  },
  '34:39': {
    theme: 'Divine Replacement',
    arabic: 'قُلْ إِنَّ رَبِّى يَبْسُطُ ٱلرِّزْقَ لِمَن يَشَّآءُ مِنْ عِبَادِهِۦ وَيَقْدِرُ لَهُۥ ۚ وَمَآ أَنفَقْتُم مِّن شَىْءٍ فَهُوَ يُخْلِفُهُۥ ۖ وَهُوَ خَيْرُ ٱلرَّٰزِقِينَ',
    english: 'Say, "Indeed, my Lord extends provision for whom He wills of His servants and restricts [it] for him. But whatever thing you spend [in His cause] - He will compensate it; and He is the best of providers."'
  },
  '65:2': {
    theme: 'Way Out of Hardship',
    arabic: 'وَمَن يَتَّقِ ٱللَّهَ يَجْعَل لَّهُۥ مَخْرَجًا',
    english: 'And whoever fears Allah - He will make for him a way out.'
  },
  '65:3': {
    theme: 'Unexpected Sustenance',
    arabic: 'وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ ۚ وَمَن يَتَّوَكَّلْ عَلَى ٱللَّهِ فَهُوَ حَسْبُهُۥ ۚ إِنَّ ٱللَّهَ بَٰلِغُ أَمْرِهِۦ ۚ قَدْ جَعَلَ ٱللَّهُ لِكُلِّ شَىْءٍ قَدْرًا',
    english: 'And He will provide for him from where he does not expect. And whoever relies upon Allah - then He is sufficient for him. Indeed, Allah will accomplish His purpose. Allah has already set for everything a decreed extent.'
  }
};

export const POST = async (request: Request) => {
  try {
    const body = await request.json();
    const translationId = body.translationId || 131; // Default: Saheeh International

    let verseKeys: string[] = [];
    let explanation = '';

    if (body.verseKeys && Array.isArray(body.verseKeys) && body.verseKeys.length > 0) {
      verseKeys = body.verseKeys;
      explanation = `Viewing session focused around verse ${body.verseKeys[0]}.`;
    } else {
      const niyyah = body.niyyah || 'Building consistency';
      const excludeKeys = body.excludeKeys || [];
      // 1. Generate 5 verse keys matching Niyyah using Gemini, excluding previous ones
      const result = await generatePersonalizedVerses({ niyyah, excludeKeys });
      verseKeys = result.verseKeys;
      explanation = result.explanation;
    }

    // 2. Fetch full content for all 5 verse keys in the user's preferred translation language
    const fetchPromises = verseKeys.map(async (key) => {
      const content = await getVerseContent(key, translationId);
      if (content) {
        return content;
      }
      
      // Fallback details if both external APIs are unreachable (Offline Mode)
      const [chapter, verseNum] = key.split(':');
      const localFallback = LOCAL_VERSE_FALLBACKS[key] || {
        arabic: "وَأَقِيمُوا۟ ٱلصَّلَوٰةَ وَءَاتُوا۟ ٱلزَّكَوٰةَ وَٱرْكَعُوا۟ مَعَ ٱلرَّٰكِعِينَ",
        english: "And establish prayer and give zakah and bow with those who bow [in worship and obedience]."
      };

      return {
        id: parseInt(verseNum) || 1,
        verse_key: key,
        text_uthmani: localFallback.arabic,
        translations: [
          { text: localFallback.english }
        ]
      };
    });

    const fullVerses = await Promise.all(fetchPromises);

    return NextResponse.json({
      success: true,
      explanation,
      verses: fullVerses
    });
  } catch (error) {
    console.error('Error crafting personalized session:', error);
    return NextResponse.json({ error: 'Failed to craft personalized session' }, { status: 500 });
  }
}
