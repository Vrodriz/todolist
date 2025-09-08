export interface Task {
  id: string;
  title: string;
  description?: string | null;
  completed: boolean;
  dueDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  dueDate?: Date;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  completed?: boolean;
  dueDate?: Date;
}

export interface TaskFilters {
  completed?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'dueDate' | 'title';
  sortOrder?: 'asc' | 'desc';
}