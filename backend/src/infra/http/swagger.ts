import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Task Management API - Everlabs',
    version: '1.0.0',
    description: 'API RESTful para Sistema de Gestão de Tarefas estilo SCRUM/Kanban',
    contact: {
      name: 'Everlabs',
      email: 'tecnico@everlabs.com.br'
    }
  },
  servers: [
    {
      url: 'http://localhost:3333/api',
      description: 'Servidor de Desenvolvimento'
    }
  ],
  tags: [
    { name: 'Users', description: 'Gerenciamento de usuários e autenticação' },
    { name: 'Tasks', description: 'Gerenciamento de tarefas' },
    { name: 'Comments', description: 'Comentários/ocorrências nas tarefas' },
    { name: 'Files', description: 'Upload e gerenciamento de arquivos' },
    { name: 'Tags', description: 'Etiquetas para categorização de tarefas' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'João Silva' },
          email: { type: 'string', format: 'email', example: 'joao@email.com' },
          role: { type: 'string', enum: ['ADMIN', 'USER'], example: 'USER' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      Task: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Implementar login' },
          description: { type: 'string', example: 'Criar tela de login com validação' },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
          priority: { type: 'integer', minimum: 0, maximum: 10, example: 5 },
          status: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'], example: 'TODO' },
          assigneeId: { type: 'integer', nullable: true, example: 1 },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      Comment: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          content: { type: 'string', example: 'Tarefa iniciada com sucesso' },
          taskId: { type: 'integer', example: 1 },
          userId: { type: 'integer', example: 1 },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      File: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'documento.pdf' },
          path: { type: 'string', example: '/uploads/123-documento.pdf' },
          taskId: { type: 'integer', example: 1 },
          userId: { type: 'integer', example: 1 },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      Tag: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'urgente' }
        }
      },
      Error: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'error' },
          message: { type: 'string', example: 'Error message' }
        }
      },
      Success: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'success' },
          data: { type: 'object' }
        }
      }
    }
  },
  paths: {
    '/users': {
      post: {
        tags: ['Users'],
        summary: 'Criar novo usuário',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', minLength: 3, example: 'João Silva' },
                  email: { type: 'string', format: 'email', example: 'joao@email.com' },
                  password: { type: 'string', minLength: 6, example: '123456' },
                  role: { type: 'string', enum: ['ADMIN', 'USER'], default: 'USER' }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Usuário criado com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: { $ref: '#/components/schemas/User' }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Email já cadastrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      },
      get: {
        tags: ['Users'],
        summary: 'Listar todos os usuários',
        security: [{ bearerAuth: [] }],
        description: 'Apenas administradores podem listar usuários',
        responses: {
          '200': {
            description: 'Lista de usuários',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/User' }
                    }
                  }
                }
              }
            }
          },
          '401': { description: 'Não autenticado' },
          '403': { description: 'Não autorizado (não é admin)' }
        }
      }
    },
    '/users/authenticate': {
      post: {
        tags: ['Users'],
        summary: 'Autenticar usuário (Login)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'joao@email.com' },
                  password: { type: 'string', example: '123456' }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Login realizado com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'object',
                      properties: {
                        user: { $ref: '#/components/schemas/User' },
                        token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
                      }
                    }
                  }
                }
              }
            }
          },
          '401': { description: 'Email ou senha incorretos' }
        }
      }
    },
    '/users/me': {
      get: {
        tags: ['Users'],
        summary: 'Obter perfil do usuário logado',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Dados do usuário',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: { $ref: '#/components/schemas/User' }
                  }
                }
              }
            }
          },
          '401': { description: 'Não autenticado' }
        }
      }
    },
    '/tasks': {
      get: {
        tags: ['Tasks'],
        summary: 'Listar tarefas',
        security: [{ bearerAuth: [] }],
        description: 'Admin vê todas as tarefas, usuário comum vê apenas as atribuídas a ele',
        responses: {
          '200': {
            description: 'Lista de tarefas',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Task' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Tasks'],
        summary: 'Criar nova tarefa',
        security: [{ bearerAuth: [] }],
        description: 'Apenas administradores podem criar tarefas',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'priority'],
                properties: {
                  name: { type: 'string', example: 'Implementar dashboard' },
                  description: { type: 'string', example: 'Criar dashboard com gráficos' },
                  startDate: { type: 'string', format: 'date-time' },
                  endDate: { type: 'string', format: 'date-time' },
                  priority: { type: 'integer', minimum: 0, maximum: 10, example: 7 },
                  assigneeId: { type: 'integer', example: 2 }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Tarefa criada',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: { $ref: '#/components/schemas/Task' }
                  }
                }
              }
            }
          },
          '403': { description: 'Não autorizado (não é admin)' }
        }
      }
    },
    '/tasks/{id}': {
      get: {
        tags: ['Tasks'],
        summary: 'Obter tarefa por ID',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' }
          }
        ],
        responses: {
          '200': {
            description: 'Dados da tarefa',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: { $ref: '#/components/schemas/Task' }
                  }
                }
              }
            }
          },
          '404': { description: 'Tarefa não encontrada' }
        }
      },
      put: {
        tags: ['Tasks'],
        summary: 'Atualizar tarefa',
        security: [{ bearerAuth: [] }],
        description: 'Apenas administradores podem editar todos os campos',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' }
          }
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  startDate: { type: 'string', format: 'date-time' },
                  endDate: { type: 'string', format: 'date-time' },
                  priority: { type: 'integer', minimum: 0, maximum: 10 },
                  status: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'] },
                  assigneeId: { type: 'integer' }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'Tarefa atualizada' },
          '403': { description: 'Não autorizado' },
          '404': { description: 'Tarefa não encontrada' }
        }
      },
      delete: {
        tags: ['Tasks'],
        summary: 'Excluir tarefa',
        security: [{ bearerAuth: [] }],
        description: 'Apenas administradores podem excluir tarefas',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' }
          }
        ],
        responses: {
          '200': { description: 'Tarefa excluída' },
          '403': { description: 'Não autorizado' },
          '404': { description: 'Tarefa não encontrada' }
        }
      }
    },
    '/tasks/{id}/status': {
      patch: {
        tags: ['Tasks'],
        summary: 'Atualizar status da tarefa',
        security: [{ bearerAuth: [] }],
        description: 'Usuários podem atualizar o status de suas tarefas atribuídas',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'] }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'Status atualizado' },
          '403': { description: 'Não autorizado' },
          '404': { description: 'Tarefa não encontrada' }
        }
      }
    },
    '/tasks/{taskId}/comments': {
      get: {
        tags: ['Comments'],
        summary: 'Listar comentários de uma tarefa',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'taskId',
            in: 'path',
            required: true,
            schema: { type: 'integer' }
          }
        ],
        responses: {
          '200': {
            description: 'Lista de comentários',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Comment' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Comments'],
        summary: 'Adicionar comentário/ocorrência',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'taskId',
            in: 'path',
            required: true,
            schema: { type: 'integer' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['content'],
                properties: {
                  content: { type: 'string', example: 'Iniciando análise do requisito' }
                }
              }
            }
          }
        },
        responses: {
          '201': { description: 'Comentário adicionado' },
          '403': { description: 'Não autorizado' },
          '404': { description: 'Tarefa não encontrada' }
        }
      }
    },
    '/comments/{id}': {
      delete: {
        tags: ['Comments'],
        summary: 'Excluir comentário',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' }
          }
        ],
        responses: {
          '200': { description: 'Comentário excluído' },
          '403': { description: 'Não autorizado' },
          '404': { description: 'Comentário não encontrado' }
        }
      }
    },
    '/files/tasks/{taskId}': {
      get: {
        tags: ['Files'],
        summary: 'Listar arquivos de uma tarefa',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'taskId',
            in: 'path',
            required: true,
            schema: { type: 'integer' }
          }
        ],
        responses: {
          '200': {
            description: 'Lista de arquivos',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/File' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Files'],
        summary: 'Upload de arquivo',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'taskId',
            in: 'path',
            required: true,
            schema: { type: 'integer' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  file: {
                    type: 'string',
                    format: 'binary'
                  }
                }
              }
            }
          }
        },
        responses: {
          '201': { description: 'Arquivo enviado' },
          '400': { description: 'Nenhum arquivo enviado' },
          '403': { description: 'Não autorizado' }
        }
      }
    },
    '/files/{id}': {
      delete: {
        tags: ['Files'],
        summary: 'Excluir arquivo',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' }
          }
        ],
        responses: {
          '200': { description: 'Arquivo excluído' },
          '403': { description: 'Não autorizado' },
          '404': { description: 'Arquivo não encontrado' }
        }
      }
    },
    '/files/{id}/download': {
      get: {
        tags: ['Files'],
        summary: 'Download de arquivo',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' }
          }
        ],
        responses: {
          '200': { description: 'Arquivo para download' },
          '404': { description: 'Arquivo não encontrado' }
        }
      }
    },
    '/tags': {
      get: {
        tags: ['Tags'],
        summary: 'Listar todas as tags',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Lista de tags',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Tag' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Tags'],
        summary: 'Criar nova tag',
        security: [{ bearerAuth: [] }],
        description: 'Apenas administradores podem criar tags',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string', example: 'urgente' }
                }
              }
            }
          }
        },
        responses: {
          '201': { description: 'Tag criada' },
          '400': { description: 'Tag já existe' }
        }
      }
    },
    '/tags/{id}': {
      delete: {
        tags: ['Tags'],
        summary: 'Excluir tag',
        security: [{ bearerAuth: [] }],
        description: 'Apenas administradores podem excluir tags',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' }
          }
        ],
        responses: {
          '200': { description: 'Tag excluída' },
          '404': { description: 'Tag não encontrada' }
        }
      }
    },
    '/tags/tasks/{taskId}/tags/{tagId}': {
      post: {
        tags: ['Tags'],
        summary: 'Adicionar tag a uma tarefa',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'taskId', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'tagId', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          '201': { description: 'Tag adicionada à tarefa' },
          '400': { description: 'Tag já adicionada' },
          '404': { description: 'Tarefa ou tag não encontrada' }
        }
      },
      delete: {
        tags: ['Tags'],
        summary: 'Remover tag de uma tarefa',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'taskId', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'tagId', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          '200': { description: 'Tag removida da tarefa' },
          '404': { description: 'Associação não encontrada' }
        }
      }
    },
    '/tags/tasks/{taskId}': {
      get: {
        tags: ['Tags'],
        summary: 'Listar tags de uma tarefa',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'taskId', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          '200': {
            description: 'Lista de tags da tarefa',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Tag' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};

export function setupSwagger(app: Express): void {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'API Docs - Task Management'
  }));
}
