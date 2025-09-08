import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Save, X, Calendar } from 'lucide-react';
import { Task, UpdateTaskData } from '@/types/task';
import { format, parseISO } from 'date-fns';

interface TaskEditFormProps {
  task: Task;
  onSave: (data: UpdateTaskData) => Promise<void>;
  onCancel: () => void;
}

interface FormData {
  title: string;
  description: string;
  dueDate: string;
}

export const TaskEditForm: React.FC<TaskEditFormProps> = ({
  task,
  onSave,
  onCancel,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    defaultValues: {
      title: task.title,
      description: task.description || '',
      dueDate: task.dueDate 
        ? format(parseISO(task.dueDate), "yyyy-MM-dd'T'HH:mm")
        : '',
    },
    mode: 'onChange',
  });

  const handleFormSubmit = async (data: FormData) => {
    setIsLoading(true);
    setSubmitError(null);
    
    try {
      const updateData: UpdateTaskData = {
        title: data.title.trim(),
        description: data.description.trim() || undefined,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
      };
      
      await onSave(updateData);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Falha ao atualizar tarefa');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 mb-1">
          Título *
        </label>
        <input
          type="text"
          id="edit-title"
          {...register('title', {
            required: 'Título é obrigatório',
            maxLength: {
              value: 255,
              message: 'Título deve ter menos de 255 caracteres',
            },
          })}
          className="input-field"
          placeholder="Digite o título da tarefa..."
          data-testid="edit-task-title-input"
        />
        {errors.title && (
          <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-1">
          Descrição
        </label>
        <textarea
          id="edit-description"
          rows={3}
          {...register('description', {
            maxLength: {
              value: 1000,
              message: 'Descrição deve ter menos de 1000 caracteres',
            },
          })}
          className="input-field resize-none"
          placeholder="Digite a descrição da tarefa..."
          data-testid="edit-task-description-input"
        />
        {errors.description && (
          <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="edit-dueDate" className="block text-sm font-medium text-gray-700 mb-1">
          Data de Vencimento
        </label>
        <div className="relative">
          <input
            type="datetime-local"
            id="edit-dueDate"
            {...register('dueDate')}
            className="input-field pr-10"
            data-testid="edit-task-due-date-input"
          />
          <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
        </div>
      </div>

      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-600 text-sm">{submitError}</p>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={!isDirty || isLoading}
          className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          data-testid="save-task-button"
        >
          <Save className="w-4 h-4" />
          {isLoading ? 'Salvando...' : 'Salvar Alterações'}
        </button>
        
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary flex items-center gap-2"
          data-testid="cancel-edit-button"
        >
          <X className="w-4 h-4" />
          Cancelar
        </button>
      </div>
    </form>
  );
};