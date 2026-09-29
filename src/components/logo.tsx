import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className = "w-8 h-8", showText = false }: LogoProps) {
  return (
    <div className="flex items-center gap-3 group">
      <div className={cn(className, "relative flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shrink-0")}>
        {/* Soft Orange Glow */}
        <div className="absolute inset-0 rounded-xl bg-orange-500/30 blur-[6px] -z-10 group-hover:opacity-100 transition-opacity" />
        
        {/* New Muslim Desk Logo: Orange Background with White Quran & Crescent Icon */}
        <div className="relative w-full h-full rounded-xl overflow-hidden shadow-[0_2px_12px_rgba(249,115,22,0.35)] bg-gradient-to-br from-orange-500 to-amber-600 p-0.5 flex items-center justify-center">
          <Image
            src="/logo.png"
            alt="Muslim Desk"
            width={80}
            height={80}
            className="w-full h-full object-cover rounded-lg"
            priority
          />
        </div>
      </div>

      {showText && (
        <div className="overflow-hidden">
          <span className="font-bold tracking-tight text-foreground text-base select-none leading-none block">
            Muslim<span className="text-orange-500">Desk</span>
          </span>
          <p className="text-[11px] text-muted-foreground mt-0.5 whitespace-nowrap">Your daily companion</p>
        </div>
      )}
    </div>
  );
}
