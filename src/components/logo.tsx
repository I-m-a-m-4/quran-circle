import React from 'react';

export function Logo({ className = "w-8 h-8", showText = false }: { className?: string; showText?: boolean }) {
  return (
    <div className="flex items-center gap-3 group">
      <div className={`${className} relative flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shrink-0`}>
        {/* Orange Glow Effect */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 blur-[6px] opacity-70 animate-pulse" />
        
        {/* Solid Orange Box with White Muslim Desk Emblem */}
        <div className="relative w-full h-full rounded-xl overflow-hidden border border-orange-400/40 flex items-center justify-center bg-[#f97316] shadow-[0_4px_20px_rgba(249,115,22,0.45)] p-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" className="w-full h-full" fill="none">
            {/* Crescent Moon Emblem */}
            <path d="M 21.5 4 A 4.5 4.5 0 1 0 25.5 10 A 3.8 3.8 0 1 1 21.5 4 Z" fill="#ffffff" />
            
            {/* Productivity Star */}
            <polygon points="25.5,4.5 26.2,6 27.8,6.1 26.5,7.2 27,8.7 25.5,7.8 24,8.7 24.5,7.2 23.2,6.1 24.8,6" fill="#ffffff" />

            {/* Desk / Stand Base Line */}
            <path d="M 6 34.5 L 34 34.5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
            <path d="M 14 34.5 L 17 31" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
            <path d="M 26 34.5 L 23 31" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />

            {/* Open Quran & Desk Productivity Book */}
            <path d="M 20 30.5 C 14.5 27 8 28 4 30 L 4 18 C 8 16 14.5 15 20 18.5 C 25.5 15 32 16 36 18 L 36 30 C 32 28 25.5 27 20 30.5 Z" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M 20 18.5 L 20 30.5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
            
            {/* Book & Task Lines */}
            <path d="M 8 21 C 12 20 16 20.5 18 22" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.85" />
            <path d="M 32 21 C 28 20 24 20.5 22 22" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.85" />
          </svg>
        </div>
      </div>

      {showText && (
        <span className="font-bold tracking-tight text-foreground text-lg select-none">
          MUSLIM<span className="text-[#f97316]">DESK</span>
        </span>
      )}
    </div>
  );
}


