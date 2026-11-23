import type { Prisma } from '@prisma/client'
import { invalid, parseEmail, text } from '../../lib/validation.ts'
import { COURSES, PARTNER_TYPES } from '../users/users.constants.ts'

function parsePassword(v: unknown) {
  const password = typeof v === 'string' ? v : ''
  if (password.length < 8 || password.length > 128)
    throw invalid('A senha precisa ter entre 8 e 128 caracteres.')
  return password
}

export type SignupInput = { password: string; data: Omit<Prisma.UserCreateInput, 'passwordHash'> }

export function parseSignup(b: Record<string, unknown>): SignupInput {
  if (b.role !== 'STUDENT' && b.role !== 'PARTNER') throw invalid('Escolha aluno ou parceiro.')
  const name = text(b.name)
  if (!name) throw invalid('Informe o nome.')
  const email = parseEmail(b.email)
  const password = parsePassword(b.password)

  if (b.role === 'STUDENT') {
    const course = text(b.course)
    if (!COURSES.includes(course)) throw invalid('Escolha um curso da lista.')
    return { password, data: { name, email, role: b.role, course } }
  }

  const organization = text(b.organization)
  const partnerType = text(b.partnerType)
  if (!organization) throw invalid('Informe a organização.')
  if (!PARTNER_TYPES.includes(partnerType)) throw invalid('Escolha um tipo de parceiro da lista.')
  if (b.termsAccepted !== true) throw invalid('É preciso aceitar o termo de ciência.')
  return {
    password,
    data: {
      name,
      email,
      role: b.role,
      organization,
      partnerType,
      phone: text(b.phone) || null,
      termsAcceptedAt: new Date(),
    },
  }
}

export function parseLogin(b: Record<string, unknown>) {
  return {
    email: text(b.email).toLowerCase(),
    password: typeof b.password === 'string' ? b.password : '',
  }
}

export function parseForgotPassword(b: Record<string, unknown>) {
  return { email: parseEmail(b.email) }
}

export function parseResetPassword(b: Record<string, unknown>) {
  return { token: text(b.token), password: parsePassword(b.password) }
}
