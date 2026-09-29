'use client';

import React, { useState, useEffect } from 'react';
import { SupportMission } from '@/components/support-mission';
import { 
  HeartHandshake, 
  Sparkles, 
  MessageSquarePlus, 
  ThumbsUp, 
  Send, 
  CheckCircle2, 
  HelpCircle, 
  Lightbulb, 
  Heart, 
  Clock, 
  Check, 
  Loader2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface FeatureRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  votes: number;
  status: 'In Review' | 'Planned' | 'In Progress' | 'Completed';
  submittedBy?: string;
  hasVoted?: boolean;
}

const DEFAULT_FEATURE_REQUESTS: FeatureRequest[] = [
  {
    id: 'feat-1',
    title: 'Custom Audio Upload for Alarms & Adhan',
    description: 'Allow users to upload custom MP3/M4A audio files for Monday & Thursday Sunnah fasting, Suhoor, and Adhan alarms.',
    category: 'Audio & Alarms',
    votes: 48,
    status: 'Completed',
  },
  {
    id: 'feat-2',
    title: 'Home Screen & Lock Screen Widgets for Prayer Times',
    description: 'Quick glanceable widgets showing next prayer time, countdown, and daily Quran verse of the day.',
    category: 'Mobile & Desktop',
    votes: 39,
    status: 'In Progress',
  },
  {
    id: 'feat-3',
    title: 'Word-by-Word Quran Audio Pronunciation',
    description: 'Tap any Arabic word in the Quran reader to hear individual pronunciation for tajweed training.',
    category: 'Quran & Tafsir',
    votes: 34,
    status: 'Planned',
  },
  {
    id: 'feat-4',
    title: 'Fasting Tracker & Iftar Dua Auto-Reminder',
    description: 'Track days fasted in Rajab, Sha\'ban, Shawwal, and White Days with streak badges.',
    category: 'Worship & Habits',
    votes: 29,
    status: 'Planned',
  },
  {
    id: 'feat-5',
    title: 'Apple Watch & Smartwatch Prayer Notifications',
    description: 'Gentle haptic vibration on wrist when Adhan time enters.',
    category: 'Wearables',
    votes: 21,
    status: 'In Review',
  },
];

const LOCAL_STORAGE_VOTES_KEY = 'md_feature_votes';
const LOCAL_STORAGE_SUBMISSIONS_KEY = 'md_user_feature_submissions';

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState<'requests' | 'donate' | 'faq'>('requests');

  // Feature request submission form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Audio & Alarms');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedFeedback, setSubmittedFeedback] = useState(false);

  // Features list state
  const [features, setFeatures] = useState<FeatureRequest[]>(DEFAULT_FEATURE_REQUESTS);

  // Load user votes and custom submissions
  useEffect(() => {
    try {
      const votedIds: string[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_VOTES_KEY) || '[]');
      const userSubmissions: FeatureRequest[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_SUBMISSIONS_KEY) || '[]');
      
      const combined = [...userSubmissions, ...DEFAULT_FEATURE_REQUESTS];
      setFeatures(combined.map(f => ({
        ...f,
        hasVoted: votedIds.includes(f.id),
      })));
    } catch {}
  }, []);

  const handleVote = (id: string) => {
    try {
      const votedIds: string[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_VOTES_KEY) || '[]');
      const alreadyVoted = votedIds.includes(id);

      const nextVotedIds = alreadyVoted 
        ? votedIds.filter(v => v !== id)
        : [...votedIds, id];

      localStorage.setItem(LOCAL_STORAGE_VOTES_KEY, JSON.stringify(nextVotedIds));

      setFeatures(prev => prev.map(f => {
        if (f.id === id) {
          return {
            ...f,
            votes: alreadyVoted ? Math.max(0, f.votes - 1) : f.votes + 1,
            hasVoted: !alreadyVoted,
          };
        }
        return f;
      }));
    } catch {}
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);

    const newReq: FeatureRequest = {
      id: `custom-feat-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      category,
      votes: 1,
      status: 'In Review',
      submittedBy: email.trim() || 'Community Believer',
      hasVoted: true,
    };

    // 1. Save to Firestore
    try {
      await addDoc(collection(db, 'feature_requests'), {
        title: newReq.title,
        description: newReq.description,
        category: newReq.category,
        email: email.trim() || null,
        votes: 1,
        status: 'In Review',
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn('Feature request saved locally:', err);
    }

    // 2. Save locally
    try {
      const existing: FeatureRequest[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_SUBMISSIONS_KEY) || '[]');
      localStorage.setItem(LOCAL_STORAGE_SUBMISSIONS_KEY, JSON.stringify([newReq, ...existing]));
      
      const votedIds: string[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_VOTES_KEY) || '[]');
      localStorage.setItem(LOCAL_STORAGE_VOTES_KEY, JSON.stringify([...votedIds, newReq.id]));
    } catch {}

    setFeatures(prev => [newReq, ...prev]);
    setTitle('');
    setDescription('');
    setEmail('');
    setIsSubmitting(false);
    setSubmittedFeedback(true);
    setTimeout(() => setSubmittedFeedback(false), 5000);
  };

  return (
    <div className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full space-y-8 fade-in">
      
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-1">
          <HelpCircle className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground font-display">
          Support & Feature Requests
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Request new capabilities, shape the roadmap for Muslim Desk, or support our ongoing ad-free server infrastructure.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-center gap-2 border-b border-border/60 pb-3">
        <button
          onClick={() => setActiveTab('requests')}
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all",
            activeTab === 'requests'
              ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          )}
        >
          <Lightbulb className="w-4 h-4" />
          <span>Feature Requests & Ideas</span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary/20 text-primary-foreground">
            {features.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('donate')}
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all",
            activeTab === 'donate'
              ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          )}
        >
          <HeartHandshake className="w-4 h-4" />
          <span>Support the Mission (Donations)</span>
        </button>

        <button
          onClick={() => setActiveTab('faq')}
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all",
            activeTab === 'faq'
              ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          )}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Help & FAQs</span>
        </button>
      </div>

      {/* TAB 1: FEATURE REQUESTS & COMMUNITY WISHLIST */}
      {activeTab === 'requests' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Submit a Feature Form */}
          <div className="lg:col-span-5">
            <Card className="rounded-3xl border-border/70 shadow-sm bg-card sticky top-4">
              <CardHeader className="pb-3 border-b border-border/40">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <MessageSquarePlus className="w-4 h-4 text-primary" /> Request a New Feature
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  What tool or improvement would help your Islamic consistency?
                </p>
              </CardHeader>
              
              <CardContent className="p-5">
                <form onSubmit={handleSubmitRequest} className="space-y-4">
                  {submittedFeedback && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Jazakallahu Khair! Your feature request has been submitted to the developers.</span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Feature Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Suhoor audio automation with custom recording"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                    >
                      <option value="Audio & Alarms">⏰ Audio & Alarms</option>
                      <option value="Quran & Tafsir">📖 Quran Reader & Tafsir</option>
                      <option value="Prayer & Adhan">🕌 Prayer Times & Adhan</option>
                      <option value="Accountability Circles">🤝 Accountability Circles</option>
                      <option value="Worship & Habits">✨ Daily Worship & Streaks</option>
                      <option value="Mobile & Desktop">📱 Mobile / Desktop App</option>
                      <option value="Other">💡 Other Idea</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Describe your idea</label>
                    <textarea
                      rows={4}
                      placeholder="Describe how this feature should work and how it will benefit believers..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Your Email (Optional, for updates)</label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting || !title.trim() || !description.trim()}
                    className="w-full font-bold h-11 rounded-xl gap-2 mt-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting…
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Request
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Community Wishlist & Upvoting */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" /> Community Ideas & Wishlist
                </h3>
                <p className="text-xs text-muted-foreground">Upvote the features you want built next</p>
              </div>
              <span className="text-xs font-mono font-bold text-muted-foreground">
                {features.length} Requests
              </span>
            </div>

            <div className="space-y-3">
              {features.map((feat) => {
                const isCompleted = feat.status === 'Completed';
                const isInProgress = feat.status === 'In Progress';
                
                return (
                  <Card key={feat.id} className="rounded-2xl border-border/70 hover:border-primary/40 hover:shadow-xs transition-all">
                    <CardContent className="p-4 sm:p-5 flex items-start gap-4">
                      
                      {/* Upvote Button */}
                      <button
                        type="button"
                        onClick={() => handleVote(feat.id)}
                        className={cn(
                          "flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all shrink-0 w-12",
                          feat.hasVoted 
                            ? "bg-primary text-primary-foreground border-primary shadow-xs" 
                            : "bg-muted/40 border-border text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                        )}
                        title={feat.hasVoted ? "Remove Upvote" : "Upvote this feature"}
                      >
                        <ThumbsUp className={cn("w-4 h-4", feat.hasVoted && "fill-current")} />
                        <span className="text-xs font-bold font-mono mt-1">{feat.votes}</span>
                      </button>

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-sm text-foreground">{feat.title}</h4>
                          <span className={cn(
                            "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                            isCompleted ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/20"
                              : isInProgress ? "bg-blue-500/15 text-blue-500 border-blue-500/20"
                              : "bg-muted text-muted-foreground border-border"
                          )}>
                            {feat.status}
                          </span>
                        </div>

                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {feat.description}
                        </p>

                        <div className="flex items-center gap-2 pt-1">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                            {feat.category}
                          </span>
                          {feat.submittedBy && (
                            <span className="text-[10px] text-muted-foreground/70">
                              by {feat.submittedBy}
                            </span>
                          )}
                        </div>
                      </div>

                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: SUPPORT THE MISSION / DONATIONS */}
      {activeTab === 'donate' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <SupportMission />
        </div>
      )}

      {/* TAB 3: HELP & FAQS */}
      {activeTab === 'faq' && (
        <div className="max-w-3xl mx-auto space-y-4">
          <Card className="rounded-2xl border-border/70 p-6 space-y-4">
            <h3 className="font-bold text-lg text-foreground">Frequently Asked Questions</h3>
            
            <div className="space-y-4 divide-y divide-border/40 text-sm">
              <div className="pt-3 first:pt-0 space-y-1">
                <h4 className="font-semibold text-foreground">How do audio alarms work?</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Head to <strong>Prayer & Alarms</strong> (/dashboard/prayer) and switch to the "Audio Alarms & Automations" tab. You can schedule alarms for Suhoor, Sunnah fasting (Mondays & Thursdays), Tahajjud, and even upload your own custom audio recordings.
                </p>
              </div>

              <div className="pt-3 space-y-1">
                <h4 className="font-semibold text-foreground">Is Muslim Desk completely ad-free?</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Yes, alhamdulillah. There are zero ads, sponsorships, or commercial popups. We rely on voluntary contributions from our community to support server and database costs.
                </p>
              </div>

              <div className="pt-3 space-y-1">
                <h4 className="font-semibold text-foreground">How does offline Quran reading work?</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  When reading any Surah, click the <strong>Offline</strong> button in the top toolbar. The entire Arabic text and translation are saved locally to your device's browser database so you can read without internet.
                </p>
              </div>

              <div className="pt-3 space-y-1">
                <h4 className="font-semibold text-foreground">How do I contact the developers?</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  You can submit a feature request on this page or reach out directly to the team via email at <strong>support@muslimdesk.com</strong>.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

    </div>
  );
}
