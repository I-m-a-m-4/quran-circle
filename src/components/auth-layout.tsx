import React from 'react';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  imageSrc: string;
  quote: string;
  subtitle: string;
}

export default function AuthLayout({ children, imageSrc, quote, subtitle }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen w-full font-sans text-gray-900 bg-white">
      {/* Centered Form */}
      <div className="flex flex-col w-full max-w-2xl mx-auto p-8 md:p-12 lg:p-20 justify-between relative overflow-y-auto">
        <header>
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center transition-transform group-hover:scale-110">
              <BookOpen className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-bold tracking-tighter text-black">Muslim Desk</span>
          </Link>
        </header>

        <main className="max-w-md w-full mx-auto my-auto py-12">
          {children}
        </main>

        <footer className="text-sm text-gray-500 text-center lg:text-left">
          © {new Date().getFullYear()} Muslim Desk. Built for the sake of Allah.
        </footer>
      </div>

      {/* Removed right side visual section as requested */}
    </div>
  );
}
