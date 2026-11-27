import type { Request, Response } from 'express'
import { HttpError } from '../../lib/http-error.ts'
import * as projectsService from './projects.service.ts'
import { parseApplication, parseDemand, parseReason, parseTab } from './projects.validation.ts'

type IdRequest = Request<{ id: string }>

function loggedUser(req: { user?: Request['user'] }) {
  if (!req.user) throw new HttpError(401, 'Faça login para continuar.')
  return req.user
}

export async function list(req: Request, res: Response) {
  res.json(await projectsService.list(parseTab(req.query.tab)))
}

export async function mine(req: Request, res: Response) {
  res.json(await projectsService.listMine(loggedUser(req)))
}

export async function pending(req: Request, res: Response) {
  res.json(await projectsService.listPending(loggedUser(req)))
}

export async function getById(req: IdRequest, res: Response) {
  res.json(await projectsService.getById(req.params.id, req.user))
}

export async function create(req: Request, res: Response) {
  const demand = parseDemand(req.body ?? {})
  res.status(201).json(await projectsService.createDemand(demand, loggedUser(req)))
}

export async function approve(req: IdRequest, res: Response) {
  res.json(await projectsService.approveDemand(req.params.id, loggedUser(req)))
}

export async function reject(req: IdRequest, res: Response) {
  const reason = parseReason(req.body ?? {})
  res.json(await projectsService.rejectDemand(req.params.id, reason, loggedUser(req)))
}

export async function cancel(req: IdRequest, res: Response) {
  const reason = parseReason(req.body ?? {})
  res.json(await projectsService.cancelDemand(req.params.id, reason, loggedUser(req)))
}

export async function apply(req: IdRequest, res: Response) {
  const application = parseApplication(req.body ?? {})
  res.status(201).json(await projectsService.apply(req.params.id, application, loggedUser(req)))
}

export async function approveApplication(req: IdRequest, res: Response) {
  res.json(await projectsService.approveApplication(req.params.id, loggedUser(req)))
}

export async function rejectApplication(req: IdRequest, res: Response) {
  res.json(await projectsService.rejectApplication(req.params.id, loggedUser(req)))
}
