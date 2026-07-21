<div align="center">

# Task Manager — Kanban Board Fullstack

**Sistema completo de gestão de tarefas com quadro Kanban, autenticação JWT, upload de arquivos e arquitetura limpa.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)](https://docker.com/)
[![Swagger](https://img.shields.io/badge/Swagger-API_Docs-85EA2D?style=flat-square&logo=swagger&logoColor=black)](https://swagger.io/)

</div>

---

## 🔗 Demo ao vivo

**App:** https://everlabs-fullstack.vercel.app
**API:** https://everlabs-fullstack.onrender.com/api-docs

**Login de demonstração:**
```
Email: admin@demo.com
Senha: demo12345
```

> ⚠️ Hospedado em planos gratuitos: a API "dorme" após 15 min de inatividade — a primeira requisição pode levar 30–50s para acordar. Arquivos anexados em tarefas não persistem entre deploys (disco efêmero do free tier).

---

## Sobre o projeto

Aplicação fullstack de gerenciamento de tarefas no estilo Kanban/SCRUM. O projeto foi construído com foco em boas práticas de engenharia: **Clean Architecture**, **SOLID**, **injeção de dependências** e **testes unitários** — tanto no backend quanto no frontend.

O backend expõe uma API RESTful documentada com Swagger, e o frontend consome essa API com gerenciamento de estado via Redux Toolkit. Todo o ambiente roda com um único comando via Docker Compose.

---

## Funcionalidades

### Autenticação e Perfis
- Login e logout com **JWT**
- Dois perfis de acesso: **Admin** e **User**
- Middleware de autorização baseado em roles

### Gestão de Tarefas (Admin)
- CRUD completo de tarefas
- Atribuição de responsáveis, prioridade (0–10) e datas
- Sistema de **tags/etiquetas**
- Upload de **arquivos anexos**

### Quadro Kanban (User)
- Drag-and-drop nativo (sem dependência externa) entre colunas
- Status: `TODO` → `IN_PROGRESS` → `REVIEW` → `DONE`
- Comentários e ocorrências por tarefa

### Permissões

| Ação | Admin | User |
|------|:-----:|:----:|
| Criar/editar/excluir tarefas | ✅ | ❌ |
| Atualizar status | ✅ | ✅ (próprias) |
| Adicionar comentários | ✅ | ✅ (próprias) |
| Upload de arquivos | ✅ | ✅ (próprias) |

---

## Stack tecnológica

### Backend
| Tecnologia | Uso |
|-----------|-----|
| Node.js + Express | Runtime e framework HTTP |
| TypeScript | Tipagem estática em todo o projeto |
| Prisma ORM | Acesso ao banco de dados com type-safety |
| PostgreSQL | Banco de dados relacional |
| JWT | Autenticação stateless |
| Zod | Validação de schemas na camada HTTP |
| TSyringe | Injeção de dependências (IoC container) |
| Vitest | Testes unitários |
| Swagger/OpenAPI | Documentação interativa da API |

### Frontend
| Tecnologia | Uso |
|-----------|-----|
| React 18 | Biblioteca de interface |
| TypeScript | Tipagem de componentes, hooks e store |
| Redux Toolkit | Gerenciamento de estado global |
| Vite | Build tool e dev server |
| CSS Modules | Estilização com escopo local |

### DevOps
| Tecnologia | Uso |
|-----------|-----|
| Docker + Docker Compose | Containerização de backend e frontend |
| Nginx | Serve o build do React em produção |

---

## Arquitetura

O backend segue **Clean Architecture**, separando regras de negócio de detalhes de infraestrutura:

```
backend/src/
├── domain/               # Núcleo da aplicação — sem dependências externas
│   ├── entities/         # Interfaces e tipos de domínio
│   ├── repositories/     # Contratos (interfaces) de acesso a dados
│   ├── providers/        # Contratos de serviços externos
│   └── useCases/         # Casos de uso: lógica de negócio pura
│
├── infra/                # Implementações concretas
│   ├── database/         # Repositórios Prisma (implementam domain/repositories)
│   ├── http/             # Controllers, rotas, middlewares
│   └── providers/        # Serviços: upload de arquivos, hash, etc.
│
└── shared/
    ├── container/        # Registro de dependências (TSyringe)
    └── errors/           # Classes de erro padronizadas
```

Esse modelo permite, por exemplo, **trocar o banco de dados** (feito com PostgreSQL) apenas substituindo a implementação do repositório, sem tocar nos casos de uso.

---

## Como rodar

### Com Docker (recomendado)

```bash
git clone https://github.com/Dieguin77/everlabs-fullstack.git
cd everlabs-fullstack
docker-compose up --build
```

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3333 |
| Swagger Docs | http://localhost:3333/api-docs |

### Localmente

Requer um PostgreSQL rodando (local, Docker avulso, ou uma instância gratuita no Supabase/Neon).

**Backend:**
```bash
cd backend
npm install
cp .env.example .env   # ajuste DATABASE_URL para seu Postgres
npx prisma migrate dev
npx prisma db seed     # cria o usuário admin@demo.com / demo12345
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

---

## API — Principais endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/api/users` | Criar usuário |
| `POST` | `/api/users/authenticate` | Login (retorna JWT) |
| `GET` | `/api/users/me` | Perfil autenticado |
| `GET` | `/api/tasks` | Listar tarefas |
| `POST` | `/api/tasks` | Criar tarefa (Admin) |
| `PATCH` | `/api/tasks/:id/status` | Atualizar status |
| `POST` | `/api/tasks/:id/comments` | Adicionar comentário |
| `POST` | `/api/files/tasks/:id` | Upload de arquivo |
| `GET` | `/api/tags` | Listar tags |

Todas as rotas protegidas exigem o header:
```
Authorization: Bearer <token>
```

A documentação completa e interativa está disponível no Swagger em `http://localhost:3333/api-docs`.

---

## Testes

```bash
cd backend

# Rodar todos os testes
npm test

# Com relatório de cobertura
npm run test:coverage

# Modo watch
npm run test:watch
```

---

## Variáveis de ambiente

**Backend** (`backend/.env`):
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/everlabs?schema=public"
JWT_SECRET="sua-chave-secreta"
JWT_EXPIRES_IN="7d"
PORT=3333
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:3333/api
```

---

## Criando o primeiro usuário Admin

O jeito mais simples é rodar o seed, que cria `admin@demo.com` / `demo12345`:

```bash
cd backend
npx prisma db seed
```

Ou criar um usuário próprio via API:

```bash
curl -X POST http://localhost:3333/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin",
    "email": "admin@exemplo.com",
    "password": "123456",
    "role": "ADMIN"
  }'
```

---

## Decisões técnicas

**Clean Architecture** — A separação entre `domain` e `infra` mantém os casos de uso independentes de banco de dados, framework e qualquer detalhe externo. Isso facilita testes e evolução do sistema.

**TSyringe (IoC Container)** — A inversão de controle permite injetar implementações concretas nos casos de uso sem acoplamento. Trocar a implementação de um repositório ou provider não exige alterar nenhuma regra de negócio.

**Redux Toolkit** — Escolhido pela previsibilidade e ferramentas de debug (Redux DevTools). Para o volume de estado desse projeto, o RTK Query simplificou o cache das requisições.

**Drag-and-drop nativo** — Implementado com a API HTML5 Drag and Drop, sem bibliotecas externas. Reduz bundle size e dá controle total sobre o comportamento.

**PostgreSQL** — Usado tanto localmente (via Docker Compose) quanto em produção, para manter paridade entre ambientes. A Clean Architecture torna a troca de banco (ex.: MySQL) uma mudança isolada na camada de repositório.

---

<div align="center">

Desenvolvido por **[Diego Batista](https://github.com/Dieguin77)**

</div>
