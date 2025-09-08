import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  Search,
  Filter,
  Moon,
  Sun,
  Monitor,
} from 'lucide-react';

interface HeaderProps {
  className?: string;
  activeView: string;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onFiltersChange?: (filters: any) => void;
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const themeOptions = [
    {
      label: 'Light Mode',
      value: 'light' as const,
      icon: Sun
    },
    {
      label: 'Dark Mode',
      value: 'dark' as const,
      icon: Moon
    },
  ];

  const currentTheme = themeOptions.find(option => option.value === theme);
  const CurrentIcon = currentTheme?.icon || Monitor;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <CurrentIcon className="h-4 w-4" />
          <span className="sr-only">Alternar tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Tema</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {themeOptions.map((option) => {
          const Icon = option.icon;
          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => setTheme(option.value)}
              className={cn(
                "flex items-center gap-2",
                theme === option.value && "bg-accent"
              )}
            >
              <Icon className="h-4 w-4" />
              {option.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ViewTitle({ view }: { view: string }) {
  const titles: Record<string, { title: string; description: string }> = {
    all: { 
      title: 'Todas as Tarefas', 
      description: 'Gerencie todas suas tarefas em um só lugar' 
    },
    today: { 
      title: 'Hoje', 
      description: 'Tarefas agendadas para hoje' 
    },
    upcoming: { 
      title: 'Próximas', 
      description: 'Tarefas agendadas para os próximos dias' 
    },
    completed: { 
      title: 'Concluídas', 
      description: 'Tarefas que você concluiu' 
    }
  };

  const { title, description } = titles[view] || titles.all;

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export function Header({
  className,
  activeView,
  searchQuery = '',
  onSearchChange,
  onFiltersChange
}: HeaderProps) {
  return (
    <header className={cn(
      "border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      className
    )}>
      <div className="flex items-center justify-between px-6 py-4">
        <ViewTitle view={activeView} />

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar tarefas..."
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="pl-9"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
                <span className="sr-only">Filtros</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Filtrar por Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onFiltersChange?.({ completed: undefined })}>
                Todas as Tarefas
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFiltersChange?.({ completed: false })}>
                Tarefas Ativas
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFiltersChange?.({ completed: true })}>
                Tarefas Concluídas
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onFiltersChange?.({ sortBy: 'createdAt', sortOrder: 'desc' })}>
                Mais Recentes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFiltersChange?.({ sortBy: 'createdAt', sortOrder: 'asc' })}>
                Mais Antigas
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFiltersChange?.({ sortBy: 'dueDate', sortOrder: 'asc' })}>
                Data de Vencimento
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFiltersChange?.({ sortBy: 'title', sortOrder: 'asc' })}>
                Alfabética
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
