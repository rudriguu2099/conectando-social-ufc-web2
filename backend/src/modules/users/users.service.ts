import type { User } from '@prisma/client'
import { HttpError } from '../../lib/http-error.ts'
import { prisma } from '../../lib/prisma.ts'

export type PublicUser = Omit<User, 'passwordHash'>

export function toPublicUser(user: User): PublicUser {
  const { passwordHash, ...rest } = user
  return rest
}

export async function getById(id: string) {
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) throw new HttpError(401, 'Faça login para continuar.')
  return toPublicUser(user)
}
