// Adhkar dataset — sourced from Hisnul Muslim (Fortress of the Muslim)
// by Said bin Wahf Al-Qahtani. All references are to chapters within that work.
// Do NOT alter the Arabic text or fabricate attributions.

export interface AdhkarItem {
  id: string;
  arabic: string;
  transliteration: string;
  translation: string;
  count: number;
  reference: string;
  category: AdhkarCategory;
}

export type AdhkarCategory =
  | 'morning'
  | 'evening'
  | 'after_salah'
  | 'before_sleeping'
  | 'general';

export const ADHKAR: AdhkarItem[] = [
  // MORNING ADHKAR
  {
    id: 'm1',
    category: 'morning',
    arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    transliteration:
      "Asbahna wa asbahal-mulku lillah, walhamdu lillah, la ilaha illallahu wahdahu la sharika lah, lahul-mulku walahul-hamd, wa huwa 'ala kulli shay'in qadir.",
    translation:
      'We have reached the morning and at this very time unto Allah belongs all sovereignty, and all praise is for Allah. None has the right to be worshipped except Allah, alone, without partner, to Him belongs all sovereignty and praise and He is over all things omnipotent.',
    count: 1,
    reference: 'Hisnul Muslim, Morning Adhkar #1 — Abu Dawud 4/317',
  },
  {
    id: 'm2',
    category: 'morning',
    arabic: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ',
    transliteration:
      "Allahumma bika asbahna, wa bika amsayna, wa bika nahya, wa bika namutu wa ilaykan-nushur.",
    translation:
      'O Allah, by Your leave we have reached the morning and by Your leave we have reached the evening, by Your leave we live and die and unto You is our resurrection.',
    count: 1,
    reference: 'Hisnul Muslim, Morning Adhkar #2 — At-Tirmidhi 5/466',
  },
  {
    id: 'm3',
    category: 'morning',
    arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لاَ إِلَهَ إِلاَّ أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لاَ يَغْفِرُ الذُّنُوبَ إِلاَّ أَنْتَ',
    transliteration:
      "Allahumma anta rabbi la ilaha illa ant, khalaqtani wa ana 'abduk, wa ana 'ala 'ahdika wa wa'dika mastata't, a'udhu bika min sharri ma sana't, abu'u laka bini'matika 'alayy, wa abu'u laka bidhanbi faghfir li fa'innahu la yaghfirudh-dhunuba illa ant.",
    translation:
      'O Allah, You are my Lord, none has the right to be worshipped except You, You created me and I am Your servant and I abide to Your covenant and promise as best I can, I take refuge in You from the evil of which I have committed. I acknowledge Your favour upon me and I acknowledge my sin, so forgive me, for verily none can forgive sin except You.',
    count: 1,
    reference: "Hisnul Muslim, Morning Adhkar #4 — Sayyid Al-Istighfar, Al-Bukhari 7/150 (Hadith: Sahih)",
  },
  {
    id: 'm4',
    category: 'morning',
    arabic: 'اللَّهُمَّ إِنِّي أَصْبَحْتُ أُشْهِدُكَ، وَأُشْهِدُ حَمَلَةَ عَرْشِكَ، وَمَلَائِكَتَكَ، وَجَمِيعَ خَلْقِكَ، أَنَّكَ أَنْتَ اللَّهُ لَا إِلَهَ إِلَّا أَنْتَ وَحْدَكَ لَا شَرِيكَ لَكَ، وَأَنَّ مُحَمَّداً عَبْدُكَ وَرَسُولُكَ',
    transliteration:
      "Allahumma inni asbahtu ushhiduka, wa ushhidu hamalata 'arshik, wa mala'ikatak, wa jami'a khalqik, annaka antallahu la ilaha illa anta wahdaka la sharika lak, wa anna Muhammadan 'abduka wa rasuluk.",
    translation:
      'O Allah, I have reached the morning and call on You, the bearers of Your throne, Your angels, and all of Your creation to witness that You are Allah, none has the right to be worshipped except You, alone, without partner, and that Muhammad is Your servant and Your messenger.',
    count: 4,
    reference: 'Hisnul Muslim, Morning Adhkar #7 — Abu Dawud 4/317 (Hadith: Sahih)',
  },
  {
    id: 'm5',
    category: 'morning',
    arabic: 'اللَّهُمَّ مَا أَصْبَحَ بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لَا شَرِيكَ لَكَ، فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ',
    transliteration:
      "Allahumma ma asbaha bi min ni'matin aw bi'ahadin min khalqik, fa minka wahdaka la sharika lak, falakal-hamdu wa lakash-shukr.",
    translation:
      'O Allah, what blessing I or any of Your creation have risen upon, is from You alone, without partner, so for You is all praise and unto You all thanks.',
    count: 1,
    reference: 'Hisnul Muslim, Morning Adhkar #8 — Abu Dawud 4/318',
  },

  // EVENING ADHKAR
  {
    id: 'e1',
    category: 'evening',
    arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    transliteration:
      "Amsayna wa amsal-mulku lillah, walhamdu lillah, la ilaha illallahu wahdahu la sharika lah, lahul-mulku walahul-hamd, wa huwa 'ala kulli shay'in qadir.",
    translation:
      'We have reached the evening and at this very time unto Allah belongs all sovereignty, and all praise is for Allah. None has the right to be worshipped except Allah, alone, without partner, to Him belongs all sovereignty and praise, and He is over all things omnipotent.',
    count: 1,
    reference: 'Hisnul Muslim, Evening Adhkar #1 — Abu Dawud 4/317',
  },
  {
    id: 'e2',
    category: 'evening',
    arabic: 'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ',
    transliteration:
      "Allahumma bika amsayna, wa bika asbahna, wa bika nahya, wa bika namutu wa ilaykal-masir.",
    translation:
      'O Allah, by Your leave we have reached the evening and by Your leave we have reached the morning, by Your leave we live and die and unto You is our return.',
    count: 1,
    reference: 'Hisnul Muslim, Evening Adhkar #2 — At-Tirmidhi 5/466',
  },
  {
    id: 'e3',
    category: 'evening',
    arabic: 'اللَّهُمَّ إِنِّي أَمْسَيْتُ أُشْهِدُكَ، وَأُشْهِدُ حَمَلَةَ عَرْشِكَ، وَمَلَائِكَتَكَ، وَجَمِيعَ خَلْقِكَ، أَنَّكَ أَنْتَ اللَّهُ لَا إِلَهَ إِلَّا أَنْتَ وَحْدَكَ لَا شَرِيكَ لَكَ، وَأَنَّ مُحَمَّداً عَبْدُكَ وَرَسُولُكَ',
    transliteration:
      "Allahumma inni amsaytu ushhiduka, wa ushhidu hamalata 'arshik, wa mala'ikatak, wa jami'a khalqik, annaka antallahu la ilaha illa anta wahdaka la sharika lak, wa anna Muhammadan 'abduka wa rasuluk.",
    translation:
      'O Allah, I have reached the evening and call on You, the bearers of Your throne, Your angels, and all of Your creation to witness that You are Allah, none has the right to be worshipped except You, alone, without partner, and that Muhammad is Your servant and Your messenger.',
    count: 4,
    reference: 'Hisnul Muslim, Evening Adhkar #7 — Abu Dawud 4/317 (Hadith: Sahih)',
  },

  // AFTER SALAH
  {
    id: 'as1',
    category: 'after_salah',
    arabic: 'أَسْتَغْفِرُ اللَّه',
    transliteration: 'Astaghfirullah',
    translation: 'I seek forgiveness from Allah.',
    count: 3,
    reference: "Hisnul Muslim, After Salah Adhkar #1 — Muslim 1/414",
  },
  {
    id: 'as2',
    category: 'after_salah',
    arabic: 'اللَّهُمَّ أَنْتَ السَّلَامُ، وَمِنْكَ السَّلَامُ، تَبَارَكْتَ ذَا الْجَلَالِ وَالْإِكْرَامِ',
    transliteration:
      "Allahumma antas-salam, wa minkas-salam, tabarakta dhal-jalali wal-ikram.",
    translation:
      'O Allah, You are As-Salam and from You is all peace, blessed are You, O possessor of majesty and honour.',
    count: 1,
    reference: "Hisnul Muslim, After Salah Adhkar #2 — Muslim 1/414",
  },
  {
    id: 'as3',
    category: 'after_salah',
    arabic: 'سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ، وَاللَّهُ أَكْبَرُ',
    transliteration: 'SubhanAllah, walhamdulillah, wallahu akbar.',
    translation: 'Glory be to Allah, all praise is for Allah, Allah is the greatest.',
    count: 33,
    reference: "Hisnul Muslim, After Salah Adhkar #8 — Muslim 1/418",
  },
  {
    id: 'as4',
    category: 'after_salah',
    arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    transliteration:
      "La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamd, wa huwa 'ala kulli shay'in qadir.",
    translation:
      'None has the right to be worshipped except Allah, alone, without partner, to Him belongs all sovereignty and praise and He is over all things omnipotent.',
    count: 1,
    reference: "Hisnul Muslim, After Salah Adhkar #9 — Muslim 1/415",
  },
  {
    id: 'as5',
    category: 'after_salah',
    arabic: 'آيَةُ الْكُرْسِيِّ: اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ',
    transliteration:
      "Ayat Al-Kursi: Allahu la ilaha illa huwal-hayyul-qayyum, la ta'khudhuhu sinatun wa la nawm...",
    translation:
      'The Throne Verse: Allah! There is no deity except Him, the Ever-Living, the Sustainer of existence. Neither drowsiness overtakes Him nor sleep...',
    count: 1,
    reference: "Hisnul Muslim, After Salah Adhkar #10 — Al-Bukhari — Whoever recites Ayat Al-Kursi after every prayer, nothing will prevent him from entering Paradise except death. (Hadith: Sahih)",
  },

  // BEFORE SLEEPING
  {
    id: 'bs1',
    category: 'before_sleeping',
    arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
    transliteration: 'Bismika Allahumma amutu wa ahya.',
    translation: 'In Your name O Allah, I die and I live.',
    count: 1,
    reference: "Hisnul Muslim, Before Sleeping Adhkar #1 — Al-Bukhari 11/113",
  },
  {
    id: 'bs2',
    category: 'before_sleeping',
    arabic: 'اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ',
    transliteration: "Allahumma qini 'adhabaka yawma tab'athu 'ibadak.",
    translation: 'O Allah, protect me from Your punishment on the day Your servants are resurrected.',
    count: 3,
    reference: "Hisnul Muslim, Before Sleeping Adhkar #2 — Abu Dawud 4/311, At-Tirmidhi 5/473",
  },
  {
    id: 'bs3',
    category: 'before_sleeping',
    arabic: 'بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي، وَبِكَ أَرْفَعُهُ، فَإِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ',
    transliteration:
      "Bismika rabbi wada'tu janbi wa bika arfa'uh, fa in amsakta nafsi farhamha, wa in arsaltaha fahfadha bima tahfadhu bihi 'ibadakas-salihin.",
    translation:
      'In Your name my Lord, I lie down and in Your name I rise, so if You should take my soul then have mercy upon it, and if You should return my soul then protect it in the manner You do so with Your righteous servants.',
    count: 1,
    reference: "Hisnul Muslim, Before Sleeping Adhkar #5 — Al-Bukhari 11/126, Muslim 4/2083",
  },

  // GENERAL
  {
    id: 'g1',
    category: 'general',
    arabic: 'سُبْحَانَ اللَّه',
    transliteration: 'SubhanAllah',
    translation: 'Glory be to Allah.',
    count: 33,
    reference: 'Hisnul Muslim — General dhikr',
  },
  {
    id: 'g2',
    category: 'general',
    arabic: 'الْحَمْدُ لِلَّه',
    transliteration: 'Alhamdulillah',
    translation: 'All praise is for Allah.',
    count: 33,
    reference: 'Hisnul Muslim — General dhikr',
  },
  {
    id: 'g3',
    category: 'general',
    arabic: 'اللَّهُ أَكْبَر',
    transliteration: 'Allahu Akbar',
    translation: 'Allah is the greatest.',
    count: 34,
    reference: 'Hisnul Muslim — General dhikr',
  },
  {
    id: 'g4',
    category: 'general',
    arabic: 'لَا إِلَهَ إِلَّا اللَّه',
    transliteration: 'La ilaha illallah',
    translation: 'None has the right to be worshipped except Allah.',
    count: 100,
    reference: 'Hisnul Muslim — General dhikr',
  },
  {
    id: 'g5',
    category: 'general',
    arabic: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ',
    transliteration: 'Astaghfirullaha wa atubu ilayh.',
    translation: 'I seek forgiveness from Allah and repent to Him.',
    count: 100,
    reference: "Hisnul Muslim — Al-Bukhari 11/101, Muslim 4/2075",
  },
  {
    id: 'g6',
    category: 'general',
    arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّه',
    transliteration: 'La hawla wa la quwwata illa billah.',
    translation: 'There is no might nor power except with Allah.',
    count: 1,
    reference: 'Hisnul Muslim — Al-Bukhari, Muslim',
  },
];

export function getAdhkarByCategory(category: AdhkarCategory): AdhkarItem[] {
  return ADHKAR.filter((item) => item.category === category);
}
