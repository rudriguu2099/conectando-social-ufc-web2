// Who can see and do what. The service enforces these rules and the API also returns them in `permissions`,
// so the front doesn't need its own copy.
import type { Project, Role } from '@prisma/client'
import { HttpError } from '../../lib/http-error.ts'

export type Viewer = { id: string; role: Role } | undefined
type ProjectWithTeam = Project & { members: { userId: string }[] }

const PUBLIC_STATUSES = ['AVAILABLE', 'AWAITING_APPROVAL', 'IN_PROGRESS', 'COMPLETED']

const isOwner = (p: Project, v: Viewer) => v?.id === p.partnerId
const isMember = (p: ProjectWithTeam, v: Viewer) => p.members.some((m) => m.userId === v?.id)
export const isResponsible = (p: Project, v: Viewer) =>
  p.status !== 'AWAITING_APPROVAL' && v?.role === 'PROFESSOR' && v.id === p.professorId

// demands in review, rejected or canceled are off the showcase: only the people involved see them
export const canView = (p: ProjectWithTeam, v: Viewer) =>
  PUBLIC_STATUSES.includes(p.status) || v?.role === 'PROFESSOR' || isOwner(p, v) || isMember(p, v)

export const canSeeContact = (p: Project, v: Viewer) =>
  v?.role === 'STUDENT' || v?.role === 'PROFESSOR' || isOwner(p, v)

export const canSeeAttachments = canSeeContact

// until it is approved, the proposed team is only between the team and the indicated professor
export const canSeeApplication = (p: ProjectWithTeam, v: Viewer) =>
  p.status === 'AWAITING_APPROVAL' && (v?.id === p.professorId || isMember(p, v))

// `allowed` is about the person (403), `status` is about the moment of the project (409)
const inProgress = () => ['IN_PROGRESS']

const ACTIONS = {
  review: {
    allowed: (_p: Project, v: Viewer) => v?.role === 'PROFESSOR',
    status: () => ['IN_REVIEW'],
    conflict: 'Esta demanda não está mais em análise.',
  },
  apply: {
    allowed: (_p: Project, v: Viewer) => v?.role === 'STUDENT',
    status: () => ['AVAILABLE'],
    conflict: 'Este projeto não está disponível para candidatura.',
  },
  reviewApplication: {
    allowed: (p: Project, v: Viewer) => v?.role === 'PROFESSOR' && v.id === p.professorId,
    status: () => ['AWAITING_APPROVAL'],
    conflict: 'Esta candidatura não está mais aguardando aprovação.',
  },
  cancel: {
    allowed: (p: Project, v: Viewer) => isOwner(p, v) || v?.role === 'PROFESSOR',
    status: (p: Project, v: Viewer) => {
      if (isOwner(p, v)) return ['IN_REVIEW', 'AVAILABLE']
      return isResponsible(p, v) ? ['AVAILABLE', 'IN_PROGRESS'] : ['AVAILABLE']
    },
    conflict: 'Este projeto não pode mais ser cancelado.',
  },
  // RN07: phase, Figma, attachments and team
  edit: {
    allowed: (p: ProjectWithTeam, v: Viewer) => isMember(p, v) || isResponsible(p, v),
    status: inProgress,
    conflict: 'Só um projeto em andamento pode ser alterado.',
  },
  editRepo: {
    allowed: isResponsible,
    status: inProgress,
    conflict: 'Só um projeto em andamento pode ser alterado.',
  },
  complete: {
    allowed: isResponsible,
    status: inProgress,
    conflict: 'Este projeto não está mais em andamento.',
  },
}
export type Action = keyof typeof ACTIONS

export const conflict = (action: Action) => new HttpError(409, ACTIONS[action].conflict)

export function assertCan(action: Action, p: ProjectWithTeam, v: Viewer) {
  const rule = ACTIONS[action]
  // without an application there is no indicated professor: the problem is the moment, not the person
  const ok = rule.allowed(p, v)
  if (!ok && !(action === 'reviewApplication' && !p.professorId))
    throw new HttpError(403, 'Você não tem permissão para isso.')
  if (!ok || !rule.status(p, v).includes(p.status)) throw conflict(action)
}

export function permissionsFor(p: ProjectWithTeam, v: Viewer) {
  const can = (action: Action) =>
    ACTIONS[action].allowed(p, v) && ACTIONS[action].status(p, v).includes(p.status)
  return {
    review: can('review'),
    apply: can('apply'),
    reviewApplication: can('reviewApplication'),
    cancel: can('cancel'),
    edit: can('edit'),
    editRepo: can('editRepo'),
    complete: can('complete'),
  }
}
