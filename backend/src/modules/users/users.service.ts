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

// options for the application form
export function listProfessors() {
  return prisma.user.findMany({
    where: { role: 'PROFESSOR' },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })
}

// the application form shows the teammate's name as soon as the e-mail is added
export async function findStudentByEmail(email: string) {
  const student = await prisma.user.findFirst({
    where: { email, role: 'STUDENT' },
    select: { id: true, name: true, email: true },
  })
  if (!student) throw new HttpError(404, 'Não encontramos uma conta de aluno com este e-mail.')
  return student
}
