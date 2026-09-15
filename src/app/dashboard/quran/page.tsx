'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, Book, Globe, X, ChevronDown, Mic } from 'lucide-react';
import { SURAH_NAMES } from '@/lib/quran-api';
import { getCachedSurahNumbers } from '@/lib/db/quran-offline';

const SURAH_META: Record<number, { ayahs: number; type: 'Meccan' | 'Medinan' }> = {
  1:{ayahs:7,type:'Meccan'},2:{ayahs:286,type:'Medinan'},3:{ayahs:200,type:'Medinan'},
  4:{ayahs:176,type:'Medinan'},5:{ayahs:120,type:'Medinan'},6:{ayahs:165,type:'Meccan'},
  7:{ayahs:206,type:'Meccan'},8:{ayahs:75,type:'Medinan'},9:{ayahs:129,type:'Medinan'},
  10:{ayahs:109,type:'Meccan'},11:{ayahs:123,type:'Meccan'},12:{ayahs:111,type:'Meccan'},
  13:{ayahs:43,type:'Medinan'},14:{ayahs:52,type:'Meccan'},15:{ayahs:99,type:'Meccan'},
  16:{ayahs:128,type:'Meccan'},17:{ayahs:111,type:'Meccan'},18:{ayahs:110,type:'Meccan'},
  19:{ayahs:98,type:'Meccan'},20:{ayahs:135,type:'Meccan'},21:{ayahs:112,type:'Meccan'},
  22:{ayahs:78,type:'Medinan'},23:{ayahs:118,type:'Meccan'},24:{ayahs:64,type:'Medinan'},
  25:{ayahs:77,type:'Meccan'},26:{ayahs:227,type:'Meccan'},27:{ayahs:93,type:'Meccan'},
  28:{ayahs:88,type:'Meccan'},29:{ayahs:69,type:'Meccan'},30:{ayahs:60,type:'Meccan'},
  31:{ayahs:34,type:'Meccan'},32:{ayahs:30,type:'Meccan'},33:{ayahs:73,type:'Medinan'},
  34:{ayahs:54,type:'Meccan'},35:{ayahs:45,type:'Meccan'},36:{ayahs:83,type:'Meccan'},
  37:{ayahs:182,type:'Meccan'},38:{ayahs:88,type:'Meccan'},39:{ayahs:75,type:'Meccan'},
  40:{ayahs:85,type:'Meccan'},41:{ayahs:54,type:'Meccan'},42:{ayahs:53,type:'Meccan'},
  43:{ayahs:89,type:'Meccan'},44:{ayahs:59,type:'Meccan'},45:{ayahs:37,type:'Meccan'},
  46:{ayahs:35,type:'Meccan'},47:{ayahs:38,type:'Medinan'},48:{ayahs:29,type:'Medinan'},
  49:{ayahs:18,type:'Medinan'},50:{ayahs:45,type:'Meccan'},51:{ayahs:60,type:'Meccan'},
  52:{ayahs:49,type:'Meccan'},53:{ayahs:62,type:'Meccan'},54:{ayahs:55,type:'Meccan'},
  55:{ayahs:78,type:'Meccan'},56:{ayahs:96,type:'Meccan'},57:{ayahs:29,type:'Medinan'},
  58:{ayahs:22,type:'Medinan'},59:{ayahs:24,type:'Medinan'},60:{ayahs:13,type:'Medinan'},
  61:{ayahs:14,type:'Medinan'},62:{ayahs:11,type:'Medinan'},63:{ayahs:11,type:'Medinan'},
  64:{ayahs:18,type:'Medinan'},65:{ayahs:12,type:'Medinan'},66:{ayahs:12,type:'Medinan'},
  67:{ayahs:30,type:'Meccan'},68:{ayahs:52,type:'Meccan'},69:{ayahs:52,type:'Meccan'},
  70:{ayahs:44,type:'Meccan'},71:{ayahs:28,type:'Meccan'},72:{ayahs:28,type:'Meccan'},
  73:{ayahs:20,type:'Meccan'},74:{ayahs:56,type:'Meccan'},75:{ayahs:40,type:'Meccan'},
  76:{ayahs:31,type:'Medinan'},77:{ayahs:50,type:'Meccan'},78:{ayahs:40,type:'Meccan'},
  79:{ayahs:46,type:'Meccan'},80:{ayahs:42,type:'Meccan'},81:{ayahs:29,type:'Meccan'},
  82:{ayahs:19,type:'Meccan'},83:{ayahs:36,type:'Meccan'},84:{ayahs:25,type:'Meccan'},
  85:{ayahs:22,type:'Meccan'},86:{ayahs:17,type:'Meccan'},87:{ayahs:19,type:'Meccan'},
  88:{ayahs:26,type:'Meccan'},89:{ayahs:30,type:'Meccan'},90:{ayahs:20,type:'Meccan'},
  91:{ayahs:15,type:'Meccan'},92:{ayahs:21,type:'Meccan'},93:{ayahs:11,type:'Meccan'},
  94:{ayahs:8,type:'Meccan'},95:{ayahs:8,type:'Meccan'},96:{ayahs:19,type:'Meccan'},
  97:{ayahs:5,type:'Meccan'},98:{ayahs:8,type:'Medinan'},99:{ayahs:8,type:'Meccan'},
  100:{ayahs:11,type:'Meccan'},101:{ayahs:11,type:'Meccan'},102:{ayahs:8,type:'Meccan'},
  103:{ayahs:3,type:'Meccan'},104:{ayahs:9,type:'Meccan'},105:{ayahs:5,type:'Meccan'},
  106:{ayahs:4,type:'Meccan'},107:{ayahs:7,type:'Meccan'},108:{ayahs:3,type:'Meccan'},
  109:{ayahs:6,type:'Meccan'},110:{ayahs:3,type:'Medinan'},111:{ayahs:5,type:'Meccan'},
  112:{ayahs:4,type:'Meccan'},113:{ayahs:5,type:'Meccan'},114:{ayahs:6,type:'Meccan'},
};

const ARABIC_NAMES: Record<number, string> = {
  1:'الفاتحة',2:'البقرة',3:'آل عمران',4:'النساء',5:'المائدة',6:'الأنعام',7:'الأعراف',
  8:'الأنفال',9:'التوبة',10:'يونس',11:'هود',12:'يوسف',13:'الرعد',14:'إبراهيم',
  15:'الحجر',16:'النحل',17:'الإسراء',18:'الكهف',19:'مريم',20:'طه',21:'الأنبياء',
  22:'الحج',23:'المؤمنون',24:'النور',25:'الفرقان',26:'الشعراء',27:'النمل',28:'القصص',
  29:'العنكبوت',30:'الروم',31:'لقمان',32:'السجدة',33:'الأحزاب',34:'سبأ',35:'فاطر',
  36:'يس',37:'الصافات',38:'ص',39:'الزمر',40:'غافر',41:'فصلت',42:'الشورى',43:'الزخرف',
  44:'الدخان',45:'الجاثية',46:'الأحقاف',47:'محمد',48:'الفتح',49:'الحجرات',50:'ق',
  51:'الذاريات',52:'الطور',53:'النجم',54:'القمر',55:'الرحمن',56:'الواقعة',57:'الحديد',
  58:'المجادلة',59:'الحشر',60:'الممتحنة',61:'الصف',62:'الجمعة',63:'المنافقون',
  64:'التغابن',65:'الطلاق',66:'التحريم',67:'الملك',68:'القلم',69:'الحاقة',70:'المعارج',
  71:'نوح',72:'الجن',73:'المزمل',74:'المدثر',75:'القيامة',76:'الإنسان',77:'المرسلات',
  78:'النبأ',79:'النازعات',80:'عبس',81:'التكوير',82:'الانفطار',83:'المطففين',
  84:'الانشقاق',85:'البروج',86:'الطارق',87:'الأعلى',88:'الغاشية',89:'الفجر',90:'البلد',
  91:'الشمس',92:'الليل',93:'الضحى',94:'الشرح',95:'التين',96:'العلق',97:'القدر',
  98:'البينة',99:'الزلزلة',100:'العاديات',101:'القارعة',102:'التكاثر',103:'العصر',
  104:'الهمزة',105:'الفيل',106:'قريش',107:'الماعون',108:'الكوثر',109:'الكافرون',
  110:'النصر',111:'المسد',112:'الإخلاص',113:'الفلق',114:'الناس',
};

// Quran Foundation supported translations (language → { id, name })
export const TRANSLATIONS = [
  { id: 131, lang: 'English', name: 'Saheeh International' },
  { id: 22,  lang: 'English', name: 'Pickthall' },
  { id: 85,  lang: 'English', name: 'Yusuf Ali' },
  { id: 20,  lang: 'English', name: 'Sahih International (Dr. Mustafa Khattab)' },
  { id: 203, lang: 'Français', name: 'Muhammad Hamidullah (French)' },
  { id: 136, lang: 'Hausa', name: "Abubakar Mahmoud Gumi (Hausa)" },
  { id: 76,  lang: 'Deutsch', name: 'Bubenheim & Elyas (German)' },
  { id: 104, lang: 'Türkçe', name: 'Diyanet İşleri (Turkish)' },
  { id: 54,  lang: 'Bahasa Indonesia', name: 'Departemen Agama (Indonesian)' },
  { id: 134, lang: 'Русский', name: 'Kулиев (Russian)' },
  { id: 79,  lang: 'Español', name: 'El Corán (Spanish)' },
  { id: 149, lang: 'اردو', name: 'Fateh Muhammad Jalandhry (Urdu)' },
  { id: 161, lang: 'বাংলা', name: 'Muhiuddin Khan (Bengali)' },
  { id: 167, lang: 'فارسی', name: 'Hussain Ansarian (Persian)' },
  { id: 175, lang: 'Bosanski', name: 'Mlivo (Bosnian)' },
  { id: 45,  lang: 'Svenska', name: 'Bernström (Swedish)' },
];

type SurahEntry = {
  number: number;
  name: string;
  englishName: string;
  ayahs: number;
  type: 'Meccan' | 'Medinan';
};

const ALL_SURAHS: SurahEntry[] = Array.from({ length: 114 }, (_, i) => {
  const n = i + 1;
  return {
    number: n,
    name: ARABIC_NAMES[n] || '',
    englishName: SURAH_NAMES[n] || `Surah ${n}`,
    ayahs: SURAH_META[n]?.ayahs || 0,
    type: SURAH_META[n]?.type || 'Meccan',
  };
});

// Popular theme keywords → Surah numbers
const KEYWORD_MAP: Record<string, number[]> = {
  'friday': [62], 'jumu\'ah': [62], 'jumua': [62],
  'cave': [18], 'kahf': [18],
  'women': [4], 'nisa': [4],
  'light': [24], 'nur': [24],
  'throne': [2], 'baqarah': [2], 'cow': [2],
  'yasin': [36], 'yaseen': [36],
  'rehman': [55], 'rahman': [55], 'mercy': [55],
  'protection': [113, 114], 'refuge': [113, 114], 'falaq': [113], 'nas': [114],
  'ikhlas': [112], 'sincerity': [112], 'oneness': [112],
  'family': [3], 'imran': [3],
  'joseph': [12], 'yusuf': [12],
  'maryam': [19], 'mary': [19],
  'prophets': [21], 'anbiya': [21],
  'hajj': [22], 'pilgrimage': [22],
  'forgiveness': [39], 'zumar': [39],
  'mulk': [67], 'dominion': [67], 'sovereignty': [67],
  'fajr': [89], 'dawn': [89],
  'night': [92], 'morning': [93],
  'time': [103], 'asr': [103],
  'elephant': [105], 'fil': [105],
  'abundance': [108], 'kawthar': [108],
  'victory': [110], 'nasr': [110],
};

export default function QuranIndexPage() {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'Meccan' | 'Medinan'>('All');
  const [selectedTranslation, setSelectedTranslation] = useState(TRANSLATIONS[0]);
  const [showTranslationPicker, setShowTranslationPicker] = useState(false);
  const [cachedNumbers, setCachedNumbers] = useState<number[]>([]);
  const translationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getCachedSurahNumbers().then(setCachedNumbers);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (translationRef.current && !translationRef.current.contains(e.target as Node)) {
        setShowTranslationPicker(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Save selected translation to localStorage so the reader can pick it up
  useEffect(() => {
    localStorage.setItem('md_translation_id', String(selectedTranslation.id));
    localStorage.setItem('md_translation_name', selectedTranslation.name);
  }, [selectedTranslation]);

  const lowerSearch = search.toLowerCase().trim();

  // Check keyword map first
  const keywordMatches = lowerSearch
    ? (KEYWORD_MAP[lowerSearch] || [])
    : [];

  const filtered = ALL_SURAHS.filter((s) => {
    const matchesSearch = !lowerSearch ||
      s.englishName.toLowerCase().includes(lowerSearch) ||
      s.name.includes(search) ||
      String(s.number) === search ||
      keywordMatches.includes(s.number);
    const matchesType = filterType === 'All' || s.type === filterType;
    return matchesSearch && matchesType;
  });

  // Group results by keyword vs normal when doing keyword search
  const isKeywordSearch = keywordMatches.length > 0 && lowerSearch.length > 2;

  return (
    <div className="min-h-screen bg-background pb-8 fade-in">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border pt-6 pb-4 px-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-2xl font-semibold leading-tight">The Holy Quran</h1>
            <p className="text-xs text-muted-foreground mt-0.5">114 Surahs · Quran Foundation API</p>
          </div>

          {/* Translation Picker */}
          <div className="relative" ref={translationRef}>
            <button
              onClick={() => setShowTranslationPicker(v => !v)}
              className="flex items-center gap-1.5 text-xs bg-primary/10 text-primary border border-primary/20 rounded-full px-3 py-2 hover:bg-primary/20 transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="max-w-[110px] truncate">{selectedTranslation.lang}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showTranslationPicker ? 'rotate-180' : ''}`} />
            </button>

            {showTranslationPicker && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-popover border border-border rounded-2xl shadow-2xl z-50 overflow-hidden">
                <div className="p-2 max-h-80 overflow-y-auto">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 py-1.5 font-semibold">Select Translation</p>
                  {TRANSLATIONS.map(t => (
                    <button
                      key={t.id}
                      onClick={() => { setSelectedTranslation(t); setShowTranslationPicker(false); }}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-sm hover:bg-accent transition-colors flex flex-col gap-0.5 ${selectedTranslation.id === t.id ? 'bg-primary/10 text-primary' : ''}`}
                    >
                      <span className="font-medium">{t.lang}</span>
                      <span className="text-xs text-muted-foreground">{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            placeholder="Search by name, number, or topic (e.g. 'light', 'cave', 'friday')..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-9 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-2">
          {(['All', 'Meccan', 'Medinan'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                filterType === f
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground hover:border-primary/40'
              }`}
            >
              {f}
            </button>
          ))}
          {cachedNumbers.length > 0 && (
            <button
              onClick={() => setSearch('offline')}
              className="text-xs px-3 py-1.5 rounded-full border border-primary/20 text-primary bg-primary/10 hover:bg-primary/20 transition-colors ml-auto"
            >
              ✓ {cachedNumbers.length} Offline
            </button>
          )}
        </div>
      </div>

      {/* Keyword result banner */}
      {isKeywordSearch && (
        <div className="mx-4 mt-4 p-3 bg-primary/10 border border-primary/20 rounded-xl flex items-center gap-2 text-sm text-primary">
          <Mic className="w-4 h-4 shrink-0" />
          <span>Showing Surahs related to "<strong>{search}</strong>"</span>
        </div>
      )}

      {/* Stats bar */}
      <div className="px-6 pt-4 pb-2">
        <p className="text-xs text-muted-foreground">
          {filtered.length === 114 ? 'All 114 Surahs' : `${filtered.length} result${filtered.length !== 1 ? 's' : ''}`}
          {selectedTranslation && <span className="ml-2 text-primary">· {selectedTranslation.name}</span>}
        </p>
      </div>

      {/* List */}
      <div className="px-4 pb-4">
        <div className="space-y-2">
          {filtered.map((surah) => {
            const isOffline = cachedNumbers.includes(surah.number);
            return (
              <Link
                key={surah.number}
                href={`/dashboard/quran/${surah.number}?translation=${selectedTranslation.id}`}
                className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border hover:border-primary/40 hover:shadow-sm transition-all group"
              >
                {/* Number block */}
                <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
                  <div className="absolute inset-0 bg-primary/10 rotate-45 rounded-lg group-hover:rotate-90 transition-transform duration-500" />
                  <span className="text-sm font-semibold text-primary">{surah.number}</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-foreground truncate">{surah.englishName}</h2>
                  <p className="text-xs text-muted-foreground truncate capitalize">
                    {surah.type} · {surah.ayahs} Ayahs
                    {isOffline && <span className="text-primary ml-1.5">· Offline ✓</span>}
                  </p>
                </div>

                {/* Arabic */}
                <div className="text-right shrink-0">
                  <h3 className="font-quran text-lg text-primary">{surah.name}</h3>
                </div>
              </Link>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Book className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="font-medium">No surahs found</p>
              <p className="text-sm mt-1">Try searching by number, English name, or a topic like "light" or "cave"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
