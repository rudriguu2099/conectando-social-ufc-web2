import type { Request, Response, NextFunction } from 'express'
import type { Role } from '@prisma/client'
import { HttpError } from '../../lib/http-error.ts'
import { verifyAccessToken } from './tokens.ts'

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.match(/^Bearer (.+)$/)?.[1]
  if (!token) throw new HttpError(401, 'Faça login para continuar.')
  try {
    req.user = await verifyAccessToken(token)
  } catch {
    throw new HttpError(401, 'Sessão expirada. Faça login de novo.')
  }
  next()
}

export const requireRole =
  (...roles: Role[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) throw new HttpError(403, 'Você não tem permissão para isso.')
    next()
  }
