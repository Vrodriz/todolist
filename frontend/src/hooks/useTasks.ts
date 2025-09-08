import { useState, useEffect } from 'react';
import { taskApi } from '@/services/api';
import { Task, TasksResponse, TaskFilters, CreateTaskData, UpdateTaskData } from '@/types/task';

export const useTasks = (initialFilters?: TaskFilters) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TaskFilters>(initialFilters || {
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const fetchTasks = async (newFilters?: TaskFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      const filtersToUse = { ...filters, ...newFilters };
      const response: TasksResponse = await taskApi.getTasks(filtersToUse);
      setTasks(response.data);
      setPagination(response.pagination);
      setFilters(filtersToUse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching tasks');
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (data: CreateTaskData) => {
    setLoading(true);
    setError(null);
    
    try {
      await taskApi.createTask(data);
      await fetchTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while creating the task');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async (id: string, data: UpdateTaskData) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedTask = await taskApi.updateTask(id, data);
      setTasks(prev => prev.map(task => task.id === id ? updatedTask : task));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while updating the task');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await taskApi.deleteTask(id);
      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while deleting the task');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskStatus = async (id: string, completed: boolean) => {
    try {
      await updateTask(id, { completed });
    } catch (err) {
      console.error('Error toggling task status:', err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return {
    tasks,
    pagination,
    loading,
    error,
    filters,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    setFilters: (newFilters: TaskFilters) => fetchTasks(newFilters),
  };
};