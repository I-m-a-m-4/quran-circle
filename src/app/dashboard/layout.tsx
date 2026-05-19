"use client";

import React, { useState } from 'react';
import { DashboardNav } from '@/components/dashboard-nav';
import { TopBar } from '@/components/top-bar';
import { cn } from '@/lib/utils';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <DashboardNav isCollapsed={isSidebarCollapsed} />
      <main className={cn(
        "pb-16 md:pb-0 min-h-screen flex flex-col transition-all duration-300",
        isSidebarCollapsed ? "md:pl-20" : "md:pl-64"
      )}>
        <TopBar 
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
          isSidebarCollapsed={isSidebarCollapsed} 
        />
        <div className="max-w-6xl w-full mx-auto p-4 md:p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
