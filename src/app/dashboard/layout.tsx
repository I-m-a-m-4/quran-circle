'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Sidebar, BottomNav } from '@/components/layout/Navigation';
import { TopBar } from '@/components/layout/TopBar';
import { AdhanOverlay } from '@/components/adhan-overlay';
import { AudioAlarmOverlay } from '@/components/audio-alarm-overlay';
import { Logo } from '@/components/logo';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Logo className="w-12 h-12" showText={false} />
          <p className="text-sm text-muted-foreground animate-pulse">Loading Muslim Desk…</p>
        </div>
      </div>
    );
  }

  if (!user) return null; // Redirect in progress

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <AdhanOverlay />
        <AudioAlarmOverlay />
        <TopBar />
        <div className="flex-1 overflow-y-auto pb-20 lg:pb-8 p-4 md:p-6 lg:p-8 relative z-10">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
