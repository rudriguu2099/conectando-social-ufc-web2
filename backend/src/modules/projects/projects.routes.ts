import express, { Router } from 'express'
import { authenticate, authenticateOptional, requireRole } from '../auth/auth.middleware.ts'
import * as projectsController from './projects.controller.ts'
import { MAX_ATTACHMENT_SIZE } from './projects.validation.ts'

export const projectsRoutes = Router()

const partner = [authenticate, requireRole('PARTNER')]
const student = [authenticate, requireRole('STUDENT')]
const professor = [authenticate, requireRole('PROFESSOR')]

// showcase (flow 3)
projectsRoutes.get('/', projectsController.list)

// demand (flow 4)
projectsRoutes.post('/', partner, projectsController.create)
projectsRoutes.get('/mine', authenticate, projectsController.mine)
projectsRoutes.get('/pending', professor, projectsController.pending)
projectsRoutes.post('/:id/approve', professor, projectsController.approve)
projectsRoutes.post('/:id/reject', professor, projectsController.reject)
projectsRoutes.post(
  '/:id/cancel',
  authenticate,
  requireRole('PARTNER', 'PROFESSOR'),
  projectsController.cancel,
)

// application (flow 5)
projectsRoutes.post('/:id/application', student, projectsController.apply)
projectsRoutes.post('/:id/application/approve', professor, projectsController.approveApplication)
projectsRoutes.post('/:id/application/reject', professor, projectsController.rejectApplication)

// progress (flow 6): who can do what is checked in the service, per project
// the attachment comes as the raw body, with fileName and category in the query
const rawFile = express.raw({ type: () => true, limit: MAX_ATTACHMENT_SIZE })
projectsRoutes.patch('/:id', authenticate, projectsController.update)
projectsRoutes.put('/:id/team', authenticate, projectsController.replaceTeam)
projectsRoutes.post('/:id/complete', professor, projectsController.complete)
projectsRoutes.post('/:id/attachments', authenticate, rawFile, projectsController.addAttachment)
projectsRoutes.get(
  '/:id/attachments/:attachmentId',
  authenticate,
  projectsController.downloadAttachment,
)
projectsRoutes.delete(
  '/:id/attachments/:attachmentId',
  authenticate,
  projectsController.removeAttachment,
)

// after /mine and /pending, so they are not read as ids
projectsRoutes.get('/:id', authenticateOptional, projectsController.getById)
