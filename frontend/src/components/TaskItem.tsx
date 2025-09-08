import React, { useState } from 'react';
import { format, isValid, parseISO, isPast } from 'date-fns';
import { Clock, Calendar, Edit3, Trash2, Check, Loader2 } from 'lucide-react';
import { Task, UpdateTaskData } from '@/types/task';
import { TaskEditForm } from './TaskEditForm';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface TaskItemProps {
  task: Task;
  onUpdate: (id: string, data: UpdateTaskData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onToggleStatus: (id: string, completed: boolean) => Promise<void>;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onUpdate,
  onDelete,
  onToggleStatus,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleToggleComplete = async () => {
    try {
      await onToggleStatus(task.id, !task.completed);
    } catch (error) {
      console.error('Erro ao alternar status da tarefa:', error);
    }
  };

  const handleEdit = async (data: UpdateTaskData) => {
    try {
      await onUpdate(task.id, data);
      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      throw error;
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(task.id);
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error);
      setIsDeleting(false);
    } finally {
      setShowDeleteDialog(false);
    }
  };

  const formatDueDate = (dateString: string) => {
    const date = parseISO(dateString);
    if (!isValid(date)) return null;
    const isOverdue = isPast(date) && !task.completed;
    return {
      formatted: format(date, 'dd/MM/yyyy HH:mm'),
      isOverdue,
    };
  };

  const dueDate = task.dueDate ? formatDueDate(task.dueDate) : null;

  if (isEditing) {
    return (
      <Card className="animate-fade-in">
        <CardContent className="p-6">
          <TaskEditForm
            task={task}
            onSave={handleEdit}
            onCancel={() => setIsEditing(false)}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        'transition-all duration-200 hover:shadow-md',
        task.completed && 'opacity-75',
        isDeleting && 'opacity-50 pointer-events-none'
      )}
      data-testid={`task-item-${task.id}`}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleComplete}
            className={cn(
              'h-6 w-6 rounded-full border-2 p-0 transition-colors',
              task.completed
                ? 'border-primary bg-primary text-primary-foreground hover:bg-primary/90'
                : 'border-muted-foreground/25 hover:border-primary hover:bg-primary/10'
            )}
            data-testid={`toggle-task-${task.id}`}
          >
            {task.completed && <Check className="h-3 w-3" />}
          </Button>

          <div className="flex-1 min-w-0 space-y-2">
            <h3
              className={cn(
                'text-base font-medium break-words',
                task.completed
                  ? 'line-through text-muted-foreground'
                  : 'text-foreground'
              )}
            >
              {task.title}
            </h3>
            
            {task.description && (
              <p
                className={cn(
                  'text-sm break-words leading-relaxed',
                  'text-muted-foreground'
                )}
              >
                {task.description}
              </p>
            )}

            <div className="flex items-center flex-wrap gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>
                  Criada em {format(parseISO(task.createdAt), 'dd/MM/yyyy')}
                </span>
              </div>

              {dueDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <Badge 
                    variant={dueDate.isOverdue ? "destructive" : "secondary"}
                    className="text-xs"
                  >
                    Vence em {dueDate.formatted}
                    {dueDate.isOverdue && ' (Atrasada)'}
                  </Badge>
                </div>
              )}

              {task.completed && (
                <Badge variant="secondary" className="text-xs">
                  Concluída
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(true)}
              className="h-8 w-8"
              title="Editar tarefa"
              data-testid={`edit-task-${task.id}`}
            >
              <Edit3 className="h-4 w-4" />
            </Button>
            
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  title="Deletar tarefa"
                  data-testid={`delete-task-${task.id}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Deletar Tarefa</DialogTitle>
                  <DialogDescription>
                    Tem certeza que deseja deletar "{task.title}"? Esta ação não pode ser desfeita.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteDialog(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deletando...
                      </>
                    ) : (
                      'Deletar'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
