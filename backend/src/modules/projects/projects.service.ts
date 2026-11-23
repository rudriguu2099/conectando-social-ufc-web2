import type { Prisma, ProjectStatus } from '@prisma/client'
import { HttpError } from '../../lib/http-error.ts'
import { prisma } from '../../lib/prisma.ts'
import type { Viewer } from './projects.policy.ts'
import * as policy from './projects.policy.ts'
import {
  type ApplicationInput,
  type DemandInput,
  TABS,
  type Tab,
  UUID_RE,
} from './projects.validation.ts'

type LoggedUser = NonNullable<Viewer>

const person = { select: { id: true, name: true } }

// lists

const cardSelect = {
  id: true,
  title: true,
  status: true,
  phase: true,
  semester: true,
  createdAt: true,
  updatedAt: true,
  partner: { select: { organization: true, partnerType: true } },
} satisfies Prisma.ProjectSelect

function toCard({ partner, ...p }: Prisma.ProjectGetPayload<{ select: typeof cardSelect }>) {
  return {
    ...p,
    // filled by the application, which is not public before it is approved
    semester: p.status === 'AWAITING_APPROVAL' ? null : p.semester,
    organization: partner.organization,
    partnerType: partner.partnerType,
  }
}

export async function list(tab: Tab) {
  const projects = await prisma.project.findMany({
    where: { status: { in: [...TABS[tab]] } },
    select: cardSelect,
    orderBy: { updatedAt: 'desc' },
  })
  return projects.map(toCard)
}

// the partner's own demands, in any status
export async function listMine(user: LoggedUser) {
  const projects = await prisma.project.findMany({
    where: { partnerId: user.id },
    select: {
      ...cardSelect,
      statusReason: true,
      professor: person,
      _count: { select: { members: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })
  return projects.map(({ professor, _count, statusReason, ...p }) => {
    const hasTeam = p.status !== 'AWAITING_APPROVAL'
    return {
      ...toCard(p),
      statusReason,
      professor: hasTeam ? professor : null,
      teamSize: hasTeam ? _count.members : 0,
    }
  })
}

// what waits for this professor: every demand in review + the applications that indicate them
export async function listPending(user: LoggedUser) {
  const [demands, applications] = await Promise.all([
    prisma.project.findMany({
      where: { status: 'IN_REVIEW' },
      select: cardSelect,
      orderBy: { createdAt: 'asc' },
    }),
    prisma.project.findMany({
      where: { status: 'AWAITING_APPROVAL', professorId: user.id },
      select: {
        ...cardSelect,
        discipline: true,
        appliedAt: true,
        applicant: person,
        _count: { select: { members: true } },
      },
      orderBy: { appliedAt: 'asc' },
    }),
  ])
  return {
    demands: demands.map(toCard),
    applications: applications.map(({ discipline, appliedAt, applicant, _count, ...p }) => ({
      ...toCard(p),
      discipline,
      semester: p.semester,
      applicant,
      appliedAt,
      teamSize: _count.members,
    })),
  }
}

// project page

const detailInclude = {
  partner: {
    select: { organization: true, partnerType: true, name: true, email: true, phone: true },
  },
  professor: person,
  applicant: person,
  members: { include: { user: person }, orderBy: { id: 'asc' } },
} satisfies Prisma.ProjectInclude

// hidden projects answer 404, so nobody finds out they exist
async function findVisible(id: string, viewer: Viewer) {
  const project = UUID_RE.test(id)
    ? await prisma.project.findUnique({ where: { id }, include: detailInclude })
    : null
  if (!project || !policy.canView(project, viewer))
    throw new HttpError(404, 'Projeto não encontrado.')
  return project
}

export async function getById(id: string, viewer: Viewer) {
  const p = await findVisible(id, viewer)
  const { partner } = p
  const contactVisible = policy.canSeeContact(p, viewer)
  const awaiting = p.status === 'AWAITING_APPROVAL'
  const team = p.members.map((m) => ({ ...m.user, teamRole: m.teamRole }))
  const assignment = { professor: p.professor, discipline: p.discipline, semester: p.semester }

  return {
    id: p.id,
    title: p.title,
    organization: partner.organization,
    partnerType: partner.partnerType,
    status: p.status,
    statusReason: p.statusReason,
    phase: p.phase,
    problem: p.problem,
    affected: p.affected,
    expectedOutcome: p.expectedOutcome,
    repoUrl: p.repoUrl,
    figmaUrl: p.figmaUrl,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    ...(awaiting
      ? { professor: null, discipline: null, semester: null, team: [] }
      : { ...assignment, team }),
    application: policy.canSeeApplication(p, viewer)
      ? { applicant: p.applicant, appliedAt: p.appliedAt, ...assignment, team }
      : null,
    // null = not for this viewer (RN09); the last two are for who may talk to the partner
    contact: contactVisible
      ? { name: partner.name, email: partner.email, phone: partner.phone }
      : null,
    availability: contactVisible ? p.availability : null,
    currentSituation: contactVisible ? p.currentSituation : null,
    permissions: policy.permissionsFor(p, viewer),
  }
}

// demand

export async function createDemand(data: DemandInput, user: LoggedUser) {
  const { id } = await prisma.project.create({ data: { ...data, partnerId: user.id } })
  return getById(id, user)
}

// The check and the write are separate, so the write repeats the status (and professor) it was checked against:
// of two simultaneous requests only one changes the project, the other gets 409.
type Db = Prisma.TransactionClient
async function transition(
  db: Db,
  action: policy.Action,
  project: { id: string; status: ProjectStatus; professorId: string | null },
  data: Prisma.ProjectUncheckedUpdateManyInput & { status: ProjectStatus },
) {
  const { id, status, professorId } = project
  const { count } = await db.project.updateMany({ where: { id, status, professorId }, data })
  if (!count) throw policy.conflict(action)
}

async function changeStatus(
  action: policy.Action,
  id: string,
  user: LoggedUser,
  data: Prisma.ProjectUncheckedUpdateManyInput & { status: ProjectStatus },
) {
  const project = await findVisible(id, user)
  policy.assertCan(action, project, user)
  await transition(prisma, action, project, data)
  return getById(id, user)
}

export const approveDemand = (id: string, user: LoggedUser) =>
  changeStatus('review', id, user, { status: 'AVAILABLE' })

export const rejectDemand = (id: string, reason: string | null, user: LoggedUser) =>
  changeStatus('review', id, user, { status: 'REJECTED', statusReason: reason })

export const cancelDemand = (id: string, reason: string | null, user: LoggedUser) =>
  changeStatus('cancel', id, user, { status: 'CANCELED', statusReason: reason })

// application

async function resolveTeam({ members }: ApplicationInput, user: LoggedUser) {
  const students = await prisma.user.findMany({
    where: { email: { in: members.map((m) => m.email) }, role: 'STUDENT' },
    select: { id: true, email: true },
  })
  const idByEmail = new Map(students.map((s) => [s.email, s.id]))
  const missing = members.filter((m) => !idByEmail.has(m.email)).map((m) => m.email)
  if (missing.length)
    throw new HttpError(400, `Não encontramos conta de aluno para: ${missing.join(', ')}.`)
  const team = members.map((m) => ({
    userId: idByEmail.get(m.email) as string,
    teamRole: m.teamRole,
  }))
  if (team.some((m) => m.userId === user.id))
    throw new HttpError(400, 'Você já faz parte da equipe: informe só os colegas.')
  return team
}

export async function apply(id: string, input: ApplicationInput, user: LoggedUser) {
  const project = await findVisible(id, user)
  policy.assertCan('apply', project, user)

  const teammates = await resolveTeam(input, user)
  const professor = await prisma.user.findFirst({
    where: { id: input.professorId, role: 'PROFESSOR' },
  })
  if (!professor) throw new HttpError(400, 'Escolha o professor responsável.')

  await prisma.$transaction(async (db) => {
    await transition(db, 'apply', project, {
      status: 'AWAITING_APPROVAL',
      professorId: professor.id,
      discipline: input.discipline,
      semester: input.semester,
      applicantId: user.id,
      appliedAt: new Date(),
    })
    await db.projectMember.createMany({
      data: [{ userId: user.id, teamRole: input.teamRole }, ...teammates].map((m) => ({
        ...m,
        projectId: id,
      })),
    })
  })
  return getById(id, user)
}

export const approveApplication = (id: string, user: LoggedUser) =>
  changeStatus('reviewApplication', id, user, { status: 'IN_PROGRESS', phase: 'REQUIREMENTS' })

// back to available, with no trace of the team
export async function rejectApplication(id: string, user: LoggedUser) {
  const project = await findVisible(id, user)
  policy.assertCan('reviewApplication', project, user)
  await prisma.$transaction(async (db) => {
    await transition(db, 'reviewApplication', project, {
      status: 'AVAILABLE',
      professorId: null,
      discipline: null,
      semester: null,
      applicantId: null,
      appliedAt: null,
    })
    await db.projectMember.deleteMany({ where: { projectId: id } })
  })
  return getById(id, user)
}
