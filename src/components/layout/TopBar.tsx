'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Bell, Search, User as UserIcon, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

export function TopBar() {
  const pathname = usePathname();
  const [hijriDate, setHijriDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  // Format Islamic Date and current time
  useEffect(() => {
    try {
      const date = new Date();
      const hijri = new Intl.DateTimeFormat('en-US-u-ca-islamic', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(date);
      setHijriDate(hijri);
    } catch (e) {
      setHijriDate('Islamic Date');
    }

    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

    return () => clearInterval(timer);
  }, []);

  // Make a readable title from pathname
  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'Home';
    const parts = pathname.split('/').filter(Boolean);
    const lastPart = parts[parts.length - 1];
    if (!lastPart) return 'Home';
    return lastPart.charAt(0).toUpperCase() + lastPart.slice(1);
  };

  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-background/80 border-b border-border flex items-center justify-between h-16 px-6 shrink-0">
      
      <div className="flex items-center gap-4">
        {/* Mobile Page Title */}
        <h2 className="text-lg font-semibold lg:hidden">{getPageTitle()}</h2>
        
        <div className="hidden lg:flex relative items-center max-w-sm w-full">
          <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search Quran, Adhkar, or describe how you feel..." 
            className="w-[280px] h-9 bg-accent/50 border border-border rounded-full pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const val = e.currentTarget.value.trim();
                if (val) {
                  window.location.href = `/ai-search?q=${encodeURIComponent(val)}`;
                }
              }
            }}
          />
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-5">
        {/* Widgets */}
        <div className="hidden md:flex flex-col items-end mr-2 border-r border-border pr-5">
          <span className="text-sm font-medium text-foreground">{currentTime}</span>
          <span className="text-xs text-muted-foreground font-medium">{hijriDate}</span>
        </div>

        <Button 
          variant="secondary" 
          size="sm" 
          className="hidden md:flex gap-2 rounded-full border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary shadow-[0_0_15px_rgba(var(--primary),0.2)] hover:shadow-[0_0_20px_rgba(var(--primary),0.4)] transition-all animate-pulse"
          onClick={() => window.location.href = '/dashboard/support'}
        >
          <Heart className="w-4 h-4 fill-primary/20" /> Support Us
        </Button>

        <Button variant="ghost" size="icon" className="relative rounded-full text-muted-foreground hover:text-foreground">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full bg-accent hover:bg-accent/80 border border-border shrink-0">
              <UserIcon className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => window.location.href = '/dashboard/settings'}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.location.href = '/dashboard/support'} className="text-primary font-medium focus:bg-primary/10">
              <Heart className="w-4 h-4 mr-2" /> Support Muslim Desk
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive/10">
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

    </header>
  );
}
