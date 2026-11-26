// Needs the database: npm test (inside the backend container, or with DATABASE_URL + JWT_SECRET set)
import assert from 'node:assert/strict'
import type { AddressInfo } from 'node:net'
import { after, before, test } from 'node:test'
import type { Role } from '@prisma/client'
import { app } from '../../index.ts'
import { prisma } from '../../lib/prisma.ts'
import { signAccessToken } from '../auth/tokens.ts'

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

  assert.equal((await get('/projects/mine', 'ana')).status, 403)
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
