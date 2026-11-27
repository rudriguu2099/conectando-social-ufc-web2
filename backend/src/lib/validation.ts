import { HttpError } from './http-error.ts'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const invalid = (message: string) => new HttpError(400, message)
export const text = (v: unknown) => (typeof v === 'string' ? v.trim() : '')

export function parseEmail(v: unknown) {
  const email = text(v).toLowerCase()
  if (!EMAIL_RE.test(email)) throw invalid('Informe um e-mail válido.')
  return email
}

export function optionalText(v: unknown, label: string, max: number) {
  const value = text(v)
  if (value.length > max) throw invalid(`${label}: use até ${max} caracteres.`)
  return value || null
}

export function requiredText(v: unknown, label: string, max: number) {
  const value = optionalText(v, label, max)
  if (!value) throw invalid(`${label}: preencha este campo.`)
  return value
}
