import type { Request, Response } from 'express'
import * as usersService from './users.service.ts'

export async function me(req: Request, res: Response) {
  res.json(await usersService.getById(req.user!.id))
}
