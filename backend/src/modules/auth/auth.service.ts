import { Prisma, type User } from '@prisma/client'
import { prisma } from '../../lib/prisma.ts'
import { HttpError } from '../../lib/http-error.ts'
import { toPublicUser, type PublicUser } from '../users/users.service.ts'
import type { SignupInput } from './auth.validation.ts'
import { hashPassword, verifyPassword } from './password.ts'
import { blockedFor, recordFailure, clearFailures } from './login-limiter.ts'
import { REFRESH_TTL_MS, hashRefreshToken, newRefreshToken, signAccessToken } from './tokens.ts'

export type Session = { accessToken: string; refreshToken: string; user: PublicUser }

const sessionExpired = () => new HttpError(401, 'Sessão expirada. Faça login de novo.')

async function createSession(user: User): Promise<Session> {
  const refreshToken = newRefreshToken()
  await prisma.refreshToken.deleteMany({ where: { userId: user.id, expiresAt: { lt: new Date() } } })
  await prisma.refreshToken.create({
    data: { hash: hashRefreshToken(refreshToken), userId: user.id, expiresAt: new Date(Date.now() + REFRESH_TTL_MS) },
  })
  return { accessToken: await signAccessToken(user), refreshToken, user: toPublicUser(user) }
}

export async function signup({ password, data }: SignupInput) {
  try {
    const user = await prisma.user.create({ data: { ...data, passwordHash: await hashPassword(password) } })
    return createSession(user)
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002')
      throw new HttpError(409, 'Já existe uma conta com este e-mail. Use Entrar.')
    throw e
  }
}

export async function login(email: string, password: string, ip: string) {
  const key = `${ip}|${email}`
  const wait = blockedFor(key)
  if (wait)
    throw new HttpError(429, `Muitas tentativas. Tente de novo em ${Math.ceil(wait / 60_000)} min.`, {
      'Retry-After': String(Math.ceil(wait / 1000)),
    })

  const user = email ? await prisma.user.findUnique({ where: { email } }) : null
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    recordFailure(key)
    throw new HttpError(401, 'E-mail ou senha incorretos.')
  }
  clearFailures(key)
  return createSession(user)
}

// rotation: the used token is deleted and a new one is issued
export async function refresh(token: string | undefined) {
  if (!token) throw sessionExpired()
  const row = await prisma.refreshToken.findUnique({ where: { hash: hashRefreshToken(token) }, include: { user: true } })
  if (!row) throw sessionExpired()
  const { count } = await prisma.refreshToken.deleteMany({ where: { id: row.id, expiresAt: { gt: new Date() } } })
  if (!count) throw sessionExpired()
  return createSession(row.user)
}

export async function logout(token: string | undefined) {
  if (token) await prisma.refreshToken.deleteMany({ where: { hash: hashRefreshToken(token) } })
}
