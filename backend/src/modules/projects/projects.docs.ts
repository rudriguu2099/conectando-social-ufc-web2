const json = (schema: object) => ({ 'application/json': { schema } })
const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` })
const error = (description: string) => ({ description, content: json(ref('Error')) })
const ok = (description: string, schema: object) => ({ description, content: json(schema) })
const list = (name: string) => ({ type: 'array', items: ref(name) })

const unauthorized = { $ref: '#/components/responses/Unauthorized' }
const security = [{ bearerAuth: [] }]
const idParam = {
  name: 'id',
  in: 'path',
  required: true,
  schema: { type: 'string', format: 'uuid' },
}
const project = ok('Projeto atualizado', ref('Project'))
const reasonBody = {
  content: json({
    type: 'object',
    properties: {
      reason: {
        type: 'string',
        maxLength: 500,
        example: 'Escopo grande demais para um semestre',
      },
    },
  }),
}

const id = { type: 'string', format: 'uuid' }
const string = { type: 'string' }
const nullable = { type: 'string', nullable: true }
const date = { type: 'string', format: 'date-time' }
const person = { type: 'object', nullable: true, properties: { id, name: string } }
const team = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      id,
      name: string,
      email: { ...string, description: 'Só para quem pode editar a equipe' },
      teamRole: string,
    },
  },
}
const boolean = { type: 'boolean' }
const notFound = error('Projeto não encontrado')
const notInProgress = error('O projeto não está em andamento')
const attachmentParam = { ...idParam, name: 'attachmentId' }
const status = {
  type: 'string',
  enum: [
    'IN_REVIEW',
    'REJECTED',
    'AVAILABLE',
    'AWAITING_APPROVAL',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELED',
  ],
}
const phase = {
  type: 'string',
  nullable: true,
  enum: ['REQUIREMENTS', 'DESIGN', 'DEVELOPMENT', 'VALIDATION', null],
}
const card = {
  id,
  title: string,
  organization: string,
  partnerType: string,
  status,
  phase,
  semester: nullable,
  createdAt: date,
  updatedAt: date,
}

export const projectsDocs = {
  tags: [
    {
      name: 'Projects',
      description: 'Vitrine, demandas, candidaturas, andamento e conclusão (fluxos 3 a 6)',
    },
  ],
  schemas: {
    ProjectCard: { type: 'object', properties: card },
    MyDemand: {
      type: 'object',
      properties: {
        ...card,
        statusReason: nullable,
        professor: person,
        teamSize: { type: 'integer' },
      },
    },
    MyProject: {
      type: 'object',
      description:
        'Aluno: projetos em que está na equipe. Professor: projetos de que é responsável',
      properties: {
        ...card,
        statusReason: nullable,
        appliedAt: date,
        professor: person,
        myRole: { ...nullable, description: 'Função do aluno; null para professor' },
      },
    },
    Attachment: {
      type: 'object',
      properties: {
        id,
        fileName: string,
        mimeType: string,
        size: { type: 'integer', description: 'Bytes' },
        category: { type: 'string', enum: ['REQUIREMENTS', 'DESIGN', 'CODE', 'REPORT', 'OTHER'] },
        createdAt: date,
        uploadedBy: person,
        canDelete: boolean,
      },
    },
    PendingApplication: {
      type: 'object',
      properties: {
        ...card,
        discipline: string,
        applicant: person,
        appliedAt: date,
        teamSize: { type: 'integer' },
      },
    },
    Project: {
      type: 'object',
      properties: {
        ...card,
        statusReason: nullable,
        problem: string,
        affected: string,
        expectedOutcome: string,
        currentSituation: { ...nullable, description: 'Só para quem vê o contato' },
        availability: { ...nullable, description: 'Só para quem vê o contato' },
        repoUrl: nullable,
        figmaUrl: nullable,
        professor: { ...person, description: 'Responsável; null até a candidatura ser aprovada' },
        discipline: nullable,
        team,
        contact: {
          type: 'object',
          nullable: true,
          description: 'Só para alunos, professores e o parceiro dono; null para os demais',
          properties: { name: string, email: string, phone: nullable },
        },
        application: {
          type: 'object',
          nullable: true,
          description: 'Candidatura pendente; só para a equipe e o professor indicado',
          properties: {
            applicant: person,
            appliedAt: date,
            professor: person,
            discipline: string,
            semester: string,
            team,
          },
        },
        attachments: {
          type: 'array',
          nullable: true,
          description: 'Só para alunos, professores e o parceiro dono; null para os demais',
          items: ref('Attachment'),
        },
        permissions: {
          type: 'object',
          description:
            'O que o usuário atual pode fazer agora: use para mostrar ou esconder os botões',
          properties: {
            review: boolean,
            apply: boolean,
            reviewApplication: boolean,
            cancel: boolean,
            edit: { ...boolean, description: 'Fase, Figma, anexos e equipe' },
            editRepo: boolean,
            complete: {
              ...boolean,
              description: 'Também exige repoUrl e figmaUrl preenchidos',
            },
          },
        },
      },
    },
    Demand: {
      type: 'object',
      required: ['title', 'problem', 'affected', 'expectedOutcome'],
      properties: {
        title: { type: 'string', maxLength: 120, example: 'Cadastro de voluntários' },
        problem: { type: 'string', maxLength: 2000, example: 'A lista de inscritos se perde.' },
        affected: { type: 'string', maxLength: 2000, example: 'Cerca de 40 voluntários.' },
        currentSituation: { type: 'string', maxLength: 2000, example: 'Grupo de WhatsApp.' },
        expectedOutcome: { type: 'string', maxLength: 2000, example: 'Um cadastro com os dias.' },
        availability: { type: 'string', maxLength: 200, example: 'Segundas pela manhã' },
      },
    },
    Application: {
      type: 'object',
      required: ['teamRole', 'professorId', 'discipline', 'semester'],
      properties: {
        teamRole: {
          type: 'string',
          maxLength: 60,
          example: 'PO',
          description: 'Função de quem envia',
        },
        members: {
          type: 'array',
          maxItems: 19,
          description: 'Só os colegas; quem envia entra na equipe automaticamente',
          items: {
            type: 'object',
            required: ['email', 'teamRole'],
            properties: {
              email: { type: 'string', format: 'email', example: 'bruno.costa@alu.ufc.br' },
              teamRole: { type: 'string', maxLength: 60, example: 'Front-end' },
            },
          },
        },
        professorId: { ...id, description: 'De GET /api/users/professors' },
        discipline: { type: 'string', maxLength: 200, example: 'Projeto Integrado I' },
        semester: { type: 'string', pattern: '^20\\d{2}\\.[12]$', example: '2026.2' },
      },
    },
  },
  paths: {
    '/api/projects': {
      get: {
        tags: ['Projects'],
        summary: 'Vitrine (pública)',
        description:
          'Uma aba por vez, do mais recente para o mais antigo. `available` inclui Aguardando aprovação.',
        parameters: [
          {
            name: 'tab',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['available', 'in-progress', 'completed'],
              default: 'available',
            },
          },
        ],
        responses: { 200: ok('Projetos da aba', list('ProjectCard')), 400: error('Aba inválida') },
      },
      post: {
        tags: ['Projects'],
        summary: 'Envia uma demanda (parceiro)',
        description: 'A demanda entra Em análise e não pode ser editada depois.',
        security,
        requestBody: { required: true, content: json(ref('Demand')) },
        responses: {
          201: ok('Demanda criada', ref('Project')),
          400: error('Dados inválidos'),
          401: unauthorized,
          403: error('Só parceiro'),
        },
      },
    },
    '/api/projects/mine': {
      get: {
        tags: ['Projects'],
        summary: 'Minhas demandas (parceiro) ou Meus projetos (aluno e professor)',
        security,
        responses: {
          200: ok('Parceiro recebe MyDemand[]; aluno e professor, MyProject[]', {
            oneOf: [list('MyDemand'), list('MyProject')],
          }),
          401: unauthorized,
        },
      },
    },
    '/api/projects/pending': {
      get: {
        tags: ['Projects'],
        summary: 'Pendências (professor)',
        description:
          'Todas as demandas Em análise e as candidaturas em que o professor foi indicado, das mais antigas para as mais novas.',
        security,
        responses: {
          200: ok('Pendências', {
            type: 'object',
            properties: { demands: list('ProjectCard'), applications: list('PendingApplication') },
          }),
          401: unauthorized,
          403: error('Só professor'),
        },
      },
    },
    '/api/projects/{id}': {
      get: {
        tags: ['Projects'],
        summary: 'Página do projeto (login opcional)',
        description:
          'Sem login mostra a versão do visitante. Demandas Em análise, Rejeitadas e Canceladas só aparecem para professores, o parceiro dono e a equipe; para os demais, 404.',
        security: [{}, ...security],
        parameters: [idParam],
        responses: {
          200: ok('Projeto', ref('Project')),
          401: error('Token enviado, mas vencido ou inválido'),
          404: error('Projeto não encontrado'),
        },
      },
      patch: {
        tags: ['Projects'],
        summary: 'Muda fase e links (equipe e professor responsável)',
        description:
          'Só muda o que for enviado. `repoUrl` é só do professor responsável. Links podem ser trocados, não apagados.',
        security,
        parameters: [idParam],
        requestBody: {
          required: true,
          content: json({
            type: 'object',
            properties: {
              phase: { ...phase, nullable: false, enum: phase.enum.slice(0, 4) },
              figmaUrl: { type: 'string', example: 'https://www.figma.com/design/abc/estoque' },
              repoUrl: { type: 'string', example: 'https://github.com/carla/estoque' },
            },
          }),
        },
        responses: {
          200: project,
          400: error('Fase inválida, link fora do figma.com/github.com ou nada para alterar'),
          401: unauthorized,
          403: error('Fora da equipe, ou repositório sem ser o professor responsável'),
          404: notFound,
          409: notInProgress,
        },
      },
    },
    '/api/projects/{id}/team': {
      put: {
        tags: ['Projects'],
        summary: 'Substitui a equipe inteira (equipe e professor responsável)',
        security,
        parameters: [idParam],
        requestBody: {
          required: true,
          content: json({
            type: 'object',
            properties: {
              members: {
                type: 'array',
                minItems: 1,
                maxItems: 20,
                items: {
                  type: 'object',
                  properties: {
                    email: { type: 'string', format: 'email' },
                    teamRole: { type: 'string', maxLength: 60 },
                  },
                },
              },
            },
          }),
        },
        responses: {
          200: project,
          400: error('Equipe vazia, e-mail repetido ou sem conta de aluno'),
          401: unauthorized,
          403: error('Fora da equipe'),
          404: notFound,
          409: notInProgress,
        },
      },
    },
    '/api/projects/{id}/complete': {
      post: {
        tags: ['Projects'],
        summary: 'Conclui o projeto (professor responsável)',
        security,
        parameters: [idParam],
        responses: {
          200: project,
          401: unauthorized,
          403: error('Só o professor responsável'),
          404: notFound,
          409: error('Não está em andamento, ou falta o link do repositório ou do Figma'),
        },
      },
    },
    '/api/projects/{id}/attachments': {
      post: {
        tags: ['Projects'],
        summary: 'Envia um anexo (equipe e professor responsável)',
        description:
          'O arquivo vai cru no corpo (`fetch(url, { method: "POST", body: file })`). PDF, PNG, JPG, DOCX, XLSX ou ZIP, até 20 MB.',
        security,
        parameters: [
          idParam,
          { name: 'fileName', in: 'query', required: true, schema: { type: 'string' } },
          {
            name: 'category',
            in: 'query',
            required: true,
            schema: { type: 'string', enum: ['REQUIREMENTS', 'DESIGN', 'CODE', 'REPORT', 'OTHER'] },
          },
        ],
        requestBody: {
          required: true,
          content: { 'application/octet-stream': { schema: { type: 'string', format: 'binary' } } },
        },
        responses: {
          201: ok('Projeto com o anexo', ref('Project')),
          400: error('Formato não aceito, sem categoria ou arquivo vazio'),
          401: unauthorized,
          403: error('Fora da equipe'),
          404: notFound,
          409: notInProgress,
          413: error('Arquivo maior que 20 MB'),
        },
      },
    },
    '/api/projects/{id}/attachments/{attachmentId}': {
      get: {
        tags: ['Projects'],
        summary: 'Baixa um anexo (alunos, professores e o parceiro dono)',
        description: 'Exige o token: no front, baixe com fetch e abra o blob.',
        security,
        parameters: [idParam, attachmentParam],
        responses: {
          200: {
            description: 'O arquivo',
            content: {
              'application/octet-stream': { schema: { type: 'string', format: 'binary' } },
            },
          },
          401: unauthorized,
          404: error('Projeto ou anexo não encontrado'),
        },
      },
      delete: {
        tags: ['Projects'],
        summary: 'Remove um anexo (quem enviou ou o professor responsável)',
        security,
        parameters: [idParam, attachmentParam],
        responses: {
          200: project,
          401: unauthorized,
          403: error('Sem permissão'),
          404: error('Projeto ou anexo não encontrado'),
          409: notInProgress,
        },
      },
    },
    '/api/projects/{id}/approve': {
      post: {
        tags: ['Projects'],
        summary: 'Aprova a demanda: vai para Disponível (professor)',
        security,
        parameters: [idParam],
        responses: {
          200: project,
          401: unauthorized,
          403: error('Só professor'),
          404: error('Projeto não encontrado'),
          409: error('A demanda não está mais em análise'),
        },
      },
    },
    '/api/projects/{id}/reject': {
      post: {
        tags: ['Projects'],
        summary: 'Rejeita a demanda, com motivo opcional (professor)',
        security,
        parameters: [idParam],
        requestBody: reasonBody,
        responses: {
          200: project,
          400: error('Motivo longo demais'),
          401: unauthorized,
          403: error('Só professor'),
          404: error('Projeto não encontrado'),
          409: error('A demanda não está mais em análise'),
        },
      },
    },
    '/api/projects/{id}/cancel': {
      post: {
        tags: ['Projects'],
        summary: 'Cancela uma demanda ou um projeto em andamento',
        description:
          'Parceiro dono: Em análise ou Disponível. Qualquer professor: Disponível. Professor responsável: também Em andamento.',
        security,
        parameters: [idParam],
        requestBody: reasonBody,
        responses: {
          200: project,
          400: error('Motivo longo demais'),
          401: unauthorized,
          403: error('Sem permissão'),
          404: error('Projeto não encontrado'),
          409: error('A demanda não pode mais ser cancelada'),
        },
      },
    },
    '/api/projects/{id}/application': {
      post: {
        tags: ['Projects'],
        summary: 'Candidata uma equipe (aluno)',
        description: 'O projeto vai para Aguardando aprovação.',
        security,
        parameters: [idParam],
        requestBody: { required: true, content: json(ref('Application')) },
        responses: {
          201: ok('Candidatura enviada', ref('Project')),
          400: error('Dados inválidos, ou colega sem conta de aluno'),
          401: unauthorized,
          403: error('Só aluno'),
          404: error('Projeto não encontrado'),
          409: error('O projeto não está disponível'),
        },
      },
    },
    '/api/projects/{id}/application/approve': {
      post: {
        tags: ['Projects'],
        summary: 'Aprova a equipe: Em andamento, fase Requisitos (professor indicado)',
        security,
        parameters: [idParam],
        responses: {
          200: project,
          401: unauthorized,
          403: error('Só o professor indicado'),
          404: error('Projeto não encontrado'),
          409: error('A candidatura não está mais pendente'),
        },
      },
    },
    '/api/projects/{id}/application/reject': {
      post: {
        tags: ['Projects'],
        summary:
          'Recusa a equipe: ela é removida e o projeto volta a Disponível (professor indicado)',
        security,
        parameters: [idParam],
        responses: {
          200: project,
          401: unauthorized,
          403: error('Só o professor indicado'),
          404: error('Projeto não encontrado'),
          409: error('A candidatura não está mais pendente'),
        },
      },
    },
  },
}
