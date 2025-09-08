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
  filters: FilterType;
  onFiltersChange: (filters: FilterType) => void;
  totalTasks: number;
  completedTasks: number;
}

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
      page: 1,
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
    { label: 'Mais recentes', value: 'createdAt-desc' },
    { label: 'Mais antigas', value: 'createdAt-asc' },
    { label: 'Título A-Z', value: 'title-asc' },
    { label: 'Título Z-A', value: 'title-desc' },
    { label: 'Prazo (mais próximo)', value: 'dueDate-asc' },
    { label: 'Prazo (mais distante)', value: 'dueDate-desc' },
    { label: 'Atualizadas recentemente', value: 'updatedAt-desc' },
  ];

  const currentSort = sortOptions.find(
    option => option.value === `${filters.sortBy}-${filters.sortOrder}`
  )?.label || 'Mais recentes';

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar tarefas..."
          value={filters.search || ''}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9"
          data-testid="search-tasks-input"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filters.completed === undefined ? "default" : "outline"}
            size="sm"
            onClick={() => handleStatusFilter(undefined)}
            data-testid="filter-all-tasks"
          >
            Todas ({totalTasks})
          </Button>
          
          <Button
            variant={filters.completed === false ? "default" : "outline"}
            size="sm"
            onClick={() => handleStatusFilter(false)}
            data-testid="filter-pending-tasks"
          >
            Pendentes ({pendingTasks})
          </Button>
          
          <Button
            variant={filters.completed === true ? "default" : "outline"}
            size="sm"
            onClick={() => handleStatusFilter(true)}
            data-testid="filter-completed-tasks"
          >
            Concluídas ({completedTasks})
          </Button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowUpDown className="h-4 w-4" />
              {currentSort}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
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

      {(filters.search || filters.completed !== undefined) && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Filtros ativos:</span>
          
          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              Busca: "{filters.search}"
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
              Status: {filters.completed ? 'Concluídas' : 'Pendentes'}
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
            Limpar tudo
          </Button>
        </div>
      )}
    </div>
  );
};
