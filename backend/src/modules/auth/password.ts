import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const scryptAsync = promisify(scrypt) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>

export async function hashPassword(password: string) {
  const salt = randomBytes(16)
  const key = await scryptAsync(password, salt, 64)
  return `${salt.toString('hex')}:${key.toString('hex')}`
}

export async function verifyPassword(password: string, stored: string) {
  const [salt, key] = stored.split(':')
  const attempt = await scryptAsync(password, Buffer.from(salt, 'hex'), 64)
  return timingSafeEqual(attempt, Buffer.from(key, 'hex'))
}
