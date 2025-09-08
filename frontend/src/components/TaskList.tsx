import React from 'react';
import { ChevronLeft, ChevronRight, Loader2, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { Task, TaskFilters, UpdateTaskData } from '@/types/task';
import { TaskItem } from './TaskItem';
import { TaskFilters as FilterComponent } from './TaskFilters';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  filters: TaskFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  onFiltersChange: (filters: TaskFilters) => void;
  onUpdateTask: (id: string, data: UpdateTaskData) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
  onToggleStatus: (id: string, completed: boolean) => Promise<void>;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  loading,
  error,
  filters,
  pagination,
  onFiltersChange,
  onUpdateTask,
  onDeleteTask,
  onToggleStatus,
}) => {
  const completedTasks = tasks.filter(task => task.completed).length;

  const handlePageChange = (page: number) => {
    onFiltersChange({ ...filters, page });
  };

  const generatePageNumbers = () => {
    const pages = [];
    const current = pagination.page;
    const total = pagination.pages;

    if (total <= 5) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 3) {
        pages.push(1, 2, 3, 4, '...', total);
      } else if (current >= total - 2) {
        pages.push(1, '...', total - 3, total - 2, total - 1, total);
      } else {
        pages.push(1, '...', current - 1, current, current + 1, '...', total);
      }
    }

    return pages;
  };

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Card>
          <CardContent className="flex flex-col items-center p-12 text-center">
            <AlertCircle className="mb-4 h-16 w-16 text-destructive" />
            <h2 className="mb-2 text-xl font-semibold">Algo deu errado</h2>
            <p className="mb-6 text-muted-foreground">{error}</p>
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Tente novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FilterComponent
        filters={filters}
        onFiltersChange={onFiltersChange}
        totalTasks={pagination.total}
        completedTasks={completedTasks}
      />

      {loading && (
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-muted-foreground">Carregando tarefas</span>
          </div>
        </div>
      )}

      {!loading && tasks.length === 0 && (
        <div className="flex min-h-[400px] items-center justify-center">
          <Card>
            <CardContent className="flex flex-col items-center p-12 text-center">
              <CheckCircle className="mb-4 h-16 w-16 text-muted-foreground" />
              <h2 className="mb-2 text-xl font-semibold">
                {filters.search || filters.completed !== undefined
                  ? 'Nenhuma tarefa encontrada'
                  : 'Nenhuma tarefa ainda'}
              </h2>
              <p className="text-muted-foreground">
                {filters.search || filters.completed !== undefined
                  ? 'Tente ajustar seus filtros para ver mais tarefas.'
                  : 'Crie sua primeira tarefa para começar!'}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {!loading && tasks.length > 0 && (
        <>
          <div className="space-y-4">
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onUpdate={onUpdateTask}
                onDelete={onDeleteTask}
                onToggleStatus={onToggleStatus}
              />
            ))}
          </div>

          {pagination.pages > 1 && (
            <Card>
              <CardContent className="flex items-center justify-between p-4">
                <div className="text-sm text-muted-foreground">
                  <span>
                    Mostrando {((pagination.page - 1) * pagination.limit) + 1} até{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
                    {pagination.total} tarefas
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    data-testid="prev-page-button"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <div className="flex gap-1">
                    {generatePageNumbers().map((page, index) => {
                      if (page === '...') {
                        return (
                          <span
                            key={`ellipsis-${index}`}
                            className="flex h-9 w-9 items-center justify-center text-muted-foreground"
                          >
                            ...
                          </span>
                        );
                      }

                      return (
                        <Button
                          key={page}
                          variant={page === pagination.page ? "default" : "outline"}
                          size="icon"
                          onClick={() => handlePageChange(page as number)}
                          data-testid={`page-${page}-button`}
                        >
                          {page}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.pages}
                    data-testid="next-page-button"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};
