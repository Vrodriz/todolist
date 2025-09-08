import React from 'react';
import { Search, ArrowUpDown, X } from 'lucide-react';
import { TaskFilters as FilterType } from '@/types/task';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TaskFiltersProps {
  /** Current filter settings */
  filters: FilterType;
  /** Handler for filter changes */
  onFiltersChange: (filters: FilterType) => void;
  /** Total number of tasks */
  totalTasks: number;
  /** Number of completed tasks */
  completedTasks: number;
}

/**
 * Modern task filters component with search, status filters, and sorting
 * Features pill-based status filters and dropdown sorting options
 */
export const TaskFilters: React.FC<TaskFiltersProps> = ({
  filters,
  onFiltersChange,
  totalTasks,
  completedTasks,
}) => {
  const handleSearchChange = (value: string) => {
    onFiltersChange({
      ...filters,
      search: value || undefined,
      page: 1, // Reset to first page when searching
    });
  };

  const handleStatusFilter = (completed?: boolean) => {
    onFiltersChange({
      ...filters,
      completed,
      page: 1,
    });
  };

  const handleSortChange = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    onFiltersChange({
      ...filters,
      sortBy: sortBy as any,
      sortOrder,
      page: 1,
    });
  };

  const pendingTasks = totalTasks - completedTasks;

  const sortOptions = [
    { label: 'Newest First', value: 'createdAt-desc' },
    { label: 'Oldest First', value: 'createdAt-asc' },
    { label: 'Title A-Z', value: 'title-asc' },
    { label: 'Title Z-A', value: 'title-desc' },
    { label: 'Due Date (Soon)', value: 'dueDate-asc' },
    { label: 'Due Date (Later)', value: 'dueDate-desc' },
    { label: 'Recently Updated', value: 'updatedAt-desc' },
  ];

  const currentSort = sortOptions.find(
    option => option.value === `${filters.sortBy}-${filters.sortOrder}`
  )?.label || 'Newest First';

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search tasks..."
          value={filters.search || ''}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9"
          data-testid="search-tasks-input"
        />
      </div>

      {/* Status Filters and Sort */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filters.completed === undefined ? "default" : "outline"}
            size="sm"
            onClick={() => handleStatusFilter(undefined)}
            data-testid="filter-all-tasks"
          >
            All Tasks ({totalTasks})
          </Button>
          
          <Button
            variant={filters.completed === false ? "default" : "outline"}
            size="sm"
            onClick={() => handleStatusFilter(false)}
            data-testid="filter-pending-tasks"
          >
            Pending ({pendingTasks})
          </Button>
          
          <Button
            variant={filters.completed === true ? "default" : "outline"}
            size="sm"
            onClick={() => handleStatusFilter(true)}
            data-testid="filter-completed-tasks"
          >
            Completed ({completedTasks})
          </Button>
        </div>

        {/* Sort Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowUpDown className="h-4 w-4" />
              {currentSort}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Sort by</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {sortOptions.map((option) => {
              const [sortBy, sortOrder] = option.value.split('-');
              const isActive = `${filters.sortBy}-${filters.sortOrder}` === option.value;
              
              return (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => handleSortChange(sortBy, sortOrder as 'asc' | 'desc')}
                  className={cn(isActive && "bg-accent")}
                >
                  {option.label}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Active Filters Summary */}
      {(filters.search || filters.completed !== undefined) && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          
          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              Search: "{filters.search}"
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => handleSearchChange('')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {filters.completed !== undefined && (
            <Badge variant="secondary" className="gap-1">
              Status: {filters.completed ? 'Completed' : 'Pending'}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => handleStatusFilter(undefined)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFiltersChange({ page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' })}
            className="h-6 px-2 text-xs"
            data-testid="clear-filters-button"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
};