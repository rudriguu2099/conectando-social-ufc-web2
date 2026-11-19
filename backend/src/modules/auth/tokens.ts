import { createHash, randomBytes } from 'node:crypto'
import { SignJWT, jwtVerify } from 'jose'
import type { Role } from '@prisma/client'

const ACCESS_TTL = '15m'
export const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000 // renewed on every refresh

function jwtSecret() {
  const s = process.env.JWT_SECRET
  if (!s) throw new Error('JWT_SECRET is not set')
  return new TextEncoder().encode(s)
}

export function signAccessToken(user: { id: string; role: Role }) {
  return new SignJWT({ role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(ACCESS_TTL)
    .sign(jwtSecret())
}

export async function verifyAccessToken(token: string) {
  const { payload } = await jwtVerify(token, jwtSecret(), { algorithms: ['HS256'] })
  if (!payload.sub) throw new Error('token without sub')
  return { id: payload.sub, role: payload.role as Role }
}

export const newToken = () => randomBytes(32).toString('base64url')

// only the hash goes to the database
export const hashToken = (token: string) => createHash('sha256').update(token).digest('hex')
