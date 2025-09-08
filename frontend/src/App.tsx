import { useState } from 'react';
import { TaskForm } from './components/TaskForm';
import { TaskList } from './components/TaskList';
import { Layout } from './components/Layout';
import { useTasks } from './hooks/useTasks';

/**
 * Main App component with modern ClickUp-style design
 * Features theme support, responsive layout, and comprehensive task management
 */
function App() {
  const [activeView, setActiveView] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const {
    tasks,
    pagination,
    loading,
    error,
    filters,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    setFilters,
  } = useTasks();

  // Calculate task counts for navigation
  const taskCounts = {
    all: pagination.total,
    today: tasks.filter(task => {
      if (!task.dueDate) return false;
      const today = new Date();
      const dueDate = new Date(task.dueDate);
      return dueDate.toDateString() === today.toDateString();
    }).length,
    upcoming: tasks.filter(task => {
      if (!task.dueDate) return false;
      const today = new Date();
      const dueDate = new Date(task.dueDate);
      return dueDate > today;
    }).length,
    completed: tasks.filter(task => task.completed).length,
  };

  const handleViewChange = (view: string) => {
    setActiveView(view);
    
    // Apply filters based on view
    const newFilters: any = { ...filters, page: 1 };
    
    switch (view) {
      case 'today':
        // Filter tasks due today  
        newFilters.completed = undefined; // Show all tasks for today
        break;
      case 'upcoming':
        newFilters.completed = false; // Only show incomplete upcoming tasks
        break;
      case 'completed':
        newFilters.completed = true;
        break;
      default:
        newFilters.completed = undefined; // Show all tasks
    }
    
    setFilters(newFilters);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setFilters({ ...filters, search: query || undefined, page: 1 });
  };

  const handleFiltersChange = (newFilters: any) => {
    setFilters({ ...filters, ...newFilters });
  };

  return (
    <Layout
      activeView={activeView}
      onViewChange={handleViewChange}
      taskCounts={taskCounts}
      searchQuery={searchQuery}
      onSearchChange={handleSearchChange}
      onFiltersChange={handleFiltersChange}
    >
      <div className="space-y-6">
        <TaskForm onSubmit={createTask} isLoading={loading} />
        
        <TaskList
          tasks={tasks}
          loading={loading}
          error={error}
          filters={filters}
          pagination={pagination}
          onFiltersChange={setFilters}
          onUpdateTask={updateTask}
          onDeleteTask={deleteTask}
          onToggleStatus={toggleTaskStatus}
        />
      </div>
    </Layout>
  );
}

export default App;