'use client';

import { useState, useEffect, useRef, use, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ChevronLeft, 
  Play, 
  Pause, 
  Bookmark, 
  Type, 
  Loader2, 
  Radio, 
  WifiOff, 
  Download, 
  CheckCircle2, 
  Globe, 
  BookOpen, 
  List, 
  Eye, 
  EyeOff, 
  ChevronRight, 
  Check, 
  Copy,
  X
} from 'lucide-react';
import { SURAH_NAMES } from '@/lib/quran-api';
import { saveReadingProgress, isBookmarked, addBookmark, removeBookmark } from '@/lib/storage/local';
import { cn } from '@/lib/utils';
import { getSurahOffline, saveSurahOffline, deleteSurahOffline, getCachedSurahNumbers } from '@/lib/db/quran-offline';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

const RECITERS = [
  { id: 7,  name: 'Mishary Alafasy' },
  { id: 1,  name: 'Abdul Basit (Murattal)' },
  { id: 6,  name: 'Husary' },
  { id: 9,  name: 'Minshawi (Murattal)' },
];

const AVAILABLE_TRANSLATIONS = [
  { id: 20,  name: 'Saheeh International' },
  { id: 85,  name: 'M.A.S. Abdel Haleem' },
  { id: 22,  name: 'Yusuf Ali' },
  { id: 19,  name: 'Pickthall' },
  { id: 84,  name: 'Mufti Taqi Usmani' },
  { id: 203, name: 'Al-Hilali & Khan' },
];

const TAFSIR_OPTIONS = [
  { slug: 'ibn-kathir', name: 'Tafsir Ibn Kathir (Abridged)' },
  { slug: 'maarif', name: "Ma'arif al-Qur'an (Shafi)" },
];

type AyahData = {
  verseKey: string;
  numberInSurah: number;
  arabicText: string;
  translation: string;
  transliteration?: string;
  audioUrl?: string;
};

const toArabicDigits = (num: number) => {
  const digits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().split('').map(d => digits[parseInt(d, 10)] || d).join('');
};

export default function QuranReaderClient({ params }: { params: Promise<{ surah: string }> }) {
  const { surah: surahParam } = use(params);
  const searchParams = useSearchParams();
  const surahNumber = parseInt(surahParam, 10);
  const totalAyahs = SURAH_AYAH_COUNTS[surahNumber] || 7;

  // Translation State
  const [selectedTranslationId, setSelectedTranslationId] = useState(() => {
    const fromUrl = searchParams.get('translation');
    if (fromUrl) return parseInt(fromUrl, 10);
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('md_translation_id');
      if (saved) return parseInt(saved, 10);
    }
    return 20;
  });

  const translationName = 
    AVAILABLE_TRANSLATIONS.find(t => t.id === selectedTranslationId)?.name || 'Saheeh International';

  // View Mode: 'book' vs 'verse'
  const [viewMode, setViewMode] = useState<'book' | 'verse'>('book');

  // Display toggles
  const [showTranslation, setShowTranslation] = useState(true);
  const [showTransliteration, setShowTransliteration] = useState(true);

  const [ayahs, setAyahs] = useState<AyahData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isCachedOffline, setIsCachedOffline] = useState(false);
  const [isSavingOffline, setIsSavingOffline] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Active / Playing Ayah
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedAyahNumber, setSelectedAyahNumber] = useState<number | null>(1);
  const [reciterId, setReciterId] = useState(7);
  const [fontSize, setFontSize] = useState(30);
  const [bookmarkedAyahs, setBookmarkedAyahs] = useState<Set<number>>(new Set());

  // Tafsir Sheet State
  const [tafsirOpen, setTafsirOpen] = useState(false);
  const [tafsirVerseKey, setTafsirVerseKey] = useState<string | null>(null);
  const [tafsirSlug, setTafsirSlug] = useState<'ibn-kathir' | 'maarif'>('ibn-kathir');
  const [tafsirContent, setTafsirContent] = useState<string | null>(null);
  const [tafsirLoading, setTafsirLoading] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const vk = (n: number) => `${surahNumber}:${n}`;

  // Load saved preferences
  useEffect(() => {
    try {
      const savedView = localStorage.getItem('md_quran_view_mode');
      if (savedView === 'book' || savedView === 'verse') setViewMode(savedView);
      const savedTrans = localStorage.getItem('md_show_translation');
      if (savedTrans !== null) setShowTranslation(savedTrans === 'true');
      const savedTranslit = localStorage.getItem('md_show_transliteration');
      if (savedTranslit !== null) setShowTransliteration(savedTranslit === 'true');
    } catch {}
  }, []);

  const handleSetViewMode = (mode: 'book' | 'verse') => {
    setViewMode(mode);
    try { localStorage.setItem('md_quran_view_mode', mode); } catch {}
  };

  const handleToggleTranslation = () => {
    setShowTranslation(prev => {
      const next = !prev;
      try { localStorage.setItem('md_show_translation', String(next)); } catch {}
      return next;
    });
  };

  const handleToggleTransliteration = () => {
    setShowTransliteration(prev => {
      const next = !prev;
      try { localStorage.setItem('md_show_transliteration', String(next)); } catch {}
      return next;
    });
  };

  // Fetch audio URL
  const fetchAudio = async (ayahNum: number, rid: number): Promise<string | undefined> => {
    const key = vk(ayahNum);
    try {
      const res = await fetch(`/api/quran/audio?verseKey=${key}&reciterId=${rid}`);
      if (res.ok) {
        const data = await res.json();
        if (data.audioUrl) return data.audioUrl;
      }
    } catch {}

    try {
      const directRes = await fetch(`https://api.quran.com/api/v4/recitations/${rid}/by_ayah/${key}`);
      if (directRes.ok) {
        const data = await directRes.json();
        const url = data.audio_files?.[0]?.url;
        if (url) return url.startsWith('http') ? url : `https://verses.quran.com/${url}`;
      }
    } catch {}

    return undefined;
  };

  // Load all ayahs
  useEffect(() => {
    setAyahs([]);
    setLoading(true);
    setLoadingProgress(0);

    const load = async () => {
      // 1. Try offline cache first
      const cached = await getSurahOffline(surahNumber);
      if (cached && cached.ayahs && cached.ayahs.length > 0) {
        setAyahs(cached.ayahs as AyahData[]);
        setIsCachedOffline(true);
        setIsOfflineMode(!navigator.onLine);
        setLoadingProgress(100);
        setLoading(false);
        saveReadingProgress(surahNumber, 1);
        return;
      }

      // 2. Fetch from network
      let fetchedVerses: any[] | null = null;

      try {
        const res = await fetch(`/api/quran/surah?surah=${surahNumber}&translation=${selectedTranslationId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.verses && data.verses.length > 0) {
            fetchedVerses = data.verses;
          }
        }
      } catch {}

      // Fallback directly to public Quran.com API
      if (!fetchedVerses) {
        try {
          const directUrl = `https://api.quran.com/api/v4/verses/by_chapter/${surahNumber}?language=en&words=false&translations=${selectedTranslationId},57&fields=text_uthmani&per_page=300`;
          const directRes = await fetch(directUrl);
          if (directRes.ok) {
            const directData = await directRes.json();
            if (directData.verses) {
              fetchedVerses = directData.verses;
            }
          }
        } catch (e) {
          console.error('Direct verses fetch failed:', e);
        }
      }

      if (fetchedVerses && fetchedVerses.length > 0) {
        const results: AyahData[] = fetchedVerses.map((v: any) => {
          const numStr = v.verse_key ? v.verse_key.split(':')[1] : String(v.verse_number || 1);
          const transList = v.translations || [];
          
          const translitObj = transList.find((t: any) => t.resource_id === 57);
          const transliteration = translitObj ? translitObj.text : '';

          const primaryTransObj = transList.find((t: any) => t.resource_id !== 57) || transList[0];
          const translation = primaryTransObj?.text?.replace(/<sup[^>]*>.*?<\/sup>/gi, '') || '';

          return {
            verseKey: v.verse_key || `${surahNumber}:${numStr}`,
            numberInSurah: parseInt(numStr, 10),
            arabicText: v.text_uthmani || '',
            translation,
            transliteration,
          };
        });
        
        setAyahs(results);
        setLoadingProgress(100);
      }
      setLoading(false);
      saveReadingProgress(surahNumber, 1);
    };

    load();

    getCachedSurahNumbers().then(nums => setIsCachedOffline(nums.includes(surahNumber)));

    const bs = new Set<number>();
    for (let i = 1; i <= totalAyahs; i++) {
      if (isBookmarked(surahNumber, i)) bs.add(i);
    }
    setBookmarkedAyahs(bs);

    return () => {
      audioRef.current?.pause();
    };
  }, [surahNumber, totalAyahs, selectedTranslationId]);

  // Audio Play / Pause
  const playAyah = useCallback(async (ayahNum: number) => {
    const key = vk(ayahNum);
    if (playingKey === key && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    audioRef.current?.pause();
    setPlayingKey(key);
    setSelectedAyahNumber(ayahNum);
    setIsPlaying(false);

    const cached = ayahs.find(a => a.numberInSurah === ayahNum)?.audioUrl;
    const url = cached || await fetchAudio(ayahNum, reciterId);

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
      if (ayahNum < totalAyahs) playAyah(ayahNum + 1);
      else setPlayingKey(null);
    };
  }, [ayahs, playingKey, isPlaying, reciterId, totalAyahs]);

  // Full Surah Play / Pause handler
  const handlePlayFullSurah = () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      const startAyah = selectedAyahNumber || 1;
      playAyah(startAyah);
    }
  };

  // Open Tafsir for Ayah
  const openTafsir = async (verseKey: string) => {
    setTafsirVerseKey(verseKey);
    setTafsirOpen(true);
    setTafsirLoading(true);
    setTafsirContent(null);

    try {
      const res = await fetch(`/api/quran/tafsir?verseKey=${verseKey}&tafsir=${tafsirSlug}`);
      if (res.ok) {
        const data = await res.json();
        if (data.text) {
          setTafsirContent(data.text);
          setTafsirLoading(false);
          return;
        }
      }
    } catch {}

    try {
      const id = tafsirSlug === 'maarif' ? 168 : 169;
      const directRes = await fetch(`https://api.quran.com/api/v4/tafsirs/${id}/by_ayah/${verseKey}`);
      if (directRes.ok) {
        const directData = await directRes.json();
        if (directData.tafsir?.text) {
          setTafsirContent(directData.tafsir.text);
          setTafsirLoading(false);
          return;
        }
      }
    } catch (e) {
      console.error('Tafsir fetch error:', e);
    }

    setTafsirContent('Tafsir commentary could not be retrieved at this time.');
    setTafsirLoading(false);
  };

  useEffect(() => {
    if (tafsirOpen && tafsirVerseKey) {
      openTafsir(tafsirVerseKey);
    }
  }, [tafsirSlug]);

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

  const handleToggleOffline = async () => {
    if (ayahs.length === 0) return;
    setIsSavingOffline(true);
    if (isCachedOffline) {
      await deleteSurahOffline(surahNumber);
      setIsCachedOffline(false);
    } else {
      await saveSurahOffline({
        surahNumber,
        name: surahName,
        arabicName: surahArabic,
        ayahs,
        cachedAt: Date.now(),
      });
      setIsCachedOffline(true);
    }
    setIsSavingOffline(false);
  };

  const activeAyahObj = selectedAyahNumber 
    ? ayahs.find(a => a.numberInSurah === selectedAyahNumber) 
    : (playingKey ? ayahs.find(a => a.verseKey === playingKey) : ayahs[0]);

  return (
    /* Outer negative margins cancel the parent padding so header connects flush with TopBar without gap */
    <div className="-m-4 md:-m-6 lg:-m-8 min-h-screen bg-background pb-36 relative">
      {/* Flush Sticky Header (Zero Gap below TopBar) */}
      <div className="sticky top-0 z-30 bg-background/98 backdrop-blur-md border-b border-border shadow-sm">
        <div className="flex items-center justify-between px-4 md:px-6 h-14 max-w-6xl mx-auto">
          {/* Back & Title */}
          <div className="flex items-center gap-3">
            <Link 
              href="/dashboard/quran" 
              className="p-2 -ml-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft size={20} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-semibold text-sm md:text-base leading-tight text-foreground">{surahName}</h1>
                <span className="font-arabic text-primary text-sm font-bold">{surahArabic}</span>
              </div>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                <span>{totalAyahs} Verses</span>
                <span>•</span>
                {isCachedOffline ? (
                  <span className="text-emerald-500 font-medium flex items-center gap-0.5">
                    <CheckCircle2 size={11} /> Offline
                  </span>
                ) : (
                  <span>Online</span>
                )}
                {isOfflineMode && (
                  <span className="text-amber-500 font-medium flex items-center gap-0.5 bg-amber-500/10 px-1.5 rounded">
                    <WifiOff size={10} /> Offline Mode
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Right Controls: Play All, View Mode, Offline */}
          <div className="flex items-center gap-2">
            {/* Play Entire Surah Button */}
            <button
              onClick={handlePlayFullSurah}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-sm",
                isPlaying
                  ? "bg-primary text-primary-foreground shadow-primary/30"
                  : "bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30"
              )}
              title={isPlaying ? "Pause Surah" : "Play Surah"}
            >
              {isPlaying ? <Pause size={13} className="fill-current" /> : <Play size={13} className="fill-current" />}
              <span>{isPlaying ? 'Pause' : 'Play Surah'}</span>
            </button>

            {/* View Mode Segmented Pill */}
            <div className="flex items-center bg-muted/70 p-1 rounded-xl border border-border/60">
              <button
                onClick={() => handleSetViewMode('book')}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all",
                  viewMode === 'book' 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="Book View (Mushaf Mode)"
              >
                <BookOpen size={13} />
                <span className="hidden sm:inline">Book View</span>
              </button>
              <button
                onClick={() => handleSetViewMode('verse')}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all",
                  viewMode === 'verse' 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="Verse View (List Mode)"
              >
                <List size={13} />
                <span className="hidden sm:inline">Verse View</span>
              </button>
            </div>

            {/* Offline Button */}
            <button
              onClick={handleToggleOffline}
              disabled={isSavingOffline || loading}
              title={isCachedOffline ? "Saved Offline (Tap to remove)" : "Download for Offline Use"}
              className={cn(
                "p-2 rounded-xl border transition-all text-xs flex items-center gap-1.5",
                isCachedOffline
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                  : "bg-card border-border hover:bg-accent text-muted-foreground hover:text-foreground"
              )}
            >
              {isSavingOffline ? (
                <Loader2 size={16} className="animate-spin text-primary" />
              ) : isCachedOffline ? (
                <>
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  <span className="hidden md:inline font-medium">Offline</span>
                </>
              ) : (
                <>
                  <Download size={16} />
                  <span className="hidden md:inline font-medium">Offline</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Toolbar Sub-bar: Translation & Transliteration Toggles, Sizing */}
        <div className="border-t border-border/40 bg-card/60 backdrop-blur-sm px-4 md:px-6 py-2">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 overflow-x-auto hide-scrollbar">
            {/* Toggles */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleToggleTranslation}
                className={cn(
                  "flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border transition-all",
                  showTranslation
                    ? "bg-primary/10 border-primary/30 text-primary font-medium"
                    : "bg-card border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {showTranslation ? <Eye size={12} /> : <EyeOff size={12} />}
                <span>Translation</span>
              </button>

              <button
                onClick={handleToggleTransliteration}
                className={cn(
                  "flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border transition-all",
                  showTransliteration
                    ? "bg-primary/10 border-primary/30 text-primary font-medium"
                    : "bg-card border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {showTransliteration ? <Eye size={12} /> : <EyeOff size={12} />}
                <span>Transliteration</span>
              </button>

              {/* Translation Selection */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border border-border bg-card hover:bg-accent text-muted-foreground hover:text-foreground transition-all">
                    <Globe size={12} className="text-primary" />
                    <span className="max-w-[130px] truncate">{translationName}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuLabel className="text-xs">Select Translation</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {AVAILABLE_TRANSLATIONS.map(t => (
                    <DropdownMenuItem
                      key={t.id}
                      onClick={() => {
                        setSelectedTranslationId(t.id);
                        try {
                          localStorage.setItem('md_translation_id', String(t.id));
                          localStorage.setItem('md_translation_name', t.name);
                        } catch {}
                      }}
                      className={cn("text-xs justify-between", t.id === selectedTranslationId && "font-semibold text-primary")}
                    >
                      <span>{t.name}</span>
                      {t.id === selectedTranslationId && <Check size={14} className="text-primary" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Font & Reciter */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg border border-border/50">
                <button
                  onClick={() => setFontSize(f => Math.max(22, f - 2))}
                  className="px-2 py-0.5 rounded text-xs text-muted-foreground hover:text-foreground transition-colors"
                  title="Smaller Arabic Font"
                >
                  A-
                </button>
                <span className="text-[10px] text-muted-foreground px-1 font-mono">{fontSize}px</span>
                <button
                  onClick={() => setFontSize(f => Math.min(52, f + 2))}
                  className="px-2 py-0.5 rounded text-xs text-muted-foreground hover:text-foreground transition-colors"
                  title="Larger Arabic Font"
                >
                  A+
                </button>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border border-border bg-card hover:bg-accent text-muted-foreground hover:text-foreground transition-all">
                    <Radio size={12} className="text-primary" />
                    <span className="truncate max-w-[130px]">
                      {RECITERS.find(r => r.id === reciterId)?.name || 'Reciter'}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel className="text-xs">Reciter Audio</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {RECITERS.map(r => (
                    <DropdownMenuItem
                      key={r.id}
                      onClick={() => setReciterId(r.id)}
                      className={cn("text-xs justify-between", r.id === reciterId && "font-semibold text-primary")}
                    >
                      <span>{r.name}</span>
                      {r.id === reciterId && <Check size={14} className="text-primary" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Main Reading Canvas */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 pt-6">
        {/* Surah Header Card */}
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-b from-primary/10 via-card to-card p-6 md:p-8 text-center mb-8 shadow-sm">
          <div className="relative z-10">
            <h2 className="font-quran text-4xl md:text-5xl text-primary mb-3 drop-shadow-sm">{surahArabic}</h2>
            <h3 className="font-semibold text-lg text-foreground">{surahName}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Surah #{surahNumber} • {totalAyahs} Verses
            </p>

            {surahNumber !== 1 && surahNumber !== 9 && (
              <div className="mt-6 pt-5 border-t border-border/50 max-w-sm mx-auto">
                <p className="font-quran text-2xl text-foreground/90 leading-relaxed">
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </p>
                <p className="text-xs text-muted-foreground mt-1 italic">
                  In the name of Allah, the Entirely Merciful, the Especially Merciful
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
            <Loader2 className="animate-spin w-8 h-8 text-primary" />
            <p className="text-sm">Loading authentic Quran verses...</p>
          </div>
        )}

        {/* ============================================================== */}
        {/* 1. BOOK VIEW (Continuous Flowing Mushaf Page)                  */}
        {/* ============================================================== */}
        {!loading && viewMode === 'book' && (
          <div className="relative">
            {/* Mushaf Page Frame */}
            <div className="rounded-3xl border-2 border-primary/20 bg-card/90 shadow-2xl p-6 md:p-12 relative overflow-hidden backdrop-blur-sm">
              <div className="absolute inset-3 rounded-2xl border border-primary/15 pointer-events-none" />

              <div 
                className="quran-text text-foreground leading-[2.8] md:leading-[3.2] text-justify text-right"
                dir="rtl"
                style={{ fontSize: `${fontSize}px` }}
              >
                {ayahs.map((ayah) => {
                  let text = ayah.arabicText;
                  if (surahNumber !== 1 && ayah.numberInSurah === 1) {
                    text = text.replace(/^بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ\s*/, '');
                  }

                  const isPlayingThis = playingKey === ayah.verseKey;
                  const isSelected = selectedAyahNumber === ayah.numberInSurah;
                  const isBm = bookmarkedAyahs.has(ayah.numberInSurah);

                  return (
                    <span
                      key={ayah.verseKey}
                      id={`ayah-${ayah.numberInSurah}`}
                      onClick={() => setSelectedAyahNumber(ayah.numberInSurah)}
                      className={cn(
                        "transition-all duration-200 cursor-pointer rounded-lg px-1 inline hover:bg-primary/15",
                        isPlayingThis && "bg-primary/25 text-primary font-bold shadow-sm ring-1 ring-primary/40",
                        isSelected && !isPlayingThis && "bg-primary/10 ring-1 ring-primary/30",
                        isBm && "decoration-primary/40 underline decoration-wavy underline-offset-8"
                      )}
                    >
                      {text}{' '}
                      <span 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAyahNumber(ayah.numberInSurah);
                        }}
                        className={cn(
                          "inline-flex items-center justify-center mx-1.5 px-2 py-0.5 rounded-full border text-[0.6em] font-arabic select-none cursor-pointer transition-all shadow-sm",
                          isPlayingThis
                            ? "bg-primary text-primary-foreground border-primary scale-110"
                            : isSelected
                            ? "bg-primary/20 text-primary border-primary font-bold"
                            : "border-primary/30 text-primary bg-primary/5 hover:bg-primary/20 hover:scale-105"
                        )}
                        title={`Ayah ${ayah.numberInSurah} (Click to see translation & tafsir)`}
                      >
                        ۝ {toArabicDigits(ayah.numberInSurah)}
                      </span>
                    </span>
                  );
                })}
              </div>

              {/* Mushaf Page Footer */}
              <div className="mt-10 pt-4 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                <span>{surahName}</span>
                <span className="font-arabic font-bold text-primary">{surahArabic}</span>
                <span>{totalAyahs} Ayahs</span>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 2. VERSE VIEW (List Mode)                                      */}
        {/* ============================================================== */}
        {!loading && viewMode === 'verse' && (
          <div className="space-y-4">
            {ayahs.map((ayah) => {
              let text = ayah.arabicText;
              if (surahNumber !== 1 && ayah.numberInSurah === 1) {
                text = text.replace(/^بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ\s*/, '');
              }

              const isActive = playingKey === ayah.verseKey;
              const isBm = bookmarkedAyahs.has(ayah.numberInSurah);

              return (
                <div
                  key={ayah.verseKey}
                  id={`ayah-card-${ayah.numberInSurah}`}
                  className={cn(
                    "p-5 rounded-2xl border transition-all bg-card/80 backdrop-blur-sm",
                    isActive
                      ? "border-primary/50 shadow-md ring-1 ring-primary/20 bg-primary/5"
                      : "border-border hover:border-primary/30 hover:shadow-sm"
                  )}
                >
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/40">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                        {ayah.numberInSurah}
                      </span>
                      <span className="text-xs text-muted-foreground font-medium">
                        {ayah.verseKey}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => playAyah(ayah.numberInSurah)}
                        className={cn(
                          "p-2 rounded-xl text-xs flex items-center gap-1 transition-all border",
                          isActive && isPlaying
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted/60 hover:bg-accent text-muted-foreground hover:text-foreground border-border"
                        )}
                        title="Listen to recitation"
                      >
                        {isActive && isPlaying ? <Pause size={14} /> : <Play size={14} />}
                        <span className="hidden sm:inline font-medium">
                          {isActive && isPlaying ? 'Pause' : 'Play'}
                        </span>
                      </button>

                      <button
                        onClick={() => openTafsir(ayah.verseKey)}
                        className="p-2 rounded-xl text-xs flex items-center gap-1 border border-primary/20 bg-primary/5 text-primary hover:bg-primary/15 transition-all font-medium"
                        title="View Tafsir commentary"
                      >
                        <BookOpen size={14} />
                        <span className="hidden sm:inline">Tafsir</span>
                      </button>

                      <button
                        onClick={() => toggleBookmark(ayah)}
                        className={cn(
                          "p-2 rounded-xl text-xs border transition-all",
                          isBm 
                            ? "bg-primary/15 text-primary border-primary/30" 
                            : "bg-card border-border hover:bg-accent text-muted-foreground"
                        )}
                        title="Bookmark Ayah"
                      >
                        <Bookmark size={14} className={isBm ? "fill-primary" : ""} />
                      </button>

                      <button
                        onClick={() => navigator.clipboard?.writeText(
                          `${text}\n\n${ayah.translation}\n— ${surahName} (${ayah.verseKey})`
                        )}
                        className="p-2 rounded-xl text-xs border border-border bg-card hover:bg-accent text-muted-foreground hover:text-foreground transition-all"
                        title="Copy verse"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>

                  <div
                    className={cn(
                      "quran-text text-foreground leading-[2.3] mb-4 text-right",
                      isActive && "text-primary font-semibold"
                    )}
                    style={{ fontSize: `${fontSize}px` }}
                    dir="rtl"
                  >
                    {text}{' '}
                    <span className="text-primary/40 mx-1 text-[0.8em] font-arabic">
                      ۝{toArabicDigits(ayah.numberInSurah)}
                    </span>
                  </div>

                  {showTransliteration && ayah.transliteration && (
                    <div className="mb-2 text-xs md:text-sm text-primary/80 font-serif italic leading-relaxed">
                      {ayah.transliteration}
                    </div>
                  )}

                  {showTranslation && ayah.translation && (
                    <div className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                      {ayah.translation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* PERSISTENT FLOATING AYAH DOCK (Visible on Viewport in Book View) */}
      {/* ============================================================== */}
      {viewMode === 'book' && activeAyahObj && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-2xl bg-card/95 backdrop-blur-2xl border border-primary/30 shadow-[0_10px_40px_rgba(0,0,0,0.35)] rounded-2xl p-4 md:p-5 transition-all animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/50">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-primary/15 text-primary text-xs font-bold flex items-center justify-center">
                {activeAyahObj.numberInSurah}
              </span>
              <div>
                <span className="text-xs font-bold text-foreground">
                  {surahName} {activeAyahObj.verseKey}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Prev Verse */}
              <button
                onClick={() => {
                  if (activeAyahObj.numberInSurah > 1) {
                    const prevNum = activeAyahObj.numberInSurah - 1;
                    setSelectedAyahNumber(prevNum);
                    if (isPlaying) playAyah(prevNum);
                  }
                }}
                disabled={activeAyahObj.numberInSurah <= 1}
                className="p-1.5 rounded-lg border border-border bg-card hover:bg-accent text-muted-foreground disabled:opacity-30 transition-colors"
                title="Previous Ayah"
              >
                <ChevronLeft size={14} />
              </button>

              {/* Play / Pause */}
              <button
                onClick={() => playAyah(activeAyahObj.numberInSurah)}
                className={cn(
                  "px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1 border transition-all font-medium",
                  playingKey === activeAyahObj.verseKey && isPlaying
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-primary/10 hover:bg-primary/20 text-primary border-primary/20"
                )}
              >
                {playingKey === activeAyahObj.verseKey && isPlaying ? <Pause size={13} /> : <Play size={13} className="fill-current" />}
                <span className="hidden sm:inline">
                  {playingKey === activeAyahObj.verseKey && isPlaying ? 'Pause' : 'Listen'}
                </span>
              </button>

              {/* Next Verse */}
              <button
                onClick={() => {
                  if (activeAyahObj.numberInSurah < totalAyahs) {
                    const nextNum = activeAyahObj.numberInSurah + 1;
                    setSelectedAyahNumber(nextNum);
                    if (isPlaying) playAyah(nextNum);
                  }
                }}
                disabled={activeAyahObj.numberInSurah >= totalAyahs}
                className="p-1.5 rounded-lg border border-border bg-card hover:bg-accent text-muted-foreground disabled:opacity-30 transition-colors"
                title="Next Ayah"
              >
                <ChevronRight size={14} />
              </button>

              {/* Tafsir Button */}
              <button
                onClick={() => openTafsir(activeAyahObj.verseKey)}
                className="px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 font-medium transition-all"
                title="Read Tafsir commentary"
              >
                <BookOpen size={13} />
                <span>Tafsir</span>
              </button>

              {/* Bookmark */}
              <button
                onClick={() => toggleBookmark(activeAyahObj)}
                className={cn(
                  "p-1.5 rounded-lg border transition-all",
                  bookmarkedAyahs.has(activeAyahObj.numberInSurah)
                    ? "bg-primary/15 text-primary border-primary/30"
                    : "bg-card border-border hover:bg-accent text-muted-foreground"
                )}
                title="Bookmark Ayah"
              >
                <Bookmark size={14} className={bookmarkedAyahs.has(activeAyahObj.numberInSurah) ? "fill-primary" : ""} />
              </button>

              {/* Copy */}
              <button
                onClick={() => navigator.clipboard?.writeText(
                  `${activeAyahObj.arabicText}\n\n${activeAyahObj.translation}\n— ${surahName} (${activeAyahObj.verseKey})`
                )}
                className="p-1.5 rounded-lg border border-border bg-card hover:bg-accent text-muted-foreground transition-all"
                title="Copy verse text"
              >
                <Copy size={14} />
              </button>

              {/* Dismiss */}
              <button
                onClick={() => setSelectedAyahNumber(null)}
                className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground ml-1"
                title="Hide Inspector"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Active Ayah Transliteration & Translation Display */}
          <div className="pt-2.5 max-h-40 overflow-y-auto space-y-1.5 pr-1">
            {showTransliteration && activeAyahObj.transliteration && (
              <p className="text-xs md:text-sm text-primary/80 font-serif italic">
                {activeAyahObj.transliteration}
              </p>
            )}

            {showTranslation ? (
              <p className="text-xs md:text-sm text-foreground/90 leading-relaxed font-sans">
                {activeAyahObj.translation || '(Translation not available for this verse)'}
              </p>
            ) : (
              <div className="flex items-center justify-between text-xs text-muted-foreground py-0.5">
                <span className="italic">Translation is currently hidden.</span>
                <button 
                  onClick={handleToggleTranslation}
                  className="text-primary hover:underline font-semibold flex items-center gap-1"
                >
                  <Eye size={12} /> Show Translation
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tafsir Slide-over Sheet */}
      <Sheet open={tafsirOpen} onOpenChange={setTafsirOpen}>
        <SheetContent side="right" className="w-full sm:max-w-xl p-0 overflow-hidden flex flex-col bg-card">
          <SheetHeader className="p-6 border-b border-border/60 bg-muted/20">
            <div className="flex items-center justify-between gap-4">
              <div>
                <SheetTitle className="text-base font-semibold flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <span>Tafsir Commentary</span>
                  <span className="text-xs font-normal text-muted-foreground font-mono">
                    {tafsirVerseKey}
                  </span>
                </SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground mt-0.5">
                  Scholarly exegesis and deep meaning of the verse.
                </SheetDescription>
              </div>

              {/* Tafsir Source Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-xs font-medium px-2.5 py-1 rounded-lg border border-border bg-card hover:bg-accent text-foreground flex items-center gap-1 shrink-0">
                    <span>{TAFSIR_OPTIONS.find(t => t.slug === tafsirSlug)?.name.split(' ')[1]}</span>
                    <ChevronRight size={12} className="rotate-90" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="text-xs">Tafsir Source</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {TAFSIR_OPTIONS.map(opt => (
                    <DropdownMenuItem
                      key={opt.slug}
                      onClick={() => setTafsirSlug(opt.slug as any)}
                      className={cn("text-xs justify-between", tafsirSlug === opt.slug && "font-semibold text-primary")}
                    >
                      <span>{opt.name}</span>
                      {tafsirSlug === opt.slug && <Check size={14} className="text-primary" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </SheetHeader>

          {/* Tafsir Content Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {tafsirLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
                <Loader2 className="animate-spin w-6 h-6 text-primary" />
                <p className="text-xs">Loading authentic commentary...</p>
              </div>
            ) : (
              <div 
                className="prose dark:prose-invert max-w-none text-xs md:text-sm text-foreground/90 leading-relaxed font-sans space-y-3"
                dangerouslySetInnerHTML={{
                  __html: tafsirContent || ''
                }}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
