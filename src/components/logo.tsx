import React from 'react';
import Image from 'next/image';

export function Logo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <div className={`${className} relative flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}>
      {/* Orange Glow Effect */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-orange-600 to-amber-500 blur-[6px] opacity-75 animate-pulse" />
      
      {/* Main Icon Box */}
      <div className="relative w-full h-full rounded-lg overflow-hidden border border-orange-400/40 flex items-center justify-center shadow-[0_4px_20px_rgba(234,88,12,0.4)]">
        <Image src="/logo-premium.jpg" alt="Muslim Desk Logo" fill className="object-cover" />
      </div>
    </div>
  );
}
