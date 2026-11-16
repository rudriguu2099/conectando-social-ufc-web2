import { COURSES, PARTNER_TYPES } from './users.constants.ts'

export const usersDocs = {
  tags: [{ name: 'Users', description: 'Usuário logado' }],
  schemas: {
    User: {
      type: 'object',
      properties: {
        id: { type: 'integer', example: 1 },
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
          200: { description: 'Usuário', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
  },
}
