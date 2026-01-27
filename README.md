# 🚀 Task Manager - Sistema de Gestão de Tarefas Kanban

Sistema fullstack de gestão de tarefas estilo SCRUM/Kanban desenvolvido como desafio técnico para a vaga de Estagiário Full Stack na **Everlabs**.

![Task Manager](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-20+-green.svg)
![React](https://img.shields.io/badge/react-18+-61DAFB.svg)
![TypeScript](https://img.shields.io/badge/typescript-5+-3178C6.svg)

## 📋 Índice

- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Arquitetura](#-arquitetura)
- [Instalação](#-instalação)
- [Executando com Docker](#-executando-com-docker)
- [Documentação da API](#-documentação-da-api)
- [Testes](#-testes)
- [Estrutura do Projeto](#-estrutura-do-projeto)

## ✨ Funcionalidades

### Usuários
- ✅ Autenticação JWT (login/logout)
- ✅ Dois perfis: **Admin** e **User**
- ✅ Cadastro de usuários via API

### Tarefas
- ✅ CRUD completo de tarefas (Admin)
- ✅ Quadro Kanban com drag-and-drop
- ✅ Status: TODO, IN_PROGRESS, REVIEW, DONE
- ✅ Prioridade de 0 a 10
- ✅ Atribuição de responsáveis
- ✅ Datas de início e fim

### Interações
- ✅ Comentários/ocorrências
- ✅ Upload de arquivos (anexos)
- ✅ Sistema de tags/etiquetas

### Permissões
| Ação | Admin | User |
|------|-------|------|
| Criar tarefas | ✅ | ❌ |
| Editar tarefas | ✅ | ❌ |
| Excluir tarefas | ✅ | ❌ |
| Atualizar status | ✅ | ✅ (próprias) |
| Adicionar comentários | ✅ | ✅ (próprias) |
| Upload de arquivos | ✅ | ✅ (próprias) |

## 🛠 Tecnologias

### Backend
- **Node.js** + **Express** - Runtime e framework web
- **TypeScript** - Tipagem estática
- **Prisma ORM** - ORM para banco de dados
- **SQLite** - Banco de dados
- **JWT** - Autenticação
- **Zod** - Validação de schemas
- **TSyringe** - Injeção de dependências
- **Vitest** - Testes unitários
- **Swagger** - Documentação da API

### Frontend
- **React 18** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Redux Toolkit** - Gerenciamento de estado
- **Vite** - Build tool
- **CSS Modules** - Estilização

### DevOps
- **Docker** + **Docker Compose** - Containerização
- **Nginx** - Servidor web para frontend

## 🏗 Arquitetura

O projeto segue os princípios de **Clean Architecture** e **SOLID**:

```
backend/src/
├── domain/           # Regras de negócio (entities, use cases)
│   ├── entities/     # Interfaces e tipos
│   ├── providers/    # Contratos de providers
│   ├── repositories/ # Contratos de repositórios
│   └── useCases/     # Casos de uso da aplicação
├── infra/            # Implementações concretas
│   ├── database/     # Prisma repositories
│   ├── http/         # Controllers, routes, middlewares
│   └── providers/    # Implementações de providers
└── shared/           # Código compartilhado
    ├── container/    # Injeção de dependências
    └── errors/       # Tratamento de erros
```

## 🚀 Instalação

### Pré-requisitos
- Node.js 20+
- npm ou yarn

### Backend

```bash
# Entrar na pasta do backend
cd backend

# Instalar dependências
npm install

# Criar arquivo .env
cp .env.example .env

# Executar migrations do Prisma
npx prisma migrate dev

# Iniciar servidor de desenvolvimento
npm run dev
```

O servidor estará disponível em `http://localhost:3333`

### Frontend

```bash
# Entrar na pasta do frontend
cd frontend

# Instalar dependências
npm install

# Criar arquivo .env
cp .env.example .env

# Iniciar servidor de desenvolvimento
npm run dev
```

O frontend estará disponível em `http://localhost:5173`

## 🐳 Executando com Docker

```bash
# Na raiz do projeto
docker-compose up --build
```

Serviços disponíveis:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3333
- **Swagger Docs**: http://localhost:3333/api-docs

## 📚 Documentação da API

A documentação interativa da API está disponível via Swagger:

```
http://localhost:3333/api-docs
```

### Principais Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/users` | Criar usuário |
| POST | `/api/users/authenticate` | Login |
| GET | `/api/users/me` | Perfil do usuário |
| GET | `/api/tasks` | Listar tarefas |
| POST | `/api/tasks` | Criar tarefa (Admin) |
| PATCH | `/api/tasks/:id/status` | Atualizar status |
| POST | `/api/tasks/:taskId/comments` | Adicionar comentário |
| POST | `/api/files/tasks/:taskId` | Upload de arquivo |
| GET | `/api/tags` | Listar tags |

### Autenticação

Todas as rotas protegidas requerem o header:
```
Authorization: Bearer <seu_token_jwt>
```

## 🧪 Testes

```bash
# Executar testes
cd backend
npm test

# Executar testes com coverage
npm run test:coverage

# Executar testes em modo watch
npm run test:watch
```

## 📁 Estrutura do Projeto

```
Projeto-everlabs-fullstack/
├── backend/
│   ├── src/
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   ├── providers/
│   │   │   ├── repositories/
│   │   │   └── useCases/
│   │   ├── infra/
│   │   │   ├── database/
│   │   │   ├── http/
│   │   │   └── providers/
│   │   └── shared/
│   ├── prisma/
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   └── store/
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

## 🔐 Variáveis de Ambiente

### Backend (.env)
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="sua-chave-secreta"
JWT_EXPIRES_IN="7d"
PORT=3333
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3333/api
```

## 👤 Criando Usuário Admin

Para criar o primeiro usuário admin, faça uma requisição POST:

```bash
curl -X POST http://localhost:3333/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin",
    "email": "admin@everlabs.com",
    "password": "123456",
    "role": "ADMIN"
  }'
```

## 🎯 Decisões Técnicas

1. **Clean Architecture**: Separação clara entre regras de negócio e detalhes de implementação, facilitando testes e manutenção.

2. **TSyringe para DI**: Inversão de dependência permite trocar implementações facilmente (ex: trocar SQLite por PostgreSQL).

3. **Redux Toolkit**: Gerenciamento de estado previsível e escalável no frontend.

4. **Drag and Drop nativo**: Implementação sem bibliotecas externas para melhor controle e menor bundle size.

5. **SQLite**: Escolhido pela simplicidade para desenvolvimento e demonstração, facilmente substituível por PostgreSQL/MySQL em produção.

## 📝 Licença

Este projeto foi desenvolvido como parte do desafio técnico para a vaga de Estagiário Full Stack na Everlabs.

---

Desenvolvido com 💜 para o desafio Everlabs
