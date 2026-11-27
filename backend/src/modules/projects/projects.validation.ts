import { invalid, optionalText, parseEmail, requiredText, text } from '../../lib/validation.ts'

type Body = Record<string, unknown>

const TITLE_MAX = 120
const LONG_MAX = 2000
const SHORT_MAX = 200
const TEAM_ROLE_MAX = 60
const REASON_MAX = 500
const MAX_TEAMMATES = 19

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const SEMESTER_RE = /^20\d{2}\.[12]$/

export const TABS = {
  available: ['AVAILABLE', 'AWAITING_APPROVAL'],
  'in-progress': ['IN_PROGRESS'],
  completed: ['COMPLETED'],
} as const
export type Tab = keyof typeof TABS

export function parseTab(v: unknown): Tab {
  if (v === undefined) return 'available'
  if (typeof v !== 'string' || !Object.hasOwn(TABS, v))
    throw invalid('Aba inválida: use available, in-progress ou completed.')
  return v as Tab
}

export function parseDemand(b: Body) {
  return {
    title: requiredText(b.title, 'Título da demanda', TITLE_MAX),
    problem: requiredText(b.problem, 'Qual é o problema?', LONG_MAX),
    affected: requiredText(b.affected, 'Quem é afetado por ele?', LONG_MAX),
    currentSituation: optionalText(b.currentSituation, 'Como vocês lidam com isso hoje?', LONG_MAX),
    expectedOutcome: requiredText(b.expectedOutcome, 'O que seria um bom resultado?', LONG_MAX),
    availability: optionalText(b.availability, 'Disponibilidade para reuniões', SHORT_MAX),
  }
}
export type DemandInput = ReturnType<typeof parseDemand>

export const parseReason = (b: Body) => optionalText(b.reason, 'Motivo', REASON_MAX)

export function parseApplication(b: Body) {
  const teamRole = requiredText(b.teamRole, 'Sua função', TEAM_ROLE_MAX)
  const rawMembers = b.members ?? []
  if (!Array.isArray(rawMembers)) throw invalid('Informe a lista de membros.')
  if (rawMembers.length > MAX_TEAMMATES)
    throw invalid(`A equipe pode ter até ${MAX_TEAMMATES + 1} pessoas.`)
  const members = rawMembers.map((m: Body | null) => {
    const email = parseEmail(m?.email)
    return { email, teamRole: requiredText(m?.teamRole, `Função de ${email}`, TEAM_ROLE_MAX) }
  })
  if (new Set(members.map((m) => m.email)).size !== members.length)
    throw invalid('Há um e-mail repetido na equipe.')

  const professorId = text(b.professorId)
  if (!UUID_RE.test(professorId)) throw invalid('Escolha o professor responsável.')
  const discipline = requiredText(b.discipline, 'Disciplina', SHORT_MAX)
  const semester = text(b.semester)
  if (!SEMESTER_RE.test(semester)) throw invalid('Informe o semestre no formato 2026.2.')
  return { teamRole, members, professorId, discipline, semester }
}
export type ApplicationInput = ReturnType<typeof parseApplication>
