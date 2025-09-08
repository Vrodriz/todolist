export interface Task {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  dueDate?: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  completed?: boolean;
  dueDate?: string;
}

export interface TasksResponse {
  data: Task[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface TaskFilters {
  completed?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'dueDate' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}