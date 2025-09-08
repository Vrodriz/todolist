import React from 'react';
import { cn } from '@/lib/utils';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
  activeView: string;
  onViewChange: (view: string) => void;
  taskCounts?: {
    all: number;
    today: number;
    upcoming: number;
    completed: number;
  };
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onFiltersChange?: (filters: any) => void;
}

/**
 * Main application layout with ClickUp-style design
 * Features sidebar navigation, header with search and theme toggle
 */
export function Layout({
  children,
  className,
  activeView,
  onViewChange,
  taskCounts,
  searchQuery,
  onSearchChange,
  onFiltersChange
}: LayoutProps) {
  return (
    <div className={cn(
      "min-h-screen bg-background text-foreground",
      className
    )}>
      <div className="flex h-screen">
        <Sidebar
          activeView={activeView}
          onViewChange={onViewChange}
          taskCounts={taskCounts}
        />
        <div className="flex flex-1 flex-col">
          <Header
            activeView={activeView}
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            onFiltersChange={onFiltersChange}
          />
          <main className="flex-1 overflow-auto bg-muted/50 p-6">
            <div className="mx-auto max-w-5xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
