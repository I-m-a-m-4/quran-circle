"use client";

import React, { useState, useEffect } from "react";
import { Activity, Bell } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface TopBarProps {
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
}

export function TopBar({ onToggleSidebar, isSidebarCollapsed }: TopBarProps) {
  const [name, setName] = useState('Bello Imam');

  useEffect(() => {
    const savedName = localStorage.getItem('userName');
    if (savedName) setName(savedName);
  }, []);

  const getInitials = (nameStr: string) =>
    nameStr.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
      {/* Left section */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="hidden md:flex w-8 h-8 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 items-center justify-center text-muted-foreground transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {isSidebarCollapsed ? (
              <>
                <line x1="21" x2="14" y1="4" y2="4"/>
                <line x1="10" x2="3" y1="4" y2="4"/>
                <line x1="21" x2="12" y1="12" y2="12"/>
                <line x1="8" x2="3" y1="12" y2="12"/>
                <line x1="21" x2="16" y1="20" y2="20"/>
                <line x1="12" x2="3" y1="20" y2="20"/>
                <line x1="14" x2="21" y1="2" y2="9"/>
                <line x1="14" x2="21" y1="15" y2="22"/>
              </>
            ) : (
              <>
                <line x1="3" x2="21" y1="6" y2="6"/>
                <line x1="3" x2="21" y1="12" y2="12"/>
                <line x1="3" x2="21" y1="18" y2="18"/>
              </>
            )}
          </svg>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Activity className="w-4 h-4 text-primary" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-foreground hidden sm:inline">Spiritual Health</span>
            <span className="px-2 py-0.5 rounded-full bg-secondary border border-border text-[10px] font-bold text-muted-foreground tracking-widest hidden md:inline">
              BETA
            </span>
          </div>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Bell notification */}
        <button className="hover:text-foreground transition-colors relative text-muted-foreground">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"></span>
        </button>

        <div className="h-6 w-[1px] bg-border mx-1"></div>

        {/* Avatar / Logout */}
        <button
          onClick={() => {
            if (window.confirm("Would you like to log out?")) {
              localStorage.removeItem('userEmail');
              window.location.href = '/login';
            }
          }}
          className="hover:scale-105 transition-transform focus:outline-none"
          title="Log out"
        >
          <Avatar className="w-8 h-8 bg-primary">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
        </button>
      </div>
    </header>
  );
}
