import { Prisma, type User } from '@prisma/client'
import { prisma } from '../../lib/prisma.ts'
import { HttpError } from '../../lib/http-error.ts'
import { sendMail } from '../../lib/mailer.ts'
import { passwordResetEmail } from './password-reset.email.ts'
import type { SignupInput } from './auth.validation.ts'
import { hashPassword, verifyPassword } from './password.ts'
import { blockedFor, recordFailure, clearFailures } from './login-limiter.ts'
import { REFRESH_TTL_MS, hashToken, newToken, signAccessToken } from './tokens.ts'

export type Session = { accessToken: string; refreshToken: string }

const sessionExpired = () => new HttpError(401, 'Sessão expirada. Faça login de novo.')

async function createSession(user: User): Promise<Session> {
  const refreshToken = newToken()
  await prisma.refreshToken.deleteMany({ where: { userId: user.id, expiresAt: { lt: new Date() } } })
  await prisma.refreshToken.create({
    data: { hash: hashToken(refreshToken), userId: user.id, expiresAt: new Date(Date.now() + REFRESH_TTL_MS) },
  })
  return { accessToken: await signAccessToken(user), refreshToken }
}

export async function signup({ password, data }: SignupInput) {
  try {
    const user = await prisma.user.create({ data: { ...data, passwordHash: await hashPassword(password) } })
    return createSession(user)
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002')
      throw new HttpError(409, 'Não foi possível criar a conta com este e-mail. Se você já tem cadastro, use Entrar ou recupere a senha.')
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
  const row = await prisma.refreshToken.findUnique({ where: { hash: hashToken(token) }, include: { user: true } })
  if (!row) throw sessionExpired()
  const { count } = await prisma.refreshToken.deleteMany({ where: { id: row.id, expiresAt: { gt: new Date() } } })
  if (!count) throw sessionExpired()
  return createSession(row.user)
}

export async function logout(token: string | undefined) {
  if (token) await prisma.refreshToken.deleteMany({ where: { hash: hashToken(token) } })
}

// password reset

const RESET_TTL_MS = 60 * 60 * 1000
const RESEND_COOLDOWN_MS = 60 * 1000
const linkInvalid = () => new HttpError(400, 'Este link não vale mais. Peça outro link.')

// same response whether the account exists or not, and the email is not awaited so timing doesn't tell either
export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return
  const current = await prisma.passwordResetToken.findUnique({ where: { userId: user.id } })
  if (current && Date.now() - current.createdAt.getTime() < RESEND_COOLDOWN_MS) return

  const token = newToken()
  const data = { hash: hashToken(token), expiresAt: new Date(Date.now() + RESET_TTL_MS), createdAt: new Date() }
  await prisma.passwordResetToken.upsert({ where: { userId: user.id }, create: { ...data, userId: user.id }, update: data })

  const link = `${process.env.APP_URL ?? 'http://localhost:5173'}/redefinir-senha#token=${token}`
  sendMail(passwordResetEmail(user, link)).catch((e) => console.error('password reset email failed', e))
}

export async function resetPassword(token: string, password: string) {
  const row = token ? await prisma.passwordResetToken.findUnique({ where: { hash: hashToken(token) } }) : null
  if (!row) throw linkInvalid()
  const { count } = await prisma.passwordResetToken.deleteMany({ where: { id: row.id, expiresAt: { gt: new Date() } } })
  if (!count) throw linkInvalid()

  // ends every session: whoever had the old password is logged out
  await prisma.$transaction([
    prisma.user.update({ where: { id: row.userId }, data: { passwordHash: await hashPassword(password) } }),
    prisma.refreshToken.deleteMany({ where: { userId: row.userId } }),
  ])
}
