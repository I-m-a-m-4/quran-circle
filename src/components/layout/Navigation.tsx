

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
  Menu
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

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

  return (
    <aside 
      className={cn(
        "hidden lg:flex flex-col h-screen border-r border-border bg-sidebar sticky top-0 transition-all duration-300",
        collapsed ? "w-[80px]" : "w-64"
      )}
    >
      {/* Logo & Toggle */}
      <div className={cn(
        "flex items-center py-5 border-b border-sidebar-border relative",
        collapsed ? "justify-center px-0" : "gap-3 px-6"
      )}>
        <div className="w-8 h-8 shrink-0 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-primary-foreground text-sm font-bold font-arabic">م</span>
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="font-semibold text-sm text-sidebar-foreground leading-none whitespace-nowrap">Muslim Desk</h1>
            <p className="text-[11px] text-muted-foreground mt-0.5 whitespace-nowrap">Your daily companion</p>
          </div>
        )}
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
      <nav className="flex-1 overflow-y-auto py-4 px-3">
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
        </ul>
      </nav>

      {/* Footer */}
      <div className={cn(
        "py-4 border-t border-sidebar-border overflow-hidden",
        collapsed ? "px-2" : "px-6"
      )}>
        <p className={cn(
          "text-[10px] text-muted-foreground text-center leading-relaxed whitespace-nowrap",
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
            <SheetContent side="bottom" className="h-[80vh] rounded-t-2xl px-2">
              <SheetHeader className="px-4 text-left border-b border-border pb-4 mb-4">
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="grid grid-cols-4 gap-4 px-4 pb-8 overflow-y-auto max-h-full">
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
              </div>
            </SheetContent>
          </Sheet>
        </li>
      </ul>
    </nav>
  );
}
