'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Bell, 
  Search, 
  User as UserIcon, 
  Heart, 
  CheckCheck, 
  Trash2, 
  Clock, 
  BookOpen, 
  Sparkles, 
  Moon, 
  Sun, 
  Flame, 
  Megaphone, 
  ShieldAlert, 
  Calendar,
  X 
} from 'lucide-react';
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
import { IslamicPattern } from '@/components/ui/islamic-pattern';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';
import { 
  subscribeToNotifications, 
  markNotificationRead, 
  markAllNotificationsRead, 
  clearAllNotifications, 
  dismissNotification,
  type AppNotification,
  type NotificationIconType
} from '@/lib/notifications';

function getNotificationIcon(type: NotificationIconType) {
  switch (type) {
    case 'sunnah-fasting':
      return { icon: Moon, color: 'text-amber-500 bg-amber-500/15' };
    case 'kahf':
      return { icon: BookOpen, color: 'text-emerald-500 bg-emerald-500/15' };
    case 'adhkar':
      return { icon: Sun, color: 'text-indigo-500 bg-indigo-500/15' };
    case 'tahajjud':
      return { icon: Sparkles, color: 'text-purple-500 bg-purple-500/15' };
    case 'admin-broadcast':
      return { icon: Megaphone, color: 'text-orange-500 bg-orange-500/15' };
    case 'nudge':
      return { icon: Flame, color: 'text-orange-600 bg-orange-500/15' };
    case 'prayer':
      return { icon: Clock, color: 'text-blue-500 bg-blue-500/15' };
    default:
      return { icon: Bell, color: 'text-primary bg-primary/15' };
  }
}

export function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [hijriDate, setHijriDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Subscribe to live notifications (Automated Sunnah reminders + Admin broadcasts)
  useEffect(() => {
    const unsubscribe = subscribeToNotifications((items) => {
      setNotifications(items);
    });
    return () => unsubscribe();
  }, []);

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllAsRead = () => {
    markAllNotificationsRead(notifications);
  };

  const clearNotifications = () => {
    clearAllNotifications();
  };

  const handleNotificationClick = (item: AppNotification) => {
    markNotificationRead(item.id);
    if (item.href) {
      router.push(item.href);
    }
  };

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
    <header className="sticky top-0 z-40 w-full bg-background border-b border-border flex items-center justify-between h-16 px-6 shrink-0 relative overflow-hidden">
      {/* Islamic Background Pattern - matching the sidebar wave pattern */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <IslamicPattern 
          className="w-full h-full text-primary" 
          opacity={0.16}
          patternSize={520}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/20 via-transparent to-background/40 pointer-events-none" />
      </div>

      <div className="flex items-center gap-4 relative z-10">
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

      <div className="flex items-center gap-3 md:gap-5 relative z-10">
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

        <ThemeToggle />

        {/* Notifications Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative rounded-full text-muted-foreground hover:text-foreground hover:bg-accent"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground border-2 border-background animate-pulse">
                  {unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[340px] sm:w-[380px] p-0 rounded-2xl shadow-2xl border-border bg-card/95 backdrop-blur-md overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-muted/30">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-foreground">Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-primary/15 text-primary">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {notifications.length > 0 && (
                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[11px] font-medium text-primary hover:underline px-2 py-1 rounded transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={clearNotifications}
                    title="Clear all"
                    className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* List */}
            <div className="max-h-[360px] overflow-y-auto divide-y divide-border/40">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
                    <CheckCheck className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium text-foreground">All caught up!</p>
                  <p className="text-xs text-muted-foreground mt-1">No new notifications right now.</p>
                </div>
              ) : (
                notifications.map((item) => {
                  const { icon: Icon, color } = getNotificationIcon(item.iconType);
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleNotificationClick(item)}
                      className={cn(
                        "flex items-start gap-3 p-3.5 transition-colors cursor-pointer hover:bg-accent/60 group",
                        item.unread && "bg-primary/5 hover:bg-primary/10"
                      )}
                    >
                      <div className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-xs",
                        color
                      )}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1.5 mb-0.5">
                          <p className={cn("text-xs font-semibold truncate", item.unread ? "text-foreground font-bold" : "text-muted-foreground")}>
                            {item.title}
                          </p>
                          <span className="text-[10px] text-muted-foreground shrink-0">{item.time}</span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {item.message}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-muted border border-border/60 text-muted-foreground">
                            {item.category}
                          </span>
                          {item.fromAdmin && (
                            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-orange-500/15 text-orange-600 dark:text-orange-400">
                              Official
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 self-center shrink-0">
                        {item.unread && (
                          <span className="w-2 h-2 rounded-full bg-primary" />
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            dismissNotification(item.id);
                          }}
                          title="Dismiss notification"
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-opacity"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-2.5 border-t border-border/60 bg-muted/20 text-center">
                <Link
                  href="/dashboard/prayer"
                  className="text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Manage alert preferences in Settings →
                </Link>
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

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
