// Needs the database: npm test (inside the backend container, or with DATABASE_URL + JWT_SECRET set)
import { test, after } from 'node:test'
import assert from 'node:assert/strict'
import type { AddressInfo } from 'node:net'
import type * as express from 'express'
import { app } from '../../index.ts'
import { prisma } from '../../lib/prisma.ts'
import { HttpError } from '../../lib/http-error.ts'
import { requireRole } from './auth.middleware.ts'
import { hashPassword, verifyPassword } from './password.ts'

const server = app.listen(0)
const base = `http://localhost:${(server.address() as AddressInfo).port}`
const run = Date.now()
const studentEmail = `aluno.${run}@teste.com`
const partnerEmail = `parceiro.${run}@teste.com`

after(async () => {
  await prisma.user.deleteMany({ where: { email: { in: [studentEmail, partnerEmail] } } })
  await prisma.$disconnect()
  server.close()
})

const post = (path: string, body?: object, headers: Record<string, string> = {}) =>
  fetch(base + path, { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify(body ?? {}) })
const cookieOf = (r: Response) => r.headers.get('set-cookie')!.split(';')[0]

test('password hash', async () => {
  const hash = await hashPassword('senha1234')
  assert.equal(await verifyPassword('senha1234', hash), true)
  assert.equal(await verifyPassword('errada123', hash), false)
})

test('signup validation', async () => {
  const student = { role: 'STUDENT', name: 'Ana', email: studentEmail, password: 'senha1234', course: 'Design Digital' }
  assert.equal((await post('/api/auth/signup', { ...student, role: 'PROFESSOR' })).status, 400)
  assert.equal((await post('/api/auth/signup', { ...student, course: 'Medicina' })).status, 400)
  assert.equal((await post('/api/auth/signup', { ...student, password: 'curta' })).status, 400)
  const partner = { role: 'PARTNER', name: 'Maria', email: partnerEmail, password: 'senha1234', organization: 'Vida Nova', partnerType: 'ONG' }
  assert.equal((await post('/api/auth/signup', partner)).status, 400, 'terms required')
  assert.equal((await post('/api/auth/signup', { ...partner, termsAccepted: true })).status, 201)
})

test('session flow: signup, me, roles, refresh rotation, logout', async () => {
  const signup = await post('/api/auth/signup', { role: 'STUDENT', name: 'Ana', email: studentEmail, password: 'senha1234', course: 'Design Digital' })
  assert.equal(signup.status, 201)
  const body = await signup.json()
  assert.deepEqual(Object.keys(body), ['accessToken'])
  const { accessToken } = body
  assert.equal((await post('/api/auth/signup', { role: 'STUDENT', name: 'Ana', email: studentEmail, password: 'senha1234', course: 'Design Digital' })).status, 409)

  const auth = { authorization: `Bearer ${accessToken}` }
  const me = await (await fetch(base + '/api/users/me', { headers: auth })).json()
  assert.equal(me.role, 'STUDENT')
  assert.equal(me.passwordHash, undefined)
  assert.equal((await fetch(base + '/api/users/me')).status, 401)
  const asStudent = { user: { id: me.id, role: 'STUDENT' } } as express.Request
  assert.throws(() => requireRole('PROFESSOR')(asStudent, {} as express.Response, () => {}), HttpError)

  const cookie = cookieOf(signup)
  const refreshed = await post('/api/auth/refresh', {}, { cookie })
  assert.equal(refreshed.status, 200)
  assert.equal((await post('/api/auth/refresh', {}, { cookie })).status, 401, 'old refresh token is rotated out')

  const newCookie = cookieOf(refreshed)
  assert.equal((await post('/api/auth/logout', {}, { cookie: newCookie })).status, 204)
  assert.equal((await post('/api/auth/refresh', {}, { cookie: newCookie })).status, 401)
})

test('login rate limit: 5 failures then 429, even with the right password', async () => {
  for (let i = 0; i < 5; i++) assert.equal((await post('/api/auth/login', { email: partnerEmail, password: 'errada123' })).status, 401)
  assert.equal((await post('/api/auth/login', { email: partnerEmail, password: 'senha1234' })).status, 429)
  assert.equal((await post('/api/auth/login', { email: studentEmail, password: 'senha1234' })).status, 200, 'other emails unaffected')
})
