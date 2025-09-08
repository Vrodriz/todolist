import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, X, Calendar, AlertCircle } from 'lucide-react';
import { CreateTaskData } from '@/types/task';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TaskFormProps {
  onSubmit: (data: CreateTaskData) => Promise<void>;
  isLoading: boolean;
}

interface FormData {
  title: string;
  description: string;
  dueDate: string;
}

export const TaskForm: React.FC<TaskFormProps> = ({ onSubmit, isLoading }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<FormData>({
    mode: 'onChange',
  });

  const handleFormSubmit = async (data: FormData) => {
    setSubmitError(null);
    try {
      const taskData: CreateTaskData = {
        title: data.title.trim(),
        description: data.description.trim() || undefined,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
      };
      await onSubmit(taskData);
      reset();
      setIsOpen(false);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to create task');
    }
  };

  const handleCancel = () => {
    reset();
    setIsOpen(false);
    setSubmitError(null);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        size="lg"
        className="w-full gap-2 py-6 text-base"
        data-testid="open-task-form"
      >
        <Plus className="h-5 w-5" />
        Adicionar nova tarefa
      </Button>
    );
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl">Criar nova tarefa</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCancel}
          data-testid="close-task-form"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label 
              htmlFor="title" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Title <span className="text-destructive">*</span>
            </label>
            <Input
              id="title"
              placeholder="Enter task title..."
              {...register('title', {
                required: 'Title is required',
                maxLength: {
                  value: 255,
                  message: 'Title must be less than 255 characters',
                },
              })}
              className={cn(
                errors.title && "border-destructive focus-visible:ring-destructive"
              )}
              data-testid="task-title-input"
            />
            {errors.title && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.title.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label 
              htmlFor="description" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Descrição
            </label>
            <textarea
              id="description"
              rows={3}
              {...register('description', {
                maxLength: {
                  value: 1000,
                  message: 'Description must be less than 1000 characters',
                },
              })}
              className={cn(
                "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none",
                errors.description && "border-destructive focus-visible:ring-destructive"
              )}
              placeholder="Enter task description..."
              data-testid="task-description-input"
            />
            {errors.description && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.description.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label 
              htmlFor="dueDate" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Data para concluir tarefa
            </label>
            <div className="relative">
              <Input
                type="datetime-local"
                id="dueDate"
                {...register('dueDate')}
                min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                className="pr-10"
                data-testid="task-due-date-input"
              />
              <Calendar className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
          </div>
          {submitError && (
            <div className="rounded-lg border border-destructive bg-destructive/10 p-3">
              <p className="text-sm text-destructive flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {submitError}
              </p>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={!isValid || isLoading}
              className="flex-1"
              data-testid="create-task-button"
            >
              {isLoading ? 'Creating...' : 'Create Task'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              data-testid="cancel-task-button"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
