import { authDocs } from '../modules/auth/auth.docs.ts'
import { usersDocs } from '../modules/users/users.docs.ts'

const modules = [authDocs, usersDocs]

export const openApiSpec = {
  openapi: '3.0.3',
  info: { title: 'Conectando Social API', version: '0.1.0' },
  tags: modules.flatMap((m) => m.tags),
  paths: Object.assign({}, ...modules.map((m) => m.paths)),
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
    schemas: Object.assign(
      {
        Error: { type: 'object', properties: { error: { type: 'string', example: 'Mensagem para o usuário.' } } },
      },
      ...modules.map((m) => m.schemas),
    ),
    responses: {
      Unauthorized: {
        description: 'Sem login ou sessão expirada',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
      },
    },
  },
}
