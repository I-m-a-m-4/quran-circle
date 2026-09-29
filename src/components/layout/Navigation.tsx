

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Home,
  Clock,
  BookOpen,
  Moon,
  Compass,
  Calendar,
  Heart,
  Bookmark,
  Settings,
  Hand,
  Sparkles,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Menu,
  LogOut,
  HelpCircle,
  MessageSquarePlus
} from 'lucide-react';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { IslamicPattern } from '@/components/ui/islamic-pattern';

import { useAuthState } from 'react-firebase-hooks/auth';
import { ShieldAlert } from 'lucide-react';
import { Logo } from '@/components/logo';

export const NAV_ITEMS = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/dashboard/prayer', label: 'Prayer', icon: Clock },
  { href: '/dashboard/quran', label: 'Quran', icon: BookOpen },
  { href: '/dashboard/adhkar', label: 'Adhkar', icon: Moon },
  { href: '/dashboard/tasbih', label: 'Tasbih', icon: Hand },
  { href: '/dashboard/qibla', label: 'Qibla', icon: Compass },
  { href: '/dashboard/calendar', label: 'Calendar', icon: Calendar },
  { href: '/dashboard/worship', label: 'Tracker', icon: Heart },
  { href: '/dashboard/bookmarks', label: 'Bookmarks', icon: Bookmark },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  { href: '/dashboard/circle', label: 'Muslim Desk', icon: Sparkles },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [user] = useAuthState(auth);
  const isAdmin = user?.email?.toLowerCase() === 'belloimam431@gmail.com';

  return (
    <aside 
      className={cn(
        "hidden lg:flex flex-col h-screen border-r border-border bg-sidebar sticky top-0 transition-all duration-300 relative overflow-hidden",
        collapsed ? "w-[80px]" : "w-64"
      )}
    >
      {/* Islamic Background Pattern - pronounced, flowing wave-like curves */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <IslamicPattern 
          className="w-full h-full text-primary" 
          opacity={0.18}
          patternSize={680}
        />
        {/* Soft edge fade to keep nav links legible */}
        <div className="absolute inset-0 bg-gradient-to-b from-sidebar/20 via-transparent to-sidebar/30 pointer-events-none" />
      </div>

      {/* Logo & Toggle */}
      <div className={cn(
        "flex items-center py-5 border-b border-sidebar-border relative z-10",
        collapsed ? "justify-center px-0" : "gap-3 px-6"
      )}>
        <Logo className="w-8 h-8" showText={!collapsed} />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-border bg-background shadow-sm hover:bg-accent"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </Button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 relative z-10">
        <ul className="space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  title={collapsed ? label : undefined}
                  className={cn(
                    'flex items-center rounded-lg text-sm font-medium transition-all duration-150',
                    collapsed ? 'justify-center py-3' : 'gap-3 px-3 py-2.5',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                  )}
                >
                  <Icon
                    size={collapsed ? 20 : 17}
                    className={cn(isActive ? 'text-primary' : 'text-muted-foreground shrink-0')}
                  />
                  {!collapsed && <span className="whitespace-nowrap">{label}</span>}
                  {!collapsed && isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  )}
                </Link>
              </li>
            );
          })}

          {/* Admin Control Link - Visible only for belloimam431@gmail.com */}
          {isAdmin && (
            <li className="pt-2 mt-2 border-t border-sidebar-border/60">
              <Link
                href="/admin-imamshaffy"
                title={collapsed ? "Chief Imam Admin" : undefined}
                className={cn(
                  'flex items-center rounded-lg text-sm font-semibold transition-all duration-150',
                  collapsed ? 'justify-center py-3' : 'gap-3 px-3 py-2.5',
                  pathname === '/admin-imamshaffy'
                    ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30 shadow-sm'
                    : 'text-amber-500/90 hover:bg-amber-500/10 hover:text-amber-400'
                )}
              >
                <ShieldAlert
                  size={collapsed ? 20 : 17}
                  className="text-amber-500 shrink-0"
                />
                {!collapsed && (
                  <span className="whitespace-nowrap flex items-center justify-between w-full">
                    <span>Chief Imam</span>
                    <span className="text-[9px] bg-amber-500/20 text-amber-400 font-mono px-1.5 py-0.5 rounded font-bold">
                      ROOT
                    </span>
                  </span>
                )}
              </Link>
            </li>
          )}
        </ul>
      </nav>

      {/* Footer */}
      <div className={cn(
        "py-3 border-t border-sidebar-border mt-auto flex flex-col gap-1.5 overflow-hidden relative z-10",
        collapsed ? "px-2 items-center" : "px-3"
      )}>
        {/* Support & Feature Request Page Link (Above Logout) */}
        <Link
          href="/dashboard/support"
          title={collapsed ? "Support & Feature Requests" : undefined}
          className={cn(
            "w-full flex items-center rounded-lg text-xs font-semibold transition-all py-2.5",
            collapsed ? "justify-center px-0" : "gap-3 px-3",
            pathname === '/dashboard/support'
              ? "bg-primary/15 text-primary"
              : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
          )}
        >
          <HelpCircle size={collapsed ? 20 : 17} className="text-primary shrink-0" />
          {!collapsed && (
            <span className="whitespace-nowrap flex items-center justify-between w-full">
              <span>Support & Requests</span>
              <span className="text-[9px] bg-primary/15 text-primary px-1.5 py-0.5 rounded-full font-bold">
                Ideas
              </span>
            </span>
          )}
        </Link>

        <button
          onClick={() => signOut(auth)}
          title={collapsed ? "Log out" : undefined}
          className={cn(
            "w-full flex items-center rounded-lg text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors py-2.5",
            collapsed ? "justify-center px-0" : "gap-3 px-3"
          )}
        >
          <LogOut size={collapsed ? 20 : 17} className="shrink-0" />
          {!collapsed && <span className="whitespace-nowrap">Log out</span>}
        </button>

        <p className={cn(
          "text-[10px] text-muted-foreground text-center leading-relaxed whitespace-nowrap pt-1 border-t border-sidebar-border/50",
          collapsed ? "text-[8px]" : ""
        )}>
          {collapsed ? "بِسْمِ اللهِ" : "بِسْمِ اللهِ الرَّحْمَنِ الرَّحِيمِ"}
        </p>
      </div>
    </aside>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const [user] = useAuthState(auth);
  const isAdmin = user?.email?.toLowerCase() === 'belloimam431@gmail.com';

  // Show only first 3 items + More button
  const mobileItems = NAV_ITEMS.slice(0, 3);
  const moreItems = NAV_ITEMS.slice(3);

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-card/95 backdrop-blur-sm border-t border-border pb-safe">
      <ul className="flex items-center justify-around h-16 px-2">
        {mobileItems.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);
          return (
            <li key={href} className="flex-1 h-full">
              <Link
                href={href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 h-full text-[10px] font-medium transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon size={22} className={isActive ? 'fill-primary/20' : ''} />
                {label}
              </Link>
            </li>
          );
        })}
        
        {/* More Menu */}
        <li className="flex-1 h-full">
          <Sheet>
            <SheetTrigger asChild>
              <button className="w-full h-full flex flex-col items-center justify-center gap-1 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors outline-none">
                <Menu size={22} />
                More
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh] rounded-t-2xl px-2 relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                <IslamicPattern 
                  className="w-full h-full text-primary" 
                  opacity={0.15}
                  patternSize={500}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background/60 pointer-events-none" />
              </div>
              <SheetHeader className="px-4 text-left border-b border-border pb-4 mb-4 relative z-10">
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="grid grid-cols-4 gap-4 px-4 pb-8 overflow-y-auto max-h-full">
                {isAdmin && (
                  <Link
                    href="/admin-imamshaffy"
                    className={cn(
                      'flex flex-col items-center gap-2 p-2 rounded-xl text-xs text-center transition-all',
                      pathname === '/admin-imamshaffy' ? 'bg-amber-500/20 text-amber-500' : 'text-amber-500 hover:bg-amber-500/10'
                    )}
                  >
                    <div className="p-3 rounded-full bg-amber-500/20 text-amber-500">
                      <ShieldAlert size={20} />
                    </div>
                    <span className="line-clamp-1 w-full font-bold text-[11px]">Chief Imam</span>
                  </Link>
                )}
                {moreItems.map(({ href, label, icon: Icon }) => {
                  const isActive = pathname.startsWith(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={cn(
                        'flex flex-col items-center gap-2 p-2 rounded-xl text-xs text-center transition-all',
                        isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent'
                      )}
                    >
                      <div className={cn("p-3 rounded-full bg-accent/50", isActive && "bg-primary/20")}>
                        <Icon size={20} className={isActive ? 'text-primary' : ''} />
                      </div>
                      <span className="line-clamp-1 w-full">{label}</span>
                    </Link>
                  );
                })}
                <button
                  onClick={() => signOut(auth)}
                  className="flex flex-col items-center gap-2 p-2 rounded-xl text-xs text-center transition-all text-destructive hover:bg-destructive/10"
                >
                  <div className="p-3 rounded-full bg-destructive/10">
                    <LogOut size={20} className="text-destructive" />
                  </div>
                  <span className="line-clamp-1 w-full">Log out</span>
                </button>
              </div>
            </SheetContent>
          </Sheet>
        </li>
      </ul>
    </nav>
  );
}
