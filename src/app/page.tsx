import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { 
  BookOpen, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Infinity as InfinityIcon, 
  Smartphone, 
  Layers, 
  Target, 
  Inbox, 
  Clock, 
  MoreHorizontal, 
  User, 
  Send,
  Zap,
  ShieldCheck,
  Search,
  Paperclip,
  Lightbulb,
  Code2
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#050505] text-white selection:bg-primary/30 selection:text-primary">
      
      {/* Background Dot Grid Effect */}
      <div className="fixed inset-0 pointer-events-none -z-20">
        <div className="absolute inset-0 bg-dot-grid mask-arch-dots animate-dots opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-transparent opacity-60" />
      </div>

      {/* Background Component Glows */}
      <div className="aura-background-component -z-10 w-full top-0 absolute h-[750px] opacity-40 pointer-events-none">
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-amber-500/10 rounded-full blur-[100px]" />
      </div>

      {/* Navigation */}
      <header className="fixed z-50 bg-[#050505]/80 w-full border-white/5 border-b top-0 left-0 backdrop-blur-md">
        <div className="flex px-6 h-16 max-w-7xl mx-auto items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer group" role="button">
            <Logo className="w-8 h-8" />
            <span className="text-xl font-semibold tracking-tighter">Quran Circle</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            <Link href="#concept" className="hover:text-white transition-colors">Habits</Link>
            <Link href="#circles" className="hover:text-white transition-colors">Circles</Link>
            <Link href="#insights" className="hover:text-white transition-colors">Insights</Link>
          </nav>

          <div className="flex gap-4 items-center">
            <Link href="/login" className="hover:text-white transition-colors hidden sm:block text-sm font-medium">Log in</Link>
            <Link href="/signup">
              <Button className="rounded-full px-6 bg-white text-black hover:bg-gray-200 h-9 font-medium">
                Join Now
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="overflow-hidden md:pt-44 pt-40 pb-0 relative">
        <div className="z-10 text-left max-w-5xl mx-auto px-6 relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-primary mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <Sparkles className="w-3 h-3" />
            <span>Built for spiritual consistency</span>
          </div>

          <h1 className="leading-[1.1] md:text-7xl lg:text-8xl text-5xl font-bold text-white tracking-tighter mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            Quran Circle is a precision tool for<br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50">building your Quran habit.</span>
          </h1>

          <p className="md:text-2xl text-xl leading-relaxed font-medium text-gray-400 max-w-3xl mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            Meet the operating system for high-performance spiritual growth. Streamline your daily reflections, join accountability circles, and connect with the Word of Allah daily.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 mb-24 items-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <Link href="/signup">
              <Button size="lg" className="h-14 px-10 rounded-full bg-primary text-black font-semibold hover:bg-primary/90 shadow-[0_15px_30px_-10px_rgba(255,196,56,0.3)]">
                Start your journey <Send className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <button className="hover:bg-white/5 transition-all flex text-sm font-medium text-gray-300 border border-white/10 rounded-full px-8 h-14 items-center gap-2 backdrop-blur-sm">
              Watch the Vision <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3D Interface Mockup */}
        <div className="hero-perspective -mt-8 group md:px-0 md:pt-20 pt-20 pr-4 pb-20 pl-4">
          <div className="hero-rotate overflow-hidden transform transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:rotate-x-0 group-hover:rotate-y-0 group-hover:rotate-z-0 group-hover:left-0 group-hover:translate-y-0 group-hover:scale-100 bg-[#0F1012] max-w-[1300px] border-white/10 border rounded-xl mx-auto relative left-20 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] rotate-x-20 rotate-y-30 -rotate-z-20">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent pointer-events-none z-10" />

            {/* Mockup Content Grid */}
            <div className="grid grid-cols-[260px_380px_1fr] divide-x divide-white/5 h-[800px]">
              
              {/* Sidebar */}
              <div className="flex flex-col bg-[#0F1012]">
                <div className="flex h-14 border-white/5 border-b px-4 items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center">
                      <BookOpen className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-sm font-semibold">FaithBoard</span>
                  </div>
                  <MoreHorizontal className="w-4 h-4 text-gray-500" />
                </div>

                <div className="p-3 space-y-1">
                  <div className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-200 bg-white/5 border border-white/5">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span className="text-sm">Start Session</span>
                    <span className="ml-auto text-xs text-gray-600 border border-white/10 rounded px-1.5 py-0.5">S</span>
                  </div>
                </div>

                <div className="p-3 space-y-0.5 mt-2">
                  <div className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-400 hover:text-gray-200 hover:bg-white/5 cursor-pointer transition-colors">
                    <Inbox className="w-4 h-4" />
                    <span className="text-sm">Reflections</span>
                    <span className="ml-auto text-xs text-gray-500">4</span>
                  </div>
                  <div className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-400 hover:text-gray-200 hover:bg-white/5 cursor-pointer transition-colors">
                    <Target className="w-4 h-4" />
                    <span className="text-sm">My Circle</span>
                  </div>
                  <div className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-400 hover:text-gray-200 hover:bg-white/5 cursor-pointer transition-colors">
                    <Layers className="w-4 h-4" />
                    <span className="text-sm">Growth Map</span>
                  </div>
                </div>

                <div className="mt-6 px-6 text-xs font-medium text-gray-600 uppercase tracking-wider">Your Circles</div>
                <div className="p-3 space-y-0.5">
                  <div className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-200 bg-white/5 cursor-pointer">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-sm">Faith Seekers</span>
                  </div>
                  <div className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-400 hover:text-gray-200 hover:bg-white/5 cursor-pointer transition-colors">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-sm">Surah Al-Kahf</span>
                  </div>
                </div>
              </div>

              {/* List View */}
              <div className="flex flex-col bg-[#0B0C0E]">
                <div className="flex h-14 border-white/5 border-b px-5 items-center justify-between">
                  <span className="text-sm font-medium text-gray-400">Recent Verses</span>
                  <div className="flex gap-3 text-gray-500">
                    <Search className="w-4 h-4 cursor-pointer hover:text-gray-300" />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  <div className="flex flex-col gap-1 p-4 border-b border-white/5 bg-[#16181D] border-l-2 cursor-pointer border-l-amber-500">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-amber-400">SURAH 2:153</span>
                      <div className="w-1 h-1 rounded-full bg-gray-600" />
                      <span className="text-xs text-gray-500">Patience</span>
                    </div>
                    <span className="text-sm font-medium text-white">"O you who have believed, seek help through patience and prayer..."</span>
                    <div className="flex items-center gap-2 mt-2">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-xs text-gray-500">Studied today</span>
                      <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 ml-auto border border-black/50" />
                    </div>
                  </div>

                  <div className="group flex flex-col gap-1 p-4 border-b border-white/5 hover:bg-[#131416] cursor-pointer transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-gray-500 group-hover:text-gray-400">SURAH 94:5</span>
                    </div>
                    <span className="text-sm text-gray-300 group-hover:text-white">"For indeed, with hardship [will be] ease."</span>
                    <div className="flex items-center gap-2 mt-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                      <span className="text-xs text-gray-500">Reflected</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detail View */}
              <div className="bg-[#0B0C0E] flex flex-col relative">
                <div className="h-14 border-b border-white/5 flex items-center justify-between px-6">
                  <div className="flex items-center gap-2 text-gray-500">
                    <span className="text-xs font-mono">Insight</span>
                    <span className="text-xs">/</span>
                    <span className="text-xs font-mono text-gray-300">SURAH-2-153</span>
                  </div>
                </div>

                <div className="p-8 overflow-y-auto">
                  <h2 className="text-2xl font-medium text-white mb-4 tracking-tight">Today's Reflection: Patience</h2>
                  
                  <div className="flex items-center gap-6 mb-8 pb-6 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-400">Studied by <span className="text-gray-200">Abdullah</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span className="text-sm text-gray-400">5 Day Streak</span>
                    </div>
                  </div>

                  <div className="space-y-6 text-base text-gray-300 leading-relaxed">
                    <p className="quran-text text-4xl text-white mb-6 text-right">يَا أَيُّهَا الَّذِينَ آمَنُوا اسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ ۚ إِنَّ اللَّهَ مَعَ الصَّابِرِينَ</p>
                    
                    <div className="rounded-lg bg-[#090A0B] border border-white/10 overflow-hidden my-6 shadow-2xl">
                      <div className="flex items-center justify-between px-4 py-2 bg-[#131416] border-b border-white/5">
                        <span className="text-xs text-gray-500 font-mono">Translation</span>
                        <span className="text-xs text-gray-600">English Sahih</span>
                      </div>
                      <div className="p-4 font-serif italic text-lg leading-relaxed text-gray-200">
                        "O you who have believed, seek help through patience and prayer. Indeed, Allah is with the patient."
                      </div>
                    </div>

                    <p>Building consistency requires two anchors: internal patience and divine connection through prayer. When habit becomes hard, we turn to the Creator of time.</p>
                  </div>
                </div>

                <div className="absolute bottom-8 right-8">
                  <button className="bg-white text-black hover:bg-gray-200 transition-colors rounded-full p-3 shadow-lg shadow-white/10">
                    <Sparkles className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <section id="concept" className="max-w-7xl mx-auto px-6 mt-40 mb-32 relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-12 mb-24">
            <h2 className="md:text-7xl text-5xl font-bold text-white tracking-tighter max-w-2xl leading-[1.1]">
              Engineered for <span className="text-gray-500">consistent believers</span>
            </h2>
            <div className="max-w-md lg:pt-4">
              <p className="text-lg text-gray-400 leading-relaxed mb-8">
                Quran Circle is forged from the insights of habit-building psychology and spiritual tradition. Unrelenting consistency, automated streaks, and a commitment to the quality of your soul.
              </p>
              <Link href="/signup" className="group inline-flex items-center text-base font-medium text-white transition-colors hover:text-primary">
                Cultivate your habit
                <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="group flex flex-col overflow-hidden hover:border-white/10 transition-colors bg-gradient-to-b from-white/5 to-transparent h-[480px] rounded-3xl p-8 border border-white/5 relative">
              <div className="flex-1 flex relative items-center justify-center">
                <div className="relative w-48 h-48">
                  <div className="absolute inset-0 rounded-xl transform rotate-6 border transition-transform group-hover:rotate-12 duration-700 bg-amber-500/10 border-amber-500/20" />
                  <div className="absolute inset-0 bg-[#1A1C20] rounded-xl transform -rotate-3 border border-white/10 z-10 flex items-center justify-center shadow-2xl transition-transform group-hover:-rotate-6 duration-700">
                    <Sparkles className="w-16 h-16 text-primary" />
                  </div>
                </div>
              </div>
              <div className="relative z-20 flex items-end justify-between mt-auto">
                <h3 className="text-lg font-medium text-gray-200">Native to your lifestyle</h3>
                <button className="w-10 h-10 rounded-full bg-[#1A1C20] border border-white/10 flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:text-black transition-all">
                  <Zap className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group flex flex-col overflow-hidden hover:border-white/10 transition-colors bg-gradient-to-b from-white/5 to-transparent h-[480px] rounded-3xl p-8 border border-white/5 relative">
              <div className="relative flex-1 flex items-center justify-center">
                <div className="w-full max-w-[200px] space-y-4">
                  <div className="flex items-center justify-between text-xs font-mono text-amber-400/70">
                    <span>DAILY COMMITMENT</span>
                    <span>5 MINS</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full w-full bg-amber-500/50 animate-shimmer" />
                  </div>
                  <div className="flex justify-center mt-8">
                    <InfinityIcon className="w-16 h-16 text-primary drop-shadow-[0_0_15px_rgba(255,196,56,0.3)]" />
                  </div>
                </div>
              </div>
              <div className="relative z-20 flex items-end justify-between mt-auto">
                <h3 className="text-lg font-medium text-gray-200">Real-time growth</h3>
                <button className="w-10 h-10 rounded-full bg-[#1A1C20] border border-white/10 flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:text-black transition-all">
                  <Target className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group flex flex-col overflow-hidden hover:border-white/10 transition-colors bg-gradient-to-b from-white/5 to-transparent h-[480px] rounded-3xl p-8 border border-white/5 relative">
              <div className="relative flex-1 flex items-center justify-center">
                <div className="relative z-10 bg-[#1A1C20] p-6 rounded-2xl border border-white/10 shadow-2xl">
                  <ShieldCheck className="w-16 h-16 text-primary" />
                  <div className="absolute -bottom-3 -right-3 bg-white text-black text-[10px] font-bold px-2 py-0.5 rounded border border-white shadow-lg uppercase">Secure</div>
                </div>
              </div>
              <div className="relative z-20 flex items-end justify-between mt-auto">
                <h3 className="text-lg font-medium text-gray-200">Sacred precision</h3>
                <button className="w-10 h-10 rounded-full bg-[#1A1C20] border border-white/10 flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:text-black transition-all">
                  <CheckCircle2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Accountability / Infrastructure Section */}
        <section id="circles" className="max-w-7xl mx-auto px-6 pt-24 pb-24 relative z-10">
          <div className="max-w-4xl mb-24">
            <p className="inline-flex items-center gap-2 uppercase text-xs font-medium text-white/60 tracking-widest font-mono mb-4">
              <span className="w-1.5 h-1.5 animate-pulse bg-primary rounded-full shadow-[0_0_8px_rgba(255,196,56,0.8)]" />
              Community
            </p>
            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-white leading-[1.1] mb-6">
              Connect with velocity,
              <span className="text-gray-500"> grow without comparison.</span>
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mb-8 leading-relaxed">
              Maintain your daily habit within a private circle of 2-4 friends. Quran Circle continuously optimizes your growth map based on your Niyyah—without overwhelming notifications.
            </p>
            
            <div className="flex items-center gap-6">
              <Link href="/signup">
                <Button size="lg" className="rounded-full bg-primary text-black font-semibold hover:bg-primary/90 px-10 h-14">
                  Join a Circle <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <button className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                View the methodology
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Zero-config section */}
            <div className="group flex flex-col overflow-hidden hover:border-white/20 transition-all duration-500 bg-gradient-to-b from-white/10 to-transparent h-[32rem] rounded-3xl relative justify-between p-8 border border-white/5">
              <div className="relative perspective-distant">
                <div className="overflow-hidden transform transition-all duration-500 group-hover:-translate-y-3 group-hover:rotate-x-2 bg-white/5 w-full rounded-xl border border-white/10">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/5">
                    <div className="flex space-x-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                    </div>
                    <span className="text-[10px] font-mono text-gray-500">niyyah.config.ts</span>
                  </div>
                  <div className="p-5 font-mono text-xs text-gray-400">
                    <p><span className="text-purple-400">import</span> {'{ createGoal }'} <span className="text-purple-400">from</span> <span className="text-amber-300">'@quran/habits'</span></p>
                    <p className="mt-2"><span className="text-purple-400">export const</span> <span className="text-sky-400">dailyHabit</span> = createGoal({'{'}</p>
                    <p className="pl-4">focus: <span className="text-amber-300">'Gratitude'</span>,</p>
                    <p className="pl-4">duration: <span className="text-amber-300">'5m'</span>,</p>
                    <p className="pl-4">reminder: <span className="text-amber-300">'Fajr'</span>,</p>
                    <p className="pl-4">mode: <span className="text-amber-300">'Gentle'</span></p>
                    <p>{'}'})</p>
                  </div>
                </div>
              </div>
              <div className="relative z-10 mt-auto">
                <h3 className="text-2xl font-bold text-white mb-3">Zero-pressure growth</h3>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                  Describe your intention in plain words. Quran Circle adapts the experience, selection, and reminders around your life with guardrails for consistency.
                </p>
              </div>
            </div>

            {/* Traffic-aware section */}
            <div className="group flex flex-col overflow-hidden hover:border-white/20 transition-all duration-500 bg-gradient-to-b from-white/10 to-transparent h-[32rem] rounded-3xl relative justify-end p-8 border border-white/5">
              <div className="absolute inset-0 flex items-center justify-center opacity-60 group-hover:opacity-100 transition-opacity">
                <div className="relative w-64 h-64">
                  <div className="absolute inset-0 rounded-full border border-white/5 animate-pulse" />
                  <div className="absolute inset-4 rounded-full border border-white/10 scale-110" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 shadow-[0_0_30px_rgba(255,196,56,0.2)]">
                      <BookOpen className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-white mb-3">Community-aware streaks</h3>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                  Quran Circle continuously learns from your circle's activity, shifting focus to support members who might be falling behind—keeping the collective spirit alive.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* AI Section */}
        <section id="insights" className="max-w-7xl mx-auto px-6 mt-40 mb-32 relative z-10">
          <div className="mb-24">
            <div className="inline-flex items-center gap-2 mb-8 group">
              <div className="w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_rgba(255,196,56,0.8)]" />
              <span className="uppercase text-xs font-bold text-white/60 tracking-widest font-mono">Divine Intelligence</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-white mb-8 max-w-3xl leading-[1.1]">
              AI-assisted <span className="text-gray-500">spiritual orchestration.</span>
            </h2>
            <div className="max-w-xl">
              <p className="text-lg text-gray-400 leading-relaxed mb-8">
                Quran Circle AI. Delegate your research, get personalized verse recommendations, and generate technical summaries of complex Tafsir.
              </p>
              <Button variant="outline" className="rounded-full border-white/10 hover:bg-white/5 text-white gap-2">
                Learn more <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-white/5 border-t pt-16">
            <div className="group p-8 rounded-3xl bg-gradient-to-br from-white/5 to-transparent border border-white/5 hover:border-white/10 transition-all">
              <div className="flex items-center gap-2 mb-6 text-xs font-mono text-gray-500 group-hover:text-primary">
                <Sparkles className="w-4 h-4" />
                <span>Habit Intelligence</span>
              </div>
              <div className="bg-[#16181D] border border-white/10 rounded-xl p-6 shadow-2xl mb-8">
                <p className="text-sm font-medium text-white mb-2">Why this verse was suggested</p>
                <p className="text-sm text-gray-400 leading-relaxed">
                  "Based on your recent reflections on patience, this verse from Surah Ash-Sharh provides the necessary closure for your current emotional cycle."
                </p>
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-[8px]">QC</div>
                  </div>
                  <button className="text-xs font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-widest">Accept Insight</button>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Insight Engine</h3>
              <p className="text-gray-400">Streamline your study workflow with AI assistance for routine research and historical context.</p>
            </div>

            <div className="group p-8 rounded-3xl bg-gradient-to-br from-white/5 to-transparent border border-white/5 hover:border-white/10 transition-all">
              <div className="flex items-center gap-2 mb-6 text-xs font-mono text-gray-500 group-hover:text-primary">
                <InfinityIcon className="w-4 h-4" />
                <span>Verse Connection</span>
              </div>
              <div className="bg-[#0A0B0D] p-6 rounded-xl border border-white/5 font-mono text-xs text-gray-500 mb-8">
                <p><span className="text-purple-400">// insight.query.js</span></p>
                <p className="mt-2"><span className="text-sky-400">context</span> = findConnection({'{'}</p>
                <p className="pl-4">source: <span className="text-amber-300">'2:153'</span>,</p>
                <p className="pl-4">theme: <span className="text-amber-300">'Resilience'</span></p>
                <p>{'}'})</p>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Seamless Context</h3>
              <p className="text-gray-400">Connect Quran Circle to your favorite journals and apps for seamless spiritual context sharing.</p>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="bg-gradient-to-b from-white/10 to-transparent w-full max-w-7xl rounded-[3rem] mt-24 mx-auto p-12 md:p-24 relative border border-white/10 text-center backdrop-blur-xl mb-40">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-[120px] -z-10" />
          <h2 className="text-5xl md:text-8xl font-bold tracking-tighter text-white mb-8">Ship your habit today.</h2>
          <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto font-medium">
            Join thousands of believers using Quran Circle to orchestrate their spiritual consistency from intention to action.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/signup">
              <Button size="lg" className="h-16 px-12 rounded-full bg-white text-black font-bold text-lg hover:bg-gray-200 shadow-[0_0_40px_rgba(255,255,255,0.2)]">
                Start building for free
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="h-16 px-12 rounded-full border-white/10 text-white font-bold text-lg hover:bg-white/5 backdrop-blur-sm">
              Contact Growth Team
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/5 py-32 px-6 relative z-10 bg-gradient-to-b from-white/5 to-transparent">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-12 gap-x-8 gap-y-12 mb-20">
              <div className="col-span-2 md:col-span-4 pr-8">
                <div className="flex items-center gap-2 mb-6">
                  <Logo className="w-8 h-8" />
                  <span className="text-2xl font-bold tracking-tighter">Quran Circle</span>
                </div>
                <p className="text-sm text-gray-500 mb-8 leading-relaxed max-w-xs">
                  The operating system for high-performance spiritual life. Designed to help you connect with Allah with precision and speed.
                </p>
              </div>
              <div className="col-span-1 md:col-span-2">
                <h4 className="font-bold text-white mb-6 text-sm uppercase tracking-widest text-primary">Product</h4>
                <ul className="space-y-4 text-sm text-gray-500">
                  <li><Link href="#" className="hover:text-white transition-colors">Habits</Link></li>
                  <li><Link href="#" className="hover:text-white transition-colors">Circles</Link></li>
                  <li><Link href="#" className="hover:text-white transition-colors">Growth</Link></li>
                </ul>
              </div>
              <div className="col-span-1 md:col-span-2">
                <h4 className="font-bold text-white mb-6 text-sm uppercase tracking-widest text-primary">Resources</h4>
                <ul className="space-y-4 text-sm text-gray-500">
                  <li><Link href="#" className="hover:text-white transition-colors">Community</Link></li>
                  <li><Link href="#" className="hover:text-white transition-colors">Help Center</Link></li>
                  <li><Link href="#" className="hover:text-white transition-colors">Tafsir API</Link></li>
                </ul>
              </div>
              <div className="col-span-1 md:col-span-2">
                <h4 className="font-bold text-white mb-6 text-sm uppercase tracking-widest text-primary">Legal</h4>
                <ul className="space-y-4 text-sm text-gray-500">
                  <li><Link href="#" className="hover:text-white transition-colors">Privacy</Link></li>
                  <li><Link href="#" className="hover:text-white transition-colors">Terms</Link></li>
                </ul>
              </div>
            </div>
            <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-xs text-gray-600">© 2024 Quran Circle. Built for the sake of Allah.</p>
              <div className="flex items-center gap-2">
                <div className="relative flex items-center justify-center w-2 h-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 bg-amber-400" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500" />
                </div>
                <span className="text-xs font-medium text-gray-400">Divine connection operational</span>
              </div>
            </div>
          </div>
        </footer>

        {/* Gradient Overlay at bottom */}
        <div className="absolute bottom-0 left-0 w-full h-40 fade-overlay pointer-events-none z-20" />
      </main>
    </div>
  );
}
