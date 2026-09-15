import React from 'react';

export function Logo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <div className={`${className} relative flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}>
      {/* Orange Glow Effect */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-orange-600 to-amber-500 blur-[6px] opacity-75 animate-pulse" />
      
      {/* Main Icon Box */}
      <div className="relative w-full h-full rounded-lg bg-gradient-to-br from-orange-600 to-orange-500 border border-orange-400/40 flex items-center justify-center shadow-[0_4px_20px_rgba(234,88,12,0.4)]">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="w-4/7 h-4/7 text-white"
        >
          {/* A monitor/desk representing "Muslim Desk" */}
          <rect x="3" y="4" width="18" height="12" rx="2" ry="2" />
          <path d="M8 20h8" />
          <path d="M12 16v4" />
          <path d="M8 8a4 4 0 0 0 8 0" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
        </svg>
      </div>
    </div>
  );
}
