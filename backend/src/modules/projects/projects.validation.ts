import type { AttachmentCategory, Phase } from '@prisma/client'
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

function parseMembers(raw: unknown, max: number) {
  if (!Array.isArray(raw)) throw invalid('Informe a lista de membros.')
  if (raw.length > max) throw invalid(`A equipe pode ter até ${MAX_TEAMMATES + 1} pessoas.`)
  const members = raw.map((m: Body | null) => {
    const email = parseEmail(m?.email)
    return { email, teamRole: requiredText(m?.teamRole, `Função de ${email}`, TEAM_ROLE_MAX) }
  })
  if (new Set(members.map((m) => m.email)).size !== members.length)
    throw invalid('Há um e-mail repetido na equipe.')
  return members
}
export type MemberInput = ReturnType<typeof parseMembers>[number]

export function parseApplication(b: Body) {
  const teamRole = requiredText(b.teamRole, 'Sua função', TEAM_ROLE_MAX)
  const members = parseMembers(b.members ?? [], MAX_TEAMMATES)

  const professorId = text(b.professorId)
  if (!UUID_RE.test(professorId)) throw invalid('Escolha o professor responsável.')
  const discipline = requiredText(b.discipline, 'Disciplina', SHORT_MAX)
  const semester = text(b.semester)
  if (!SEMESTER_RE.test(semester)) throw invalid('Informe o semestre no formato 2026.2.')
  return { teamRole, members, professorId, discipline, semester }
}
export type ApplicationInput = ReturnType<typeof parseApplication>

// flow 6

export function parseTeam(b: Body) {
  const members = parseMembers(b.members, MAX_TEAMMATES + 1)
  if (!members.length) throw invalid('A equipe precisa de pelo menos um membro.')
  return members
}

const PHASES = ['REQUIREMENTS', 'DESIGN', 'DEVELOPMENT', 'VALIDATION'] as const

// RNF08: https only, on the right site
function parseUrl(v: unknown, host: string) {
  const value = text(v)
  let url: URL | undefined
  try {
    url = new URL(value)
  } catch {}
  const hostOk = url?.hostname === host || url?.hostname === `www.${host}`
  if (url?.protocol !== 'https:' || !hostOk || value.length > SHORT_MAX)
    throw invalid(`O link precisa ser do ${host}.`)
  return url.href
}

// only what was sent changes; links can be replaced but not cleared
export function parseProjectUpdate(b: Body) {
  const data: { phase?: Phase; figmaUrl?: string; repoUrl?: string } = {}
  if (b.phase !== undefined) {
    if (!PHASES.includes(b.phase as Phase)) throw invalid('Fase inválida.')
    data.phase = b.phase as Phase
  }
  if (b.figmaUrl !== undefined) data.figmaUrl = parseUrl(b.figmaUrl, 'figma.com')
  if (b.repoUrl !== undefined) data.repoUrl = parseUrl(b.repoUrl, 'github.com')
  if (!Object.keys(data).length) throw invalid('Nada para alterar.')
  return data
}
export type ProjectUpdate = ReturnType<typeof parseProjectUpdate>

// RNF07
export const MAX_ATTACHMENT_SIZE = 20 * 1024 * 1024
const MIME_TYPES: Record<string, string> = {
  pdf: 'application/pdf',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  zip: 'application/zip',
}
const CATEGORIES = ['REQUIREMENTS', 'DESIGN', 'CODE', 'REPORT', 'OTHER'] as const

export function parseAttachment(query: Body, body: unknown) {
  const fileName = requiredText(query.fileName, 'Nome do arquivo', SHORT_MAX)
  const extension = fileName.split('.').pop()?.toLowerCase() ?? ''
  if (!Object.hasOwn(MIME_TYPES, extension) || !fileName.includes('.'))
    throw invalid('Formato não aceito: use PDF, PNG, JPG, DOCX, XLSX ou ZIP.')
  if (!CATEGORIES.includes(query.category as AttachmentCategory))
    throw invalid('Escolha a categoria.')
  if (!Buffer.isBuffer(body) || !body.length) throw invalid('Envie o arquivo.')
  return {
    fileName,
    mimeType: MIME_TYPES[extension],
    category: query.category as AttachmentCategory,
    content: body,
  }
}
export type AttachmentInput = ReturnType<typeof parseAttachment>
