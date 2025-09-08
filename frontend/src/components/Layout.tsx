import React from 'react';
import { cn } from '@/lib/utils';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface LayoutProps {
  /** Child components to render in main content area */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Current active view */
  activeView: string;
  /** Callback when view changes */
  onViewChange: (view: string) => void;
  /** Task counts for sidebar navigation */
  taskCounts?: {
    all: number;
    today: number;
    upcoming: number;
    completed: number;
  };
  /** Current search query */
  searchQuery?: string;
  /** Search query change handler */
  onSearchChange?: (query: string) => void;
  /** Filter change handler */
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
        {/* Sidebar */}
        <Sidebar
          activeView={activeView}
          onViewChange={onViewChange}
          taskCounts={taskCounts}
        />

        {/* Main Content */}
        <div className="flex flex-1 flex-col">
          {/* Header */}
          <Header
            activeView={activeView}
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            onFiltersChange={onFiltersChange}
          />

          {/* Content Area */}
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