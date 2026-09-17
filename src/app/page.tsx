import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { 
  BookOpen, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Headphones, 
  Target, 
  Clock, 
  User, 
  Send,
  Zap,
  Users,
  MessageSquare,
  Heart,
  RefreshCw,
  Volume2
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
            <span className="text-xl font-semibold tracking-tighter">Muslim Desk</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            <Link href="#how-it-works" className="hover:text-white transition-colors">How it Works</Link>
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="/ai-search" className="hover:text-white transition-colors">AI Search</Link>
            <Link href="#community" className="hover:text-white transition-colors">Community</Link>
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
            <span>Powered by Gemini AI & the Quran Foundation API</span>
          </div>

          <h1 className="leading-[1.1] md:text-7xl lg:text-8xl text-5xl font-bold text-white tracking-tighter mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            The Quran speaks<br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50">directly to your life.</span>
          </h1>

          <p className="md:text-2xl text-xl leading-relaxed font-medium text-gray-400 max-w-3xl mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            Tell Muslim Desk what&apos;s on your mind — finances, health, patience, purpose — and Gemini AI finds the exact Quranic verses that speak to your situation. Build a daily habit with friends who keep you accountable.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 mb-24 items-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <Link href="/signup">
              <Button size="lg" className="h-14 px-10 rounded-full bg-primary text-black font-semibold hover:bg-primary/90 shadow-[0_15px_30px_-10px_rgba(255,196,56,0.3)]">
                Start your journey <Send className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/login" className="hover:bg-white/5 transition-all flex text-sm font-medium text-gray-300 border border-white/10 rounded-full px-8 h-14 items-center gap-2 backdrop-blur-sm">
              I already have an account <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* How it Works - 3 Step Flow */}
        <section id="how-it-works" className="max-w-6xl mx-auto px-6 mt-20 mb-40 relative z-10">
          <div className="text-center mb-20">
            <p className="inline-flex items-center gap-2 uppercase text-xs font-medium text-white/60 tracking-widest font-mono mb-4">
              <span className="w-1.5 h-1.5 animate-pulse bg-primary rounded-full shadow-[0_0_8px_rgba(255,196,56,0.8)]" />
              How it works
            </p>
            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-white leading-[1.1] mb-6">
              Three steps to a<br /><span className="text-gray-500">meaningful Quran habit.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="group relative flex flex-col bg-gradient-to-b from-white/5 to-transparent rounded-3xl p-8 border border-white/5 hover:border-white/10 transition-all">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm border border-primary/30">1</div>
                <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">Your Niyyah</span>
              </div>
              <div className="flex-1 flex items-center justify-center py-8">
                <div className="w-full max-w-[240px] bg-[#16181D] rounded-xl border border-white/10 p-4 shadow-2xl">
                  <p className="text-[10px] text-gray-500 mb-2 font-medium">What&apos;s on your mind?</p>
                  <p className="text-sm text-white font-medium">&quot;I want to find peace during financial hardship&quot;</p>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="h-8 flex-1 bg-primary/20 rounded-lg flex items-center justify-center text-xs font-bold text-primary border border-primary/30">Craft Verses</div>
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Share what&apos;s on your heart</h3>
              <p className="text-sm text-gray-400 leading-relaxed">Enter your intention, worry, or focus in plain words. No Islamic knowledge required — just honesty.</p>
            </div>

            {/* Step 2 */}
            <div className="group relative flex flex-col bg-gradient-to-b from-white/5 to-transparent rounded-3xl p-8 border border-white/5 hover:border-white/10 transition-all">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm border border-primary/30">2</div>
                <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">AI Matching</span>
              </div>
              <div className="flex-1 flex items-center justify-center py-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/10 rounded-full blur-[40px] animate-pulse" />
                  <div className="relative w-28 h-28 rounded-full bg-[#16181D] border border-white/10 flex items-center justify-center shadow-2xl">
                    <Sparkles className="w-12 h-12 text-primary" />
                  </div>
                  <div className="absolute -top-2 -right-4 bg-[#1A1C20] border border-white/10 rounded-lg px-2 py-1 text-[9px] font-mono text-amber-400 shadow-lg">Gemini AI</div>
                  <div className="absolute -bottom-2 -left-4 bg-[#1A1C20] border border-white/10 rounded-lg px-2 py-1 text-[9px] font-mono text-sky-400 shadow-lg">Quran API</div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Gemini finds your verses</h3>
              <p className="text-sm text-gray-400 leading-relaxed">Gemini AI searches across the entire Quran to find the verses most relevant to your specific situation.</p>
            </div>

            {/* Step 3 */}
            <div className="group relative flex flex-col bg-gradient-to-b from-white/5 to-transparent rounded-3xl p-8 border border-white/5 hover:border-white/10 transition-all">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm border border-primary/30">3</div>
                <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">Your Session</span>
              </div>
              <div className="flex-1 flex items-center justify-center py-8">
                <div className="w-full max-w-[240px] bg-[#16181D] rounded-xl border border-white/10 p-4 shadow-2xl space-y-3">
                  <p className="text-right quran-text text-lg text-white leading-relaxed">وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ</p>
                  <p className="text-[11px] text-gray-400 italic">&quot;And will provide for him from where he never expects...&quot;</p>
                  <div className="flex items-center gap-2 pt-1">
                    <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center"><Volume2 className="w-3 h-3 text-primary" /></div>
                    <div className="flex-1 h-1 bg-white/10 rounded-full"><div className="h-full w-3/5 bg-primary/50 rounded-full" /></div>
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Read, listen, and reflect</h3>
              <p className="text-sm text-gray-400 leading-relaxed">Study 5 personalized verses with Arabic text, verified translations, and audio from renowned Qaris.</p>
            </div>
          </div>
        </section>

        {/* 4 Core Pillars */}
        <section id="features" className="max-w-7xl mx-auto px-6 pt-24 pb-24 relative z-10">
          <div className="max-w-4xl mb-24">
            <p className="inline-flex items-center gap-2 uppercase text-xs font-medium text-white/60 tracking-widest font-mono mb-4">
              <span className="w-1.5 h-1.5 animate-pulse bg-primary rounded-full shadow-[0_0_8px_rgba(255,196,56,0.8)]" />
              Core Features
            </p>
            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-white leading-[1.1] mb-6">
              Four pillars of<br /><span className="text-gray-500">Quranic engagement.</span>
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl leading-relaxed">
              Muslim Desk doesn&apos;t just show you random verses. It builds a complete ecosystem around daily reading, personal reflection, community accountability, and active memorization.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pillar 1: Daily Reading */}
            <div className="group flex flex-col overflow-hidden hover:border-white/20 transition-all duration-500 bg-gradient-to-b from-white/10 to-transparent rounded-3xl relative justify-between p-8 border border-white/5">
              <div className="flex items-center gap-2 mb-6 text-xs font-mono text-gray-500 group-hover:text-primary transition-colors">
                <BookOpen className="w-4 h-4" />
                <span>Daily Reading</span>
              </div>
              <div className="relative flex-1 flex items-center justify-center py-6">
                <div className="w-full max-w-xs space-y-3">
                  <div className="bg-[#16181D] border border-white/10 rounded-xl p-4 shadow-2xl">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold text-amber-400">12 Day Streak</span>
                    </div>
                    <div className="flex gap-1">
                      {Array.from({ length: 14 }).map((_, i) => (
                        <div key={i} className={`w-full h-2 rounded-sm ${i < 12 ? 'bg-primary/60' : 'bg-white/5'}`} />
                      ))}
                    </div>
                    <p className="text-[10px] text-gray-500 mt-3">Your longest streak yet. Keep going!</p>
                  </div>
                  <div className="flex items-center gap-2 justify-center">
                    <Clock className="w-3.5 h-3.5 text-gray-500" />
                    <span className="text-xs text-gray-500">5 minutes a day is all it takes</span>
                  </div>
                </div>
              </div>
              <div className="relative z-10 mt-auto pt-4">
                <h3 className="text-2xl font-bold text-white mb-3">A reason to open the Quran every day</h3>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors leading-relaxed">
                  By matching verses to what you&apos;re personally going through, Muslim Desk gives you a compelling reason to read — not out of obligation, but because the verses speak directly to your life.
                </p>
              </div>
            </div>

            {/* Pillar 2: Reflection */}
            <div className="group flex flex-col overflow-hidden hover:border-white/20 transition-all duration-500 bg-gradient-to-b from-white/10 to-transparent rounded-3xl relative justify-between p-8 border border-white/5">
              <div className="flex items-center gap-2 mb-6 text-xs font-mono text-gray-500 group-hover:text-primary transition-colors">
                <Heart className="w-4 h-4" />
                <span>Reflection</span>
              </div>
              <div className="relative flex-1 flex items-center justify-center py-6">
                <div className="w-full max-w-xs space-y-2">
                  <div className="bg-[#16181D] border border-white/10 rounded-xl p-4 shadow-2xl">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold">Your Niyyah</p>
                    <p className="text-sm text-white mb-3">&quot;I want to find patience during hardship&quot;</p>
                    <div className="border-t border-white/5 pt-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" />
                        <span className="text-[11px] text-gray-300">Al-Baqarah 2:153 — Patience & Prayer</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" />
                        <span className="text-[11px] text-gray-300">Ash-Sharh 94:5 — Ease after hardship</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" />
                        <span className="text-[11px] text-gray-300">Al-Baqarah 2:286 — Soul&apos;s capacity</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative z-10 mt-auto pt-4">
                <h3 className="text-2xl font-bold text-white mb-3">The Quran as a living guide</h3>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors leading-relaxed">
                  Enter what&apos;s weighing on your mind, and Gemini AI selects the most thematically relevant verses via the Quran Foundation API — turning the Quran into living guidance for real-life concerns.
                </p>
              </div>
            </div>

            {/* Pillar 3: Community Learning */}
            <div className="group flex flex-col overflow-hidden hover:border-white/20 transition-all duration-500 bg-gradient-to-b from-white/10 to-transparent rounded-3xl relative justify-between p-8 border border-white/5">
              <div className="flex items-center gap-2 mb-6 text-xs font-mono text-gray-500 group-hover:text-primary transition-colors">
                <Users className="w-4 h-4" />
                <span>Community Learning</span>
              </div>
              <div className="relative flex-1 flex items-center justify-center py-6">
                <div className="w-full max-w-xs space-y-2">
                  <div className="bg-[#16181D] border border-white/10 rounded-xl p-4 shadow-2xl">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/5">
                      <div className="flex items-center gap-2">
                        <Target className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs font-bold text-white">Faith Seekers</span>
                      </div>
                      <span className="text-[9px] text-gray-500 font-bold uppercase">3 of 4 done</span>
                    </div>
                    <div className="space-y-2.5">
                      {[
                        { name: 'You', streak: 12, done: true },
                        { name: 'Sarah', streak: 8, done: true },
                        { name: 'Omar', streak: 15, done: true },
                        { name: 'Fatima', streak: 3, done: false },
                      ].map((m, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[8px] font-bold text-gray-300">{m.name[0]}</div>
                            <span className="text-[11px] text-gray-300">{m.name}</span>
                            {m.done && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                          </div>
                          <span className="text-[9px] text-primary font-bold">{m.streak}d</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-2 border-t border-white/5 flex items-center gap-2">
                      <MessageSquare className="w-3 h-3 text-gray-500" />
                      <span className="text-[10px] text-gray-500">Send a nudge to Fatima</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative z-10 mt-auto pt-4">
                <h3 className="text-2xl font-bold text-white mb-3">Accountability that works</h3>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors leading-relaxed">
                  Add friends by username, track each other&apos;s streaks, send nudges when someone falls behind, and chat together — turning solitary worship into a shared, motivating journey.
                </p>
              </div>
            </div>

            {/* Pillar 4: Memorization */}
            <div className="group flex flex-col overflow-hidden hover:border-white/20 transition-all duration-500 bg-gradient-to-b from-white/10 to-transparent rounded-3xl relative justify-between p-8 border border-white/5">
              <div className="flex items-center gap-2 mb-6 text-xs font-mono text-gray-500 group-hover:text-primary transition-colors">
                <Headphones className="w-4 h-4" />
                <span>Memorization</span>
              </div>
              <div className="relative flex-1 flex items-center justify-center py-6">
                <div className="w-full max-w-xs space-y-3">
                  <div className="bg-[#16181D] border border-white/10 rounded-xl p-5 shadow-2xl text-center">
                    <p className="quran-text text-2xl text-white leading-relaxed mb-3" dir="rtl">فَإِنَّ مَعَ ٱلْعُسْرِ يُسْرًا</p>
                    <p className="text-xs text-gray-400 italic mb-4">&quot;For indeed, with hardship [will be] ease.&quot;</p>
                    <div className="flex items-center gap-3 justify-center">
                      <button className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                        <Volume2 className="w-4 h-4 text-primary" />
                      </button>
                      <div className="flex-1 h-1.5 bg-white/10 rounded-full max-w-[140px]">
                        <div className="h-full w-2/3 bg-primary/60 rounded-full" />
                      </div>
                      <span className="text-[10px] text-gray-500 font-mono">0:04</span>
                    </div>
                    <p className="text-[9px] text-gray-600 mt-3 uppercase tracking-widest font-bold">Mahmoud Al-Husary</p>
                  </div>
                  <div className="flex items-center gap-2 justify-center">
                    <RefreshCw className="w-3 h-3 text-gray-500" />
                    <span className="text-[10px] text-gray-500">Repeat to memorize</span>
                  </div>
                </div>
              </div>
              <div className="relative z-10 mt-auto pt-4">
                <h3 className="text-2xl font-bold text-white mb-3">Learn through listening</h3>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors leading-relaxed">
                  Each session presents authentic Arabic text alongside verified English translations and integrated audio from renowned Qaris, supporting comprehension and memorization through repeated, focused listening.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof / Testimonial-like section */}
        <section id="community" className="max-w-7xl mx-auto px-6 mt-24 mb-32 relative z-10">
          <div className="mb-20 text-center">
            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-white mb-6 leading-[1.1]">
              Built on trusted<br /><span className="text-gray-500">Islamic infrastructure.</span>
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Every verse is fetched directly from the Quran Foundation API with verified Uthmani script. Translations are sourced from Saheeh International and other authenticated scholarly works. Audio recitations come from world-renowned Qaris.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-b from-white/5 to-transparent rounded-2xl p-6 border border-white/5 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Quran Foundation API</h3>
              <p className="text-sm text-gray-400">Verified Uthmani script and authenticated translations for every verse served in the app.</p>
            </div>
            <div className="bg-gradient-to-b from-white/5 to-transparent rounded-2xl p-6 border border-white/5 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Gemini AI</h3>
              <p className="text-sm text-gray-400">Google&apos;s Gemini intelligently matches your personal concerns to the most relevant Quranic passages.</p>
            </div>
            <div className="bg-gradient-to-b from-white/5 to-transparent rounded-2xl p-6 border border-white/5 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                <Headphones className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Renowned Reciters</h3>
              <p className="text-sm text-gray-400">Audio from Mahmoud Al-Husary, Mishary Alafasy, and other world-class Qaris for every verse.</p>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="bg-gradient-to-b from-white/10 to-transparent w-full max-w-7xl rounded-[3rem] mt-24 mx-auto p-12 md:p-24 relative border border-white/10 text-center backdrop-blur-xl mb-40">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-[120px] -z-10" />
          <h2 className="text-5xl md:text-8xl font-bold tracking-tighter text-white mb-8">Start reading today.</h2>
          <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto font-medium">
            Join believers who use Muslim Desk to build a consistent, meaningful relationship with the Quran — guided by AI, grounded in community.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/signup">
              <Button size="lg" className="h-16 px-12 rounded-full bg-white text-black font-bold text-lg hover:bg-gray-200 shadow-[0_0_40px_rgba(255,255,255,0.2)]">
                Start your journey — it&apos;s free
              </Button>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/5 py-32 px-6 relative z-10 bg-gradient-to-b from-white/5 to-transparent">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-12 gap-x-8 gap-y-12 mb-20">
              <div className="col-span-2 md:col-span-4 pr-8">
                <div className="flex items-center gap-2 mb-6">
                  <Logo className="w-8 h-8" />
                  <span className="text-2xl font-bold tracking-tighter">Muslim Desk</span>
                </div>
                <p className="text-sm text-gray-500 mb-8 leading-relaxed max-w-xs">
                  An AI-powered Quran study companion that matches verses to your life. Built to help every Muslim build a lasting daily habit with the Book of Allah.
                </p>
              </div>
              <div className="col-span-1 md:col-span-2">
                <h4 className="font-bold text-white mb-6 text-sm uppercase tracking-widest text-primary">Features</h4>
                <ul className="space-y-4 text-sm text-gray-500">
                  <li><Link href="#features" className="hover:text-white transition-colors">Daily Reading</Link></li>
                  <li><Link href="#features" className="hover:text-white transition-colors">Reflection</Link></li>
                  <li><Link href="#features" className="hover:text-white transition-colors">Community</Link></li>
                  <li><Link href="#features" className="hover:text-white transition-colors">Memorization</Link></li>
                </ul>
              </div>
              <div className="col-span-1 md:col-span-2">
                <h4 className="font-bold text-white mb-6 text-sm uppercase tracking-widest text-primary">Powered By</h4>
                <ul className="space-y-4 text-sm text-gray-500">
                  <li><span className="text-gray-400">Gemini AI</span></li>
                  <li><span className="text-gray-400">Quran Foundation API</span></li>
                  <li><span className="text-gray-400">Firebase</span></li>
                </ul>
              </div>
              <div className="col-span-1 md:col-span-2">
                <h4 className="font-bold text-white mb-6 text-sm uppercase tracking-widest text-primary">Legal</h4>
                <ul className="space-y-4 text-sm text-gray-500">
                  <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
                  <li><Link href="/terms" className="hover:text-white transition-colors">Terms</Link></li>
                </ul>
              </div>
            </div>
            <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-xs text-gray-600">© 2025 Muslim Desk. Built for the sake of Allah.</p>
              <div className="flex items-center gap-2">
                <div className="relative flex items-center justify-center w-2 h-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 bg-amber-400" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500" />
                </div>
                <span className="text-xs font-medium text-gray-400">All systems operational</span>
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
