'use client';

import { SupportMission } from '@/components/support-mission';
import { HeartHandshake } from 'lucide-react';

export default function SupportPage() {
  return (
    <div className="flex-1 p-6 md:p-8 max-w-4xl mx-auto w-full flex flex-col items-center justify-center min-h-[80vh] fade-in">
      <div className="text-center mb-8 max-w-lg">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6">
          <HeartHandshake className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-4">Support Muslim Desk</h1>
        <p className="text-muted-foreground">
          We are committed to keeping this platform completely free, without any distracting ads.
          If Muslim Desk has brought value to your daily routine, consider supporting our server costs.
        </p>
      </div>

      <SupportMission />
    </div>
  );
}
