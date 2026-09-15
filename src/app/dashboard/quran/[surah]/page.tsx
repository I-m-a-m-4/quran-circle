'use client';

import { useState, useEffect, useRef, use, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, Play, Pause, Bookmark, Share2, Type, Loader2, Radio } from 'lucide-react';
import { SURAH_NAMES } from '@/lib/quran-api';
import { saveReadingProgress, isBookmarked, addBookmark, removeBookmark } from '@/lib/storage/local';
import { cn } from '@/lib/utils';

const ARABIC_NAMES: Record<number, string> = {
  1:'الفاتحة',2:'البقرة',3:'آل عمران',4:'النساء',5:'المائدة',6:'الأنعام',
  7:'الأعراف',8:'الأنفال',9:'التوبة',10:'يونس',11:'هود',12:'يوسف',
  13:'الرعد',14:'إبراهيم',15:'الحجر',16:'النحل',17:'الإسراء',18:'الكهف',
  19:'مريم',20:'طه',21:'الأنبياء',22:'الحج',23:'المؤمنون',24:'النور',
  25:'الفرقان',26:'الشعراء',27:'النمل',28:'القصص',29:'العنكبوت',30:'الروم',
  31:'لقمان',32:'السجدة',33:'الأحزاب',34:'سبأ',35:'فاطر',36:'يس',
  37:'الصافات',38:'ص',39:'الزمر',40:'غافر',41:'فصلت',42:'الشورى',
  43:'الزخرف',44:'الدخان',45:'الجاثية',46:'الأحقاف',47:'محمد',48:'الفتح',
  49:'الحجرات',50:'ق',51:'الذاريات',52:'الطور',53:'النجم',54:'القمر',
  55:'الرحمن',56:'الواقعة',57:'الحديد',58:'المجادلة',59:'الحشر',60:'الممتحنة',
  61:'الصف',62:'الجمعة',63:'المنافقون',64:'التغابن',65:'الطلاق',66:'التحريم',
  67:'الملك',68:'القلم',69:'الحاقة',70:'المعارج',71:'نوح',72:'الجن',
  73:'المزمل',74:'المدثر',75:'القيامة',76:'الإنسان',77:'المرسلات',78:'النبأ',
  79:'النازعات',80:'عبس',81:'التكوير',82:'الانفطار',83:'المطففين',84:'الانشقاق',
  85:'البروج',86:'الطارق',87:'الأعلى',88:'الغاشية',89:'الفجر',90:'البلد',
  91:'الشمس',92:'الليل',93:'الضحى',94:'الشرح',95:'التين',96:'العلق',
  97:'القدر',98:'البينة',99:'الزلزلة',100:'العاديات',101:'القارعة',102:'التكاثر',
  103:'العصر',104:'الهمزة',105:'الفيل',106:'قريش',107:'الماعون',108:'الكوثر',
  109:'الكافرون',110:'النصر',111:'المسد',112:'الإخلاص',113:'الفلق',114:'الناس',
};

const SURAH_AYAH_COUNTS: Record<number, number> = {
  1:7,2:286,3:200,4:176,5:120,6:165,7:206,8:75,9:129,10:109,
  11:123,12:111,13:43,14:52,15:99,16:128,17:111,18:110,19:98,20:135,
  21:112,22:78,23:118,24:64,25:77,26:227,27:93,28:88,29:69,30:60,
  31:34,32:30,33:73,34:54,35:45,36:83,37:182,38:88,39:75,40:85,
  41:54,42:53,43:89,44:59,45:37,46:35,47:38,48:29,49:18,50:45,
  51:60,52:49,53:62,54:55,55:78,56:96,57:29,58:22,59:24,60:13,
  61:14,62:11,63:11,64:18,65:12,66:12,67:30,68:52,69:52,70:44,
  71:28,72:28,73:20,74:56,75:40,76:31,77:50,78:40,79:46,80:42,
  81:29,82:19,83:36,84:25,85:22,86:17,87:19,88:26,89:30,90:20,
  91:15,92:21,93:11,94:8,95:8,96:19,97:5,98:8,99:8,100:11,
  101:11,102:8,103:3,104:9,105:5,106:4,107:7,108:3,109:6,110:3,
  111:5,112:4,113:5,114:6,
};

// Reciters: reciterId from Quran Foundation / Quran.com API
const RECITERS = [
  { id: 7,  name: 'Mishary Alafasy' },
  { id: 1,  name: 'Abdul Basit (Murattal)' },
  { id: 6,  name: 'Husary' },
  { id: 9,  name: 'Minshawi (Murattal)' },
];

type AyahData = {
  verseKey: string;
  numberInSurah: number;
  arabicText: string;
  translation: string;
  audioUrl?: string;
};

export default function QuranReaderPage({ params }: { params: Promise<{ surah: string }> }) {
  const { surah: surahParam } = use(params);
  const surahNumber = parseInt(surahParam, 10);
  const totalAyahs = SURAH_AYAH_COUNTS[surahNumber] || 7;

  const [ayahs, setAyahs] = useState<AyahData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [reciterId, setReciterId] = useState(7); // Alafasy default
  const [fontSize, setFontSize] = useState(28);
  const [bookmarkedAyahs, setBookmarkedAyahs] = useState<Set<number>>(new Set());

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Build a verse key
  const vk = (n: number) => `${surahNumber}:${n}`;

  // Fetch a single ayah (text + translation) from our internal API
  const fetchAyah = async (ayahNum: number): Promise<AyahData> => {
    const key = vk(ayahNum);
    const res = await fetch(`/api/quran/verse?verseKey=${key}`);
    if (!res.ok) throw new Error(`Failed to fetch ${key}`);
    const data = await res.json();
    return {
      verseKey: key,
      numberInSurah: ayahNum,
      arabicText: data.text_uthmani || '',
      translation: data.translations?.[0]?.text?.replace(/<sup[^>]*>.*?<\/sup>/gi, '') || '',
    };
  };

  // Fetch audio URL from our internal API
  const fetchAudio = async (ayahNum: number, rid: number): Promise<string | undefined> => {
    try {
      const key = vk(ayahNum);
      const res = await fetch(`/api/quran/audio?verseKey=${key}&reciterId=${rid}`);
      if (!res.ok) return undefined;
      const data = await res.json();
      return data.audioUrl;
    } catch { return undefined; }
  };

  // Load all ayahs in one batch
  useEffect(() => {
    setAyahs([]);
    setLoading(true);
    setLoadingProgress(0);

    const load = async () => {
      try {
        const res = await fetch(`/api/quran/surah?surah=${surahNumber}`);
        if (!res.ok) throw new Error('Failed to fetch surah verses');
        const data = await res.json();
        
        if (data.verses) {
          const results: AyahData[] = data.verses.map((v: any) => {
            // Verse keys from API look like "1:1"
            const numStr = v.verse_key.split(':')[1];
            return {
              verseKey: v.verse_key,
              numberInSurah: parseInt(numStr, 10),
              arabicText: v.text_uthmani || '',
              translation: v.translations?.[0]?.text?.replace(/<sup[^>]*>.*?<\/sup>/gi, '') || '',
            };
          });
          
          setAyahs(results);
          setLoadingProgress(100);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
        saveReadingProgress(surahNumber, 1);
      }
    };

    load();

    // Init bookmarks
    const bs = new Set<number>();
    for (let i = 1; i <= totalAyahs; i++) {
      if (isBookmarked(surahNumber, i)) bs.add(i);
    }
    setBookmarkedAyahs(bs);

    return () => {
      audioRef.current?.pause();
    };
  }, [surahNumber, totalAyahs]);

  // Play / pause logic
  const playAyah = useCallback(async (ayahNum: number) => {
    const key = vk(ayahNum);
    if (playingKey === key && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    audioRef.current?.pause();
    setPlayingKey(key);
    setIsPlaying(false);

    // Fetch audio then play
    const cached = ayahs.find(a => a.numberInSurah === ayahNum)?.audioUrl;
    const url = cached || await fetchAudio(ayahNum, reciterId);

    // Cache on the ayah object
    if (url && !cached) {
      setAyahs(prev => prev.map(a => a.numberInSurah === ayahNum ? { ...a, audioUrl: url } : a));
    }

    if (!url) return;
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.play();
    setIsPlaying(true);

    audio.onended = () => {
      setIsPlaying(false);
      // Autoplay next
      if (ayahNum < totalAyahs) playAyah(ayahNum + 1);
      else setPlayingKey(null);
    };
  }, [ayahs, playingKey, isPlaying, reciterId, totalAyahs]);

  // Re-fetch audio when reciter changes for playing ayah
  useEffect(() => {
    if (playingKey) {
      const num = parseInt(playingKey.split(':')[1]);
      audioRef.current?.pause();
      setIsPlaying(false);
      playAyah(num);
    }
  }, [reciterId]);

  const toggleBookmark = (ayah: AyahData) => {
    if (bookmarkedAyahs.has(ayah.numberInSurah)) {
      const bm = JSON.parse(localStorage.getItem('md_bookmarks') || '[]').find(
        (b: any) => b.surahNumber === surahNumber && b.ayahNumber === ayah.numberInSurah
      );
      if (bm) removeBookmark(bm.id);
      setBookmarkedAyahs(prev => { const s = new Set(prev); s.delete(ayah.numberInSurah); return s; });
    } else {
      addBookmark({
        type: 'ayah',
        surahNumber,
        ayahNumber: ayah.numberInSurah,
        surahName: SURAH_NAMES[surahNumber],
        arabicText: ayah.arabicText,
        translation: ayah.translation,
      });
      setBookmarkedAyahs(prev => new Set(prev).add(ayah.numberInSurah));
    }
  };

  const surahName = SURAH_NAMES[surahNumber] || `Surah ${surahNumber}`;
  const surahArabic = ARABIC_NAMES[surahNumber] || '';

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/quran" className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors">
              <ChevronLeft size={20} />
            </Link>
            <div>
              <h1 className="font-semibold leading-tight">{surahName}</h1>
              <p className="text-[10px] text-muted-foreground">{totalAyahs} verses</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button onClick={() => setFontSize(f => Math.max(20, f - 4))} className="p-2 rounded-full hover:bg-muted text-muted-foreground">
              <Type size={14} />
            </button>
            <button onClick={() => setFontSize(f => Math.min(60, f + 4))} className="p-2 rounded-full hover:bg-muted text-muted-foreground">
              <Type size={18} />
            </button>
          </div>
        </div>

        {/* Reciter picker */}
        <div className="px-4 pb-3 flex items-center gap-2 overflow-x-auto hide-scrollbar">
          <Radio size={14} className="text-muted-foreground shrink-0" />
          {RECITERS.map(r => (
            <button
              key={r.id}
              onClick={() => setReciterId(r.id)}
              className={cn(
                'flex-shrink-0 text-xs px-3 py-1 rounded-full border transition-colors',
                r.id === reciterId
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:border-primary/40'
              )}
            >
              {r.name}
            </button>
          ))}
        </div>
      </div>

      {/* Surah title block */}
      <div className="py-10 px-6 text-center bg-card border-b border-border mb-6">
        <h2 className="font-quran text-4xl text-primary mb-2">{surahArabic}</h2>
        {surahNumber !== 1 && surahNumber !== 9 && (
          <p className="font-quran text-xl text-muted-foreground mt-4">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
        )}
      </div>

      {/* Loading progress */}
      {loading && ayahs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
          <Loader2 className="animate-spin w-8 h-8 text-primary" />
          <p className="text-sm">Loading verses...</p>
        </div>
      )}

      {/* Progress bar while streaming */}
      {loading && ayahs.length > 0 && (
        <div className="px-6 mb-4">
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground text-right mt-1">
            {loadingProgress}%
          </p>
        </div>
      )}

      {/* Ayahs */}
      <div className="max-w-3xl mx-auto px-4 space-y-6">
        {ayahs.map((ayah) => {
          let text = ayah.arabicText;
          // Remove Bismillah prefix from first ayah of non-Fatiha surahs
          if (surahNumber !== 1 && ayah.numberInSurah === 1) {
            text = text.replace(/^بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ\s*/, '');
          }

          const isActive = playingKey === ayah.verseKey;
          const isBm = bookmarkedAyahs.has(ayah.numberInSurah);

          return (
            <div
              key={ayah.verseKey}
              className={cn(
                'ayah-row group relative p-4 rounded-xl transition-colors',
                isActive ? 'bg-primary/5 ring-1 ring-primary/20' : 'hover:bg-muted/30'
              )}
              data-ayah={ayah.numberInSurah}
            >
              {/* Action Bar */}
              <div className="flex items-center justify-between mb-4">
                <span className="w-8 h-8 flex items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                  {ayah.numberInSurah}
                </span>

                <div className="flex items-center gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => playAyah(ayah.numberInSurah)}
                    className={cn(
                      'p-2 rounded-full hover:bg-primary/10 transition-colors',
                      isActive ? 'text-primary bg-primary/10' : 'text-muted-foreground'
                    )}
                  >
                    {isActive && isPlaying ? <Pause size={16} /> : <Play size={16} className={isActive ? 'fill-primary' : ''} />}
                  </button>
                  <button
                    onClick={() => toggleBookmark(ayah)}
                    className={cn('p-2 rounded-full hover:bg-primary/10 transition-colors', isBm ? 'text-primary' : 'text-muted-foreground')}
                  >
                    <Bookmark size={16} className={isBm ? 'fill-primary' : ''} />
                  </button>
                  <button
                    onClick={() => navigator.share?.({ text: `${text}\n\n— ${surahName} ${ayah.verseKey}\n\n${ayah.translation}` })}
                    className="p-2 rounded-full hover:bg-primary/10 text-muted-foreground transition-colors"
                  >
                    <Share2 size={16} />
                  </button>
                </div>
              </div>

              {/* Arabic text */}
              <div
                className={cn('quran-text mb-6 text-foreground leading-[2.2]', isActive && 'text-primary')}
                style={{ fontSize: `${fontSize}px` }}
                dir="rtl"
              >
                {text} <span className="text-primary/40 mx-1 text-[0.8em]">۝{ayah.numberInSurah}</span>
              </div>

              {/* Translation (Saheeh International) */}
              <div className="text-muted-foreground text-sm leading-relaxed">
                {ayah.translation}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
