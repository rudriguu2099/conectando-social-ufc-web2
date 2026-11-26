import { COURSES, PARTNER_TYPES } from './users.constants.ts'

export const usersDocs = {
  tags: [{ name: 'Users', description: 'Usuário logado e opções do formulário de candidatura' }],
  schemas: {
    User: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid', example: '019a8f2e-7c41-7b3e-9d2a-5f6e8c1b4a30' },
        name: { type: 'string', example: 'Ana Ribeiro' },
        email: { type: 'string', format: 'email', example: 'ana.ribeiro@alu.ufc.br' },
        role: { type: 'string', enum: ['STUDENT', 'PARTNER', 'PROFESSOR'] },
        course: { type: 'string', enum: COURSES, nullable: true },
        organization: { type: 'string', nullable: true },
        partnerType: { type: 'string', enum: PARTNER_TYPES, nullable: true },
        phone: { type: 'string', nullable: true },
        termsAcceptedAt: { type: 'string', format: 'date-time', nullable: true },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
  },
  paths: {
    '/api/users/me': {
      get: {
        tags: ['Users'],
        summary: 'Dados do usuário logado',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Usuário',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/api/users/professors': {
      get: {
        tags: ['Users'],
        summary: 'Professores para indicar na candidatura',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Professores em ordem alfabética',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', format: 'uuid' },
                      name: { type: 'string', example: 'Prof. Carla Mendes' },
                    },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/api/users/students': {
      get: {
        tags: ['Users'],
        summary: 'Busca um colega pelo e-mail exato (só aluno)',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'email',
            in: 'query',
            required: true,
            schema: { type: 'string', format: 'email' },
          },
        ],
        responses: {
          200: {
            description: 'Aluno encontrado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', format: 'uuid' },
                    name: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                  },
                },
              },
            },
          },
          400: {
            description: 'E-mail inválido',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: {
            description: 'Só aluno',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          404: {
            description: 'Nenhum aluno com este e-mail',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },
  },
}
