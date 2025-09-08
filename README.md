# Todo List Application

Uma aplicação completa de gerenciamento de tarefas construída com React (frontend) e Fastify (backend), seguindo as melhores práticas de desenvolvimento moderno.

## 🚀 Funcionalidades

### ✨ CRUD Completo de Tarefas

- **Create**: Criar novas tarefas com título, descrição e data de vencimento
- **Read**: Listar e visualizar tarefas com filtros e paginação
- **Update**: Editar tarefas existentes e alterar status de conclusão
- **Delete**: Remover tarefas com confirmação

### 🔍 Recursos Avançados

- **Busca**: Pesquisar tarefas por título e descrição
- **Filtros**: Filtrar por status (pendente/concluída)
- **Ordenação**: Múltiplas opções de ordenação
- **Paginação**: Navegação eficiente através das tarefas
- **Responsivo**: Interface adaptável para desktop e mobile
- **Tempo Real**: Interface reativa com feedback visual

## 🛠 Tecnologias Utilizadas

### Backend
- **Node.js** + **TypeScript**
- **Fastify** - Framework web rápido e eficiente
- **Prisma** - ORM moderno para PostgreSQL
- **Zod** - Validação de schema TypeScript-first
- **PostgreSQL** - Banco de dados relacional
- **Docker** - Containerização
- **Jest + SWC** - Testes unitários e de integração
- **Supertest** - Testes de API

### Frontend
- **React 18** + **TypeScript**
- **Vite** - Build tool moderno
- **Tailwind CSS** - Framework CSS utilitário
- **React Hook Form** - Gerenciamento de formulários
- **Axios** - Cliente HTTP
- **Lucide React** - Ícones
- **date-fns** - Manipulação de datas

### DevOps
- **Docker Compose** - Orquestração de containers
- **ESLint** + **Prettier** - Qualidade de código
- **Vitest** - Testes do frontend

## 📋 Pré-requisitos

- **Node.js** 18+ 
- **Docker** e **Docker Compose**
- **Git**

## 🚀 Como Executar

### 1. Clone o repositório

```bash
git clone <repository-url>
cd todo-list
```

### 2. Executar com Docker (Recomendado)

```bash
# Iniciar todos os serviços
docker-compose up --build

# Em modo detached (background)
docker-compose up -d --build
```

Acesse:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/documentation
- **Banco de dados**: localhost:5432

### 3. Desenvolvimento Local

#### Backend

```bash
cd backend

# Instalar dependências
npm install

# Configurar ambiente
cp .env.example .env

# Iniciar PostgreSQL com Docker
docker-compose up postgres -d

# Gerar cliente Prisma
npm run db:generate

# Executar migrações
npm run db:push

# Popular banco com dados de exemplo
npm run db:seed

# Iniciar em modo desenvolvimento
npm run dev
```

#### Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Iniciar em modo desenvolvimento
npm run dev
```

## 🧪 Testes

### Backend

```bash
cd backend

# Testes unitários
npm test

# Testes de integração
npm run test:integration

# Cobertura de testes
npm run test:coverage

# Testes em modo watch
npm run test:watch
```

### Frontend

```bash
cd frontend

# Testes
npm test

# Testes com interface
npm run test:ui

# Cobertura de testes
npm run test:coverage
```

## 📁 Estrutura do Projeto

```
todo-list/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Lógica de negócio
│   │   ├── entities/        # Definições de tipos
│   │   ├── routes/          # Rotas da API
│   │   ├── schemas/         # Validação Zod
│   │   ├── database/        # Configuração Prisma
│   │   └── tests/           # Testes unitários e integração
│   ├── prisma/
│   │   ├── schema.prisma    # Schema do banco
│   │   └── seed.ts          # Dados iniciais
│   └── docker/              # Configurações Docker
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # Serviços API
│   │   ├── types/           # Tipos TypeScript
│   │   └── test/            # Configuração de testes
│   └── public/              # Arquivos estáticos
│
└── docker-compose.yml       # Orquestração dos serviços
```

## 🌐 API Endpoints

Base URL: `http://localhost:3001/api`

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/tasks` | Listar tarefas com filtros |
| GET | `/tasks/:id` | Obter tarefa específica |
| POST | `/tasks` | Criar nova tarefa |
| PATCH | `/tasks/:id` | Atualizar tarefa |
| DELETE | `/tasks/:id` | Deletar tarefa |

### Parâmetros de Query (GET /tasks)

- `completed`: `boolean` - Filtrar por status
- `search`: `string` - Buscar no título/descrição
- `page`: `number` - Página atual (padrão: 1)
- `limit`: `number` - Itens por página (padrão: 10)
- `sortBy`: `string` - Campo para ordenação
- `sortOrder`: `'asc' | 'desc'` - Ordem

### Exemplos de Uso

```bash
# Listar todas as tarefas
GET /api/tasks

# Buscar tarefas pendentes
GET /api/tasks?completed=false

# Buscar por texto
GET /api/tasks?search=importante

# Ordenar por data de vencimento
GET /api/tasks?sortBy=dueDate&sortOrder=asc

# Criar nova tarefa
POST /api/tasks
{
  "title": "Minha tarefa",
  "description": "Descrição da tarefa",
  "dueDate": "2024-12-31T23:59:59.000Z"
}
```

## 🎨 Features da Interface

### Design Responsivo
- Layout adaptável para desktop, tablet e mobile
- Componentes otimizados para touch
- Menu hambúrguer em dispositivos móveis

### Experiência do Usuário
- Loading states e skeleton screens
- Animações suaves e transições
- Feedback visual para todas as ações
- Confirmações para ações destrutivas
- Estados de erro com retry
- Paginação inteligente

### Acessibilidade
- Navegação por teclado
- Labels semânticas
- Contraste adequado
- Indicadores visuais claros

## 🔒 Validação e Segurança

### Backend
- Validação rigorosa com Zod
- Sanitização de inputs
- Tratamento de erros padronizado
- Logs estruturados
- CORS configurado

### Frontend
- Validação de formulários em tempo real
- Sanitização de dados
- Tratamento de estados de erro
- Feedback visual de validação

## 📊 Qualidade de Código

### Backend
- **TypeScript** strict mode
- **ESLint** com regras rigorosas
- **Testes** com cobertura > 80%
- **Arquitetura** em camadas bem definidas
- **Error handling** padronizado

### Frontend
- **TypeScript** strict mode
- **Component composition** sobre herança
- **Custom hooks** para lógica reutilizável
- **Props interfaces** documentadas
- **CSS-in-JS** com Tailwind

## 🐳 Docker

### Serviços Disponíveis

```yaml
services:
  postgres:    # Banco de dados PostgreSQL
  app:         # Backend API (Fastify)
  frontend:    # Frontend React (Nginx em produção)
```

### Comandos Úteis

```bash
# Ver logs dos serviços
docker-compose logs -f

# Parar todos os serviços
docker-compose down

# Rebuild específico
docker-compose up --build app

# Executar comando no container
docker-compose exec app npm run test
```

## 🚀 Deploy

### Preparação para Produção

```bash
# Backend - Build
cd backend
npm run build

# Frontend - Build
cd frontend
npm run build
```

### Variáveis de Ambiente

#### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@host:port/database
PORT=3001
NODE_ENV=production
```

#### Frontend
```env
VITE_API_URL=https://api.yourdomain.com
```

### Padrões de Commit

Seguimos a especificação [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new task creation feature
fix: resolve task deletion bug
docs: update API documentation
test: add unit tests for TaskController
refactor: improve task validation logic
```