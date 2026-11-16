import { COURSES, PARTNER_TYPES } from '../users/users.constants.ts'

const json = (schema: object) => ({ 'application/json': { schema } })
const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` })
const error = (description: string) => ({ description, content: json(ref('Error')) })

const session = {
  description: 'Sessão criada. O refresh token vai no cookie httpOnly `refreshToken` (path /api/auth).',
  headers: { 'Set-Cookie': { schema: { type: 'string' } } },
  content: json(ref('Session')),
}

export const authDocs = {
  tags: [{ name: 'Auth', description: 'Cadastro, login e sessão' }],
  schemas: {
    SignupStudent: {
      type: 'object',
      required: ['role', 'name', 'email', 'password', 'course'],
      properties: {
        role: { type: 'string', enum: ['STUDENT'] },
        name: { type: 'string' },
        email: { type: 'string', format: 'email' },
        password: { type: 'string', minLength: 8, maxLength: 128 },
        course: { type: 'string', enum: COURSES },
      },
    },
    SignupPartner: {
      type: 'object',
      required: ['role', 'name', 'email', 'password', 'organization', 'partnerType', 'termsAccepted'],
      properties: {
        role: { type: 'string', enum: ['PARTNER'] },
        name: { type: 'string' },
        email: { type: 'string', format: 'email' },
        password: { type: 'string', minLength: 8, maxLength: 128 },
        organization: { type: 'string' },
        partnerType: { type: 'string', enum: PARTNER_TYPES },
        phone: { type: 'string' },
        termsAccepted: { type: 'boolean', enum: [true] },
      },
    },
    Login: {
      type: 'object',
      required: ['email', 'password'],
      properties: { email: { type: 'string', format: 'email' }, password: { type: 'string' } },
    },
    Session: {
      type: 'object',
      properties: { accessToken: { type: 'string', description: 'JWT, 15 min. Use no Authorize. Dados do usuário: GET /api/users/me.' } },
    },
  },
  paths: {
    '/api/auth/signup': {
      post: {
        tags: ['Auth'],
        summary: 'Cria conta de aluno ou parceiro e já faz login',
        description:
          'Já devolve a sessão (accessToken + cookie de refresh) para o front não precisar chamar o login logo depois do cadastro. Se um dia houver confirmação de e-mail, o signup passa a devolver só 201 e o login fica separado.\n\nProfessores não se cadastram: a conta vem do seed.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { oneOf: [ref('SignupStudent'), ref('SignupPartner')], discriminator: { propertyName: 'role' } },
              examples: {
                aluno: {
                  value: { role: 'STUDENT', name: 'Ana Ribeiro', email: 'ana.ribeiro@alu.ufc.br', password: 'senha1234', course: 'Design Digital' },
                },
                parceiro: {
                  value: {
                    role: 'PARTNER',
                    name: 'Maria Souza',
                    email: 'maria@vidanova.org',
                    password: 'senha1234',
                    organization: 'Associação Vida Nova',
                    partnerType: 'ONG',
                    phone: '(85) 90000-0000',
                    termsAccepted: true,
                  },
                },
              },
            },
          },
        },
        responses: { 201: session, 400: error('Dados inválidos'), 409: error('E-mail já cadastrado') },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login',
        description: 'Após 5 falhas para o mesmo IP + e-mail, bloqueia por 15 min.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: ref('Login'),
              examples: { professora: { value: { email: 'carla@ufc.br', password: 'senha1234' } } },
            },
          },
        },
        responses: {
          200: session,
          401: error('E-mail ou senha incorretos'),
          429: { ...error('Muitas tentativas'), headers: { 'Retry-After': { schema: { type: 'integer' }, description: 'segundos' } } },
        },
      },
    },
    '/api/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Troca o refresh token (cookie) por uma sessão nova',
        description: 'Usa o cookie `refreshToken`. O token usado é invalidado (rotação).',
        responses: { 200: session, 401: { $ref: '#/components/responses/Unauthorized' } },
      },
    },
    '/api/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Encerra a sessão e apaga o cookie',
        responses: { 204: { description: 'Sessão encerrada' } },
      },
    },
  },
}
