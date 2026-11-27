// Needs the database: npm test (inside the backend container, or with DATABASE_URL + JWT_SECRET set)
import assert from 'node:assert/strict'
import { mkdtemp, readdir, rm } from 'node:fs/promises'
import type { AddressInfo } from 'node:net'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { after, before, test } from 'node:test'
import type { Role } from '@prisma/client'
import { app } from '../../index.ts'
import { prisma } from '../../lib/prisma.ts'
import { signAccessToken } from '../auth/tokens.ts'

process.env.UPLOAD_DIR = await mkdtemp(path.join(tmpdir(), 'uploads-'))
const server = app.listen(0)
const base = `http://localhost:${(server.address() as AddressInfo).port}/api`
const run = Date.now()

type TestUser = { id: string; email: string; token: string }
const users: Record<string, TestUser> = {}

async function createUser(key: string, role: Role) {
  const email = `${key}.${run}@teste.com`
  const user = await prisma.user.create({
    data: {
      name: `Teste ${key}`,
      email,
      role,
      passwordHash: 'x',
      ...(role === 'PARTNER' && {
        organization: 'Vida Nova',
        partnerType: 'ONG',
        phone: '(85) 90000-0000',
      }),
    },
  })
  users[key] = { id: user.id, email, token: await signAccessToken(user) }
}

before(async () => {
  for (const key of ['partner', 'otherPartner']) await createUser(key, 'PARTNER')
  for (const key of ['ana', 'bruno', 'outsider']) await createUser(key, 'STUDENT')
  for (const key of ['carla', 'daniel']) await createUser(key, 'PROFESSOR')
})

after(async () => {
  const ids = Object.values(users).map((u) => u.id)
  await prisma.project.deleteMany({ where: { partnerId: { in: ids } } })
  await prisma.user.deleteMany({ where: { id: { in: ids } } })
  await prisma.$disconnect()
  await rm(process.env.UPLOAD_DIR as string, { recursive: true, force: true })
  server.close()
})

async function call(method: string, path: string, as?: string, body?: object) {
  const r = await fetch(base + path, {
    method,
    headers: {
      ...(body && { 'content-type': 'application/json' }),
      ...(as && { authorization: `Bearer ${users[as].token}` }),
    },
    body: body && JSON.stringify(body),
  })
  return { status: r.status, body: await r.json() }
}
const get = (path: string, as?: string) => call('GET', path, as)
const post = (path: string, as?: string, body?: object) => call('POST', path, as, body)
const patch = (path: string, as?: string, body?: object) => call('PATCH', path, as, body)
const put = (path: string, as?: string, body?: object) => call('PUT', path, as, body)
const del = (path: string, as?: string) => call('DELETE', path, as)

async function upload(id: string, as: string | undefined, fileName: string, content = 'conteúdo') {
  const query = new URLSearchParams({ fileName, category: 'REQUIREMENTS' })
  const r = await fetch(`${base}/projects/${id}/attachments?${query}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/octet-stream',
      ...(as && { authorization: `Bearer ${users[as].token}` }),
    },
    body: content,
  })
  return { status: r.status, body: await r.json() }
}

const demand = {
  title: 'Cadastro de voluntários',
  problem: 'A lista se perde.',
  affected: '40 voluntários.',
  expectedOutcome: 'Um cadastro.',
  availability: 'Segundas',
}

async function newDemand() {
  const r = await post('/projects', 'partner', demand)
  assert.equal(r.status, 201)
  return r.body.id as string
}
async function newAvailable() {
  const id = await newDemand()
  assert.equal((await post(`/projects/${id}/approve`, 'carla')).status, 200)
  return id
}
const application = (over: object = {}) => ({
  teamRole: 'PO',
  members: [{ email: users.bruno.email, teamRole: 'Front-end' }],
  professorId: users.carla.id,
  discipline: 'Projeto Integrado I',
  semester: '2026.2',
  ...over,
})
async function newAwaiting() {
  const id = await newAvailable()
  assert.equal((await post(`/projects/${id}/application`, 'ana', application())).status, 201)
  return id
}
const inTab = async (tab: string, id: string) =>
  (await get(`/projects?tab=${tab}`)).body.some((p: { id: string }) => p.id === id)

test('demand: only partners send, required fields, starts in review and off the showcase', async () => {
  assert.equal((await post('/projects', undefined, demand)).status, 401)
  assert.equal((await post('/projects', 'ana', demand)).status, 403)
  assert.equal((await post('/projects', 'carla', demand)).status, 403)
  for (const field of ['title', 'problem', 'affected', 'expectedOutcome'])
    assert.equal(
      (await post('/projects', 'partner', { ...demand, [field]: '  ' })).status,
      400,
      field,
    )
  assert.equal(
    (await post('/projects', 'partner', { ...demand, title: 'a'.repeat(121) })).status,
    400,
  )
  assert.equal((await post('/projects', 'partner')).status, 400, 'no body')

  const forged = await post('/projects', 'partner', {
    ...demand,
    status: 'COMPLETED',
    partnerId: users.otherPartner.id,
  })
  assert.equal(forged.body.status, 'IN_REVIEW')
  assert.equal(forged.body.contact.email, users.partner.email)

  const id = forged.body.id
  assert.equal(await inTab('available', id), false)
  for (const as of [undefined, 'ana', 'otherPartner'])
    assert.equal((await get(`/projects/${id}`, as)).status, 404, `hidden from ${as}`)
  for (const as of ['partner', 'carla'])
    assert.equal((await get(`/projects/${id}`, as)).status, 200)
})

test('demand review: pending list, approve, reject with reason, only once', async () => {
  const id = await newDemand()
  assert.equal((await get('/projects/pending', 'ana')).status, 403)
  const pending = (await get('/projects/pending', 'daniel')).body
  assert.ok(pending.demands.some((p: { id: string }) => p.id === id))

  // visible to the owner, so the role is what blocks; hidden from the student
  assert.equal((await post(`/projects/${id}/approve`, 'partner')).status, 403)
  assert.equal((await post(`/projects/${id}/approve`, 'ana')).status, 403)

  const approved = await post(`/projects/${id}/approve`, 'carla')
  assert.equal(approved.body.status, 'AVAILABLE')
  assert.equal(await inTab('available', id), true)
  assert.equal((await post(`/projects/${id}/approve`, 'carla')).status, 409)
  assert.equal((await post(`/projects/${id}/reject`, 'carla')).status, 409)

  const rejectedId = await newDemand()
  const rejected = await post(`/projects/${rejectedId}/reject`, 'daniel', {
    reason: 'Escopo grande',
  })
  assert.equal(rejected.body.status, 'REJECTED')
  assert.equal((await get(`/projects/${rejectedId}`)).status, 404)

  const mine = (await get('/projects/mine', 'partner')).body
  const row = mine.find((p: { id: string }) => p.id === rejectedId)
  assert.equal(row.statusReason, 'Escopo grande')
  assert.deepEqual((await get('/projects/mine', 'otherPartner')).body, [])
})

test('cancel: owner in review or available, professor only available, nobody else', async () => {
  const inReview = await newDemand()
  assert.equal((await post(`/projects/${inReview}/cancel`, 'carla')).status, 409)
  assert.equal((await post(`/projects/${inReview}/cancel`, 'otherPartner')).status, 404)
  assert.equal((await post(`/projects/${inReview}/cancel`, 'partner')).body.status, 'CANCELED')
  assert.equal((await post(`/projects/${inReview}/approve`, 'carla')).status, 409)

  const available = await newAvailable()
  assert.equal((await post(`/projects/${available}/cancel`, 'otherPartner')).status, 403)
  assert.equal((await post(`/projects/${available}/cancel`, 'ana')).status, 403)
  const canceled = await post(`/projects/${available}/cancel`, 'daniel', {
    reason: 'Perdeu a validade',
  })
  assert.equal(canceled.body.statusReason, 'Perdeu a validade')

  const awaiting = await newAwaiting()
  assert.equal((await post(`/projects/${awaiting}/cancel`, 'partner')).status, 409)
  assert.equal((await post(`/projects/${awaiting}/cancel`, 'carla')).status, 409)
})

test('contact: students, professors and the owner; never visitors or other partners', async () => {
  const id = await newAvailable()
  for (const as of [undefined, 'otherPartner']) {
    const r = await get(`/projects/${id}`, as)
    assert.equal(r.status, 200)
    assert.equal(r.body.contact, null)
    assert.equal(r.body.availability, null)
    assert.ok(!JSON.stringify(r.body).includes(users.partner.email))
  }
  for (const as of ['partner', 'ana', 'carla'])
    assert.equal((await get(`/projects/${id}`, as)).body.contact.email, users.partner.email)
  assert.ok(!JSON.stringify((await get('/projects')).body).includes(users.partner.email))
})

test('showcase: invalid tab, unknown and malformed ids, bad token', async () => {
  assert.equal((await get('/projects?tab=toString')).status, 400)
  assert.equal((await get('/projects?tab=available&tab=completed')).status, 400)
  assert.equal((await get('/projects/abc')).status, 404)
  assert.equal((await get('/projects/019a8f2e-7c41-7b3e-9d2a-5f6e8c1b4a30')).status, 404)
  const bad = await fetch(`${base}/projects/abc`, { headers: { authorization: 'Bearer x' } })
  assert.equal(bad.status, 401, 'the front must know it has to refresh')
})

test('application: validation', async () => {
  const id = await newAvailable()
  const url = `/projects/${id}/application`
  assert.equal((await post(url, undefined, application())).status, 401)
  for (const as of ['partner', 'carla'])
    assert.equal((await post(url, as, application())).status, 403)
  const member = { email: users.bruno.email, teamRole: 'Back-end' }
  const bad: [string, object][] = [
    ['no role', { teamRole: '' }],
    ['members not a list', { members: 'bruno' }],
    ['null member', { members: [null] }],
    ['member without role', { members: [{ email: users.bruno.email }] }],
    [
      'repeated member',
      { members: [member, { ...member, email: users.bruno.email.toUpperCase() }] },
    ],
    ['sender as member', { members: [{ ...member, email: users.ana.email }] }],
    ['no account', { members: [{ ...member, email: `ninguem.${run}@teste.com` }] }],
    ['member is not a student', { members: [{ ...member, email: users.daniel.email }] }],
    ['professor is not a professor', { professorId: users.bruno.id }],
    ['malformed professor', { professorId: 'abc' }],
    ['no discipline', { discipline: '' }],
    ['bad semester', { semester: '2026.3' }],
  ]
  for (const [label, over] of bad)
    assert.equal((await post(url, 'ana', application(over))).status, 400, label)
  const r = await get(`/projects/${id}`, 'ana')
  assert.equal(r.body.status, 'AVAILABLE', 'nothing changed')
  assert.deepEqual(r.body.permissions, {
    review: false,
    apply: true,
    reviewApplication: false,
    cancel: false,
    edit: false,
    editRepo: false,
    complete: false,
  })
  assert.equal(
    (await post(`/projects/${await newDemand()}/application`, 'ana', application())).status,
    404,
  )
})

test('application: proposed team is private, only the indicated professor approves', async () => {
  const id = await newAwaiting()
  assert.equal(await inTab('available', id), true)
  assert.equal((await post(`/projects/${id}/application`, 'outsider', application())).status, 409)

  for (const as of [undefined, 'outsider', 'daniel', 'partner']) {
    const { body } = await get(`/projects/${id}`, as)
    assert.deepEqual(
      [body.application, body.team, body.professor, body.semester],
      [null, [], null, null],
    )
  }
  for (const as of ['ana', 'bruno', 'carla']) {
    const { application: a } = (await get(`/projects/${id}`, as)).body
    assert.equal(a.applicant.id, users.ana.id)
    assert.deepEqual(a.team.map((m: { teamRole: string }) => m.teamRole).sort(), [
      'Front-end',
      'PO',
    ])
  }

  const pendingOf = async (as: string) =>
    (await get('/projects/pending', as)).body.applications.find((p: { id: string }) => p.id === id)
  assert.equal(await pendingOf('daniel'), undefined)
  const row = await pendingOf('carla')
  assert.deepEqual(
    [row.teamSize, row.discipline, row.semester],
    [2, 'Projeto Integrado I', '2026.2'],
  )

  for (const as of ['daniel', 'ana', 'partner'])
    assert.equal((await post(`/projects/${id}/application/approve`, as)).status, 403, as)
  const approved = await post(`/projects/${id}/application/approve`, 'carla')
  assert.deepEqual([approved.body.status, approved.body.phase], ['IN_PROGRESS', 'REQUIREMENTS'])
  assert.equal((await post(`/projects/${id}/application/reject`, 'carla')).status, 409)
  assert.equal(await pendingOf('carla'), undefined)

  assert.equal(await inTab('in-progress', id), true)
  const visitor = (await get(`/projects/${id}`)).body
  assert.equal(visitor.professor.id, users.carla.id)
  assert.equal(visitor.team.length, 2)
  const mine = (await get('/projects/mine', 'partner')).body.find(
    (p: { id: string }) => p.id === id,
  )
  assert.deepEqual([mine.teamSize, mine.professor.id], [2, users.carla.id])
})

test('application refused: team removed, project available again for another team', async () => {
  const id = await newAwaiting()
  assert.equal((await post(`/projects/${id}/application/reject`, 'daniel')).status, 403)
  assert.equal((await post(`/projects/${id}/application/reject`, 'carla')).body.status, 'AVAILABLE')
  assert.equal((await post(`/projects/${id}/application/approve`, 'carla')).status, 409)
  const row = await prisma.project.findUniqueOrThrow({ where: { id }, include: { members: true } })
  assert.deepEqual(
    [
      row.professorId,
      row.discipline,
      row.semester,
      row.applicantId,
      row.appliedAt,
      row.members.length,
    ],
    [null, null, null, null, null, 0],
  )
  assert.equal((await post(`/projects/${id}/application`, 'outsider', application())).status, 201)
})

test('simultaneous applications: exactly one wins and leaves a single team', async () => {
  const id = await newAvailable()
  const body = application({ members: [] })
  const results = await Promise.all(
    ['ana', 'bruno', 'outsider'].map((as) => post(`/projects/${id}/application`, as, body)),
  )
  assert.deepEqual(results.map((r) => r.status).sort(), [201, 409, 409])
  assert.equal(await prisma.projectMember.count({ where: { projectId: id } }), 1)
})

test('form options: professors and teammate by e-mail', async () => {
  assert.equal((await get('/users/professors')).status, 401)
  const professors = (await get('/users/professors', 'ana')).body
  const carla = professors.find((p: { id: string }) => p.id === users.carla.id)
  assert.deepEqual(Object.keys(carla).sort(), ['id', 'name'])

  const find = (email: string, as = 'ana') =>
    get(`/users/students?email=${encodeURIComponent(email)}`, as)
  assert.equal((await find(users.bruno.email.toUpperCase())).body.id, users.bruno.id)
  assert.equal((await find(users.carla.email)).status, 404)
  assert.equal((await find('invalido')).status, 400)
  assert.equal((await find(users.bruno.email, 'partner')).status, 403)
})

// flow 6

async function newInProgress() {
  const id = await newAwaiting()
  assert.equal((await post(`/projects/${id}/application/approve`, 'carla')).status, 200)
  return id
}
const figmaUrl = 'https://www.figma.com/design/abc/estoque'
const repoUrl = 'https://github.com/carla/estoque'

test('progress: team and responsible professor change phase and Figma; only the professor the repo', async () => {
  const id = await newInProgress()
  for (const as of ['outsider', 'daniel', 'partner'])
    assert.equal((await patch(`/projects/${id}`, as, { phase: 'DESIGN' })).status, 403, as)
  assert.equal((await patch(`/projects/${id}`, undefined, { phase: 'DESIGN' })).status, 401)

  const bad: object[] = [
    {},
    { phase: 'DONE' },
    { figmaUrl: 'https://drive.google.com/abc123' },
    { figmaUrl: 'http://figma.com/x' },
    { figmaUrl: 'https://figma.com.evil.io/x' },
    { figmaUrl: null },
    { repoUrl: 'https://gitlab.com/x' },
  ]
  for (const body of bad)
    assert.equal((await patch(`/projects/${id}`, 'carla', body)).status, 400, JSON.stringify(body))

  const before = (await get(`/projects/${id}`)).body
  assert.deepEqual([before.repoUrl, before.figmaUrl], [null, null])
  const r = await patch(`/projects/${id}`, 'bruno', { phase: 'DESIGN', figmaUrl })
  assert.deepEqual([r.body.phase, r.body.figmaUrl], ['DESIGN', figmaUrl])
  assert.ok(r.body.updatedAt > before.updatedAt, 'RN11')
  assert.equal((await patch(`/projects/${id}`, 'ana', { repoUrl })).status, 403)
  assert.equal((await patch(`/projects/${id}`, 'carla', { repoUrl })).body.repoUrl, repoUrl)

  const perms = (as?: string) => get(`/projects/${id}`, as).then((x) => x.body.permissions)
  assert.deepEqual(
    [(await perms('ana')).edit, (await perms('ana')).editRepo, (await perms('ana')).complete],
    [true, false, false],
  )
  assert.deepEqual([(await perms('carla')).editRepo, (await perms('carla')).complete], [true, true])
  assert.equal((await perms()).edit, false)
})

test('team: edited as a whole by members or the professor, never empty', async () => {
  const id = await newInProgress()
  const url = `/projects/${id}/team`
  const team = [
    { email: users.ana.email, teamRole: 'Scrum Master' },
    { email: users.outsider.email, teamRole: 'QA' },
  ]
  assert.equal((await put(url, 'outsider', { members: team })).status, 403)
  assert.equal((await put(url, 'ana', { members: [] })).status, 400)
  assert.equal(
    (await put(url, 'ana', { members: [{ email: users.daniel.email, teamRole: 'QA' }] })).status,
    400,
    'not a student',
  )

  // e-mails only for who edits the team
  assert.equal((await get(`/projects/${id}`, 'ana')).body.team[0].email, users.ana.email)
  assert.equal((await get(`/projects/${id}`, 'outsider')).body.team[0].email, undefined)

  const r = await put(url, 'carla', { members: team })
  const roles = r.body.team.map((m: { id: string; teamRole: string }) => [m.id, m.teamRole])
  assert.deepEqual(
    roles.sort(),
    [
      [users.ana.id, 'Scrum Master'],
      [users.outsider.id, 'QA'],
    ].sort(),
  )
  // bruno left: no longer edits, outsider now does
  assert.equal((await patch(`/projects/${id}`, 'bruno', { phase: 'DESIGN' })).status, 403)
  assert.equal((await patch(`/projects/${id}`, 'outsider', { phase: 'DESIGN' })).status, 200)
})

test('attachments: team uploads, students, professors and the owner download, visitors never', async () => {
  const id = await newInProgress()
  assert.equal((await upload(id, undefined, 'req.pdf')).status, 401)
  assert.equal((await upload(id, 'outsider', 'req.pdf')).status, 403)
  assert.equal((await upload(id, 'ana', 'virus.exe')).status, 400)
  assert.equal((await upload(id, 'ana', 'semextensao')).status, 400)
  assert.equal((await upload(id, 'ana', 'req.pdf', '')).status, 400)
  assert.equal((await upload(id, 'ana', 'big.zip', 'x'.repeat(20 * 1024 * 1024 + 1))).status, 413)

  const r = await upload(id, 'ana', 'Requisitos.PDF', 'pdf da ana')
  assert.equal(r.status, 201)
  const [a] = r.body.attachments
  assert.deepEqual(
    [a.fileName, a.mimeType, a.size, a.category, a.uploadedBy.id, a.canDelete],
    ['Requisitos.PDF', 'application/pdf', 10, 'REQUIREMENTS', users.ana.id, true],
  )

  const file = `/projects/${id}/attachments/${a.id}`
  for (const as of ['partner', 'outsider', 'daniel']) {
    const res = await fetch(base + file, {
      headers: { authorization: `Bearer ${users[as].token}` },
    })
    assert.equal(res.status, 200, as)
    assert.equal(await res.text(), 'pdf da ana')
    assert.match(res.headers.get('content-disposition') ?? '', /Requisitos\.PDF/)
  }
  assert.equal((await fetch(base + file)).status, 401)
  assert.equal((await get(`/projects/${id}`)).body.attachments, null)
  assert.equal((await get(`/projects/${id}`, 'otherPartner')).body.attachments, null)
  assert.equal((await get(file, 'otherPartner')).status, 404)
  assert.equal((await get(`/projects/${id}/attachments/abc`, 'ana')).status, 404)

  // only who uploaded or the responsible professor removes
  assert.equal((await get(`/projects/${id}`, 'bruno')).body.attachments[0].canDelete, false)
  assert.equal((await del(file, 'bruno')).status, 403)
  assert.equal((await del(file, 'partner')).status, 403)
  const second = (await upload(id, 'bruno', 'ata.docx')).body.attachments[1]
  assert.equal((await del(file, 'carla')).status, 200)
  assert.equal((await del(`/projects/${id}/attachments/${second.id}`, 'bruno')).status, 200)
  assert.deepEqual(await readdir(process.env.UPLOAD_DIR as string), [], 'files removed')
})

test('complete: only the responsible professor, with both links; then read-only', async () => {
  const id = await newInProgress()
  assert.equal((await post(`/projects/${id}/complete`, 'ana')).status, 403)
  assert.equal((await post(`/projects/${id}/complete`, 'daniel')).status, 403)
  assert.equal((await post(`/projects/${id}/complete`, 'carla')).status, 409, 'no links')
  await patch(`/projects/${id}`, 'carla', { repoUrl })
  assert.equal((await post(`/projects/${id}/complete`, 'carla')).status, 409, 'no Figma')
  await patch(`/projects/${id}`, 'ana', { figmaUrl, phase: 'VALIDATION' })
  const attachment = (await upload(id, 'ana', 'final.pdf')).body.attachments[0]

  const done = await post(`/projects/${id}/complete`, 'carla')
  assert.deepEqual([done.body.status, done.body.phase], ['COMPLETED', null])
  assert.equal(await inTab('completed', id), true)

  // RN08
  assert.equal((await patch(`/projects/${id}`, 'ana', { phase: 'DESIGN' })).status, 409)
  assert.equal((await put(`/projects/${id}/team`, 'carla', { members: [] })).status, 400)
  assert.equal(
    (
      await put(`/projects/${id}/team`, 'carla', {
        members: [{ email: users.ana.email, teamRole: 'PO' }],
      })
    ).status,
    409,
  )
  assert.equal((await upload(id, 'ana', 'tarde.pdf')).status, 409)
  const file = `/projects/${id}/attachments/${attachment.id}`
  assert.equal((await del(file, 'carla')).status, 409)
  const download = await fetch(base + file, {
    headers: { authorization: `Bearer ${users.partner.token}` },
  })
  assert.equal(download.status, 200, 'still downloadable')
  assert.equal((await post(`/projects/${id}/complete`, 'carla')).status, 409)
  assert.equal((await post(`/projects/${id}/cancel`, 'carla')).status, 409)
})

test('cancel in progress: only the responsible professor, with reason', async () => {
  const id = await newInProgress()
  for (const as of ['ana', 'partner', 'daniel'])
    assert.equal((await post(`/projects/${id}/cancel`, as)).status, as === 'ana' ? 403 : 409, as)
  const r = await post(`/projects/${id}/cancel`, 'carla', { reason: 'O parceiro saiu' })
  assert.deepEqual(
    [r.body.status, r.body.phase, r.body.statusReason],
    ['CANCELED', null, 'O parceiro saiu'],
  )
  assert.equal((await get(`/projects/${id}`, 'ana')).status, 200, 'team still sees it')
  assert.equal((await patch(`/projects/${id}`, 'ana', { phase: 'DESIGN' })).status, 409)
})

test('my projects: students where they are in the team, professors where responsible', async () => {
  const awaiting = await newAwaiting()
  const inProgress = await newInProgress()
  const ids = (rows: { id: string }[]) => rows.map((p) => p.id)

  const ana = (await get('/projects/mine', 'ana')).body
  assert.ok(ids(ana).includes(awaiting) && ids(ana).includes(inProgress))
  const row = ana.find((p: { id: string }) => p.id === inProgress)
  assert.deepEqual(
    [row.myRole, row.professor.id, row.status],
    ['PO', users.carla.id, 'IN_PROGRESS'],
  )

  const carla = ids((await get('/projects/mine', 'carla')).body)
  assert.ok(carla.includes(inProgress) && !carla.includes(awaiting), 'awaiting is in Pendências')
  assert.ok(!ids((await get('/projects/mine', 'daniel')).body).includes(inProgress))
  assert.ok(!ids((await get('/projects/mine', 'outsider')).body).includes(inProgress))
  assert.equal((await get('/projects/mine')).status, 401)
})
