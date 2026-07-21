# Task Manager API

Backend da aplicação de gerenciamento de tarefas estilo SCRUM/Kanban.

## Tecnologias Utilizadas

- Node.js com TypeScript
- Express.js para API RESTful
- Prisma ORM com PostgreSQL
- JWT para autenticação
- Clean Architecture
- SOLID principles
- Testes unitários com Vitest
- Documentação com Swagger
- Docker

## Estrutura do Projeto

```
src/
  ├── domain/           # Regras de negócio e interfaces
  │   ├── entities/     # Entidades do domínio
  │   ├── repositories/ # Interfaces dos repositórios
  │   └── useCases/     # Casos de uso da aplicação
  │
  ├── infra/           # Implementações de infraestrutura
  │   ├── database/    # Implementações do banco de dados
  │   └── http/        # Implementações HTTP (controllers, routes)
  │
  └── shared/          # Código compartilhado
      ├── container/   # Injeção de dependências
      ├── errors/      # Tratamento de erros
      └── utils/       # Utilitários
```

## Setup do Projeto

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

3. Configure o banco de dados:
```bash
npm run prisma:generate
npm run prisma:migrate
```

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

## Documentação da API

A documentação da API está disponível em `/api-docs` quando o servidor estiver rodando.

## Scripts Disponíveis

- `npm run dev`: Inicia o servidor de desenvolvimento
- `npm run build`: Compila o projeto para produção
- `npm start`: Inicia o servidor em produção
- `npm test`: Executa os testes unitários
- `npm run test:watch`: Executa os testes em modo watch
- `npm run test:coverage`: Gera relatório de cobertura de testes

## Docker

Este backend depende de um PostgreSQL — use o `docker-compose.yml` na raiz do projeto (sobe backend + banco juntos) em vez de rodar a imagem isolada:

```bash
docker-compose up --build
```

## Licença

MIT