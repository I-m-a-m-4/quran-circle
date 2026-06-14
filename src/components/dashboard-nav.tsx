"use client"

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, LayoutDashboard, Target, Settings, LogOut, History, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/theme-toggle';
import { Logo } from '@/components/logo';
import { useAuth } from '@/context/auth-context';

export function DashboardNav({ isCollapsed = false }: { isCollapsed?: boolean }) {
  const pathname = usePathname();
  const { user, profile, logout } = useAuth();

  const name = profile?.name || user?.displayName || 'Bello Imam';
  const streak = profile?.streak || 0;
  const isAdmin = user?.email?.toLowerCase() === 'belloimam431@gmail.com';

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Session', href: '/dashboard/session', icon: BookOpen },
    { name: 'History', href: '/dashboard/history', icon: History },
    { name: 'Circle', href: '/dashboard/circle', icon: Target },
  ];

  if (isAdmin) {
    navItems.push({ name: 'Admin Console', href: '/admin-imamshaffy', icon: ShieldAlert });
  }

  const getInitials = (nameStr: string) => {
    return nameStr.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/login';
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className={cn(
      "w-full border-t md:border-t-0 md:border-r border-border bg-card flex md:flex-col h-16 md:h-screen fixed bottom-0 md:bottom-auto left-0 md:top-0 z-40 pb-safe transition-all duration-300",
      isCollapsed ? "md:w-20" : "md:w-64"
    )}>
      {/* Desktop Header */}
      <div className="p-6 hidden md:flex items-center gap-2 mb-2">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Logo className="w-8 h-8 shrink-0" />
          {!isCollapsed && (
            <span className="text-lg font-semibold tracking-tighter text-foreground whitespace-nowrap animate-in fade-in">
              Quran Circle
            </span>
          )}
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 flex flex-row md:flex-col justify-around md:justify-start px-2 md:px-4 py-2 md:py-0 md:space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 p-3 md:px-3 md:py-2 rounded-md transition-colors",
              pathname === item.href 
                ? "text-primary md:bg-primary/10 md:border md:border-primary/20" 
                : "text-muted-foreground hover:text-foreground md:hover:bg-black/5 md:dark:hover:bg-white/5",
              isCollapsed && "md:justify-center md:px-0"
            )}
            title={isCollapsed ? item.name : undefined}
          >
            <item.icon className="w-5 h-5 md:w-5 md:h-5 shrink-0" />
            <span className={cn(
              "text-[10px] md:text-sm font-medium whitespace-nowrap transition-all",
              isCollapsed ? "md:hidden" : "md:block"
            )}>{item.name}</span>
          </Link>
        ))}
      </nav>

      {/* Desktop Footer */}
      <div className={cn("mt-auto p-4 space-y-4 hidden md:block", isCollapsed && "px-2")}>
        {!isCollapsed && (
          <div className="flex items-center justify-between px-2">
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Theme</div>
            <ThemeToggle />
          </div>
        )}

        <div className={cn("flex items-center gap-3 p-3 rounded-xl border border-border bg-background transition-all", isCollapsed && "justify-center px-0")}>
          <Avatar className="w-8 h-8 shrink-0 bg-primary text-primary-foreground">
            <AvatarFallback className="bg-primary font-bold text-xs">{getInitials(name)}</AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-medium text-foreground truncate">{name}</p>
              <p className="text-[10px] text-muted-foreground truncate">{streak} Day Streak</p>
            </div>
          )}
        </div>

        <button 
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-3 px-3 py-2 w-full text-muted-foreground hover:text-foreground transition-colors",
            isCollapsed && "justify-center px-0"
          )}
          title={isCollapsed ? "Log out" : undefined}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span className="text-sm font-medium whitespace-nowrap">Log out</span>}
        </button>
      </div>
    </div>
  );
}
