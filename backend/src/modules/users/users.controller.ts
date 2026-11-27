import type { Request, Response } from 'express'
import { parseEmail } from '../../lib/validation.ts'
import * as usersService from './users.service.ts'

export async function me(req: Request, res: Response) {
  res.json(await usersService.getById(req.user!.id))
}

export async function professors(_req: Request, res: Response) {
  res.json(await usersService.listProfessors())
}

export async function findStudent(req: Request, res: Response) {
  res.json(await usersService.findStudentByEmail(parseEmail(req.query.email)))
}
