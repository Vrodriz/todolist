import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckSquare, 
  Calendar, 
  Clock, 
  CheckCircle2,
  Plus,
  Search,
  Filter
} from 'lucide-react';

interface SidebarProps {
  className?: string;
  activeView: string;
  onViewChange: (view: string) => void;
  taskCounts?: {
    all: number;
    today: number;
    upcoming: number;
    completed: number;
  };
}

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  count?: number;
  isActive: boolean;
  onClick: () => void;
}

function NavItem({ icon: Icon, label, count, isActive, onClick }: NavItemProps) {
  return (
    <Button
      variant={isActive ? "secondary" : "ghost"}
      className={cn(
        "w-full justify-start gap-3 px-3 py-2.5 h-auto font-medium text-sm",
        isActive && "bg-accent text-accent-foreground"
      )}
      onClick={onClick}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="flex-1 text-left">{label}</span>
      {typeof count === 'number' && count > 0 && (
        <Badge variant="secondary" className="ml-auto text-xs px-2 py-0.5">
          {count}
        </Badge>
      )}
    </Button>
  );
}

export function Sidebar({ 
  className, 
  activeView, 
  onViewChange,
  taskCounts = { all: 0, today: 0, upcoming: 0, completed: 0 }
}: SidebarProps) {
  const navigationItems = [
    {
      id: 'all',
      label: 'Todas as Tarefas',
      icon: CheckSquare,
      count: taskCounts.all
    },
    {
      id: 'today',
      label: 'Hoje',
      icon: Calendar,
      count: taskCounts.today
    },
    {
      id: 'upcoming',
      label: 'Próximas',
      icon: Clock,
      count: taskCounts.upcoming
    },
    {
      id: 'completed',
      label: 'Concluídas',
      icon: CheckCircle2,
      count: taskCounts.completed
    }
  ];

  return (
    <aside className={cn(
      "flex h-full w-64 flex-col border-r bg-card text-card-foreground",
      className
    )}>
      <div className="flex items-center gap-3 px-4 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <CheckSquare className="h-4 w-4" />
        </div>
        <div>
          <h1 className="text-lg font-semibold">Lista de Tarefas</h1>
        </div>
      </div>

      <Separator />

      <div className="px-4 py-4">
        <Button className="w-full justify-start gap-2" size="sm">
          <Plus className="h-4 w-4" />
          Nova Tarefa
        </Button>
      </div>

      <Separator />

      <nav className="flex-1 px-4 py-4">
        <div className="space-y-1">
          {navigationItems.map((item) => (
            <NavItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              count={item.count}
              isActive={activeView === item.id}
              onClick={() => onViewChange(item.id)}
            />
          ))}
        </div>
      </nav>

      <div className="border-t px-4 py-4">
        <div className="space-y-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start gap-2"
          >
            <Search className="h-4 w-4" />
            Buscar Tarefas
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
        </div>
      </div>
    </aside>
  );
}