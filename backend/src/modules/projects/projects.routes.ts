import { Router } from 'express'
import { authenticate, authenticateOptional, requireRole } from '../auth/auth.middleware.ts'
import * as projectsController from './projects.controller.ts'

export const projectsRoutes = Router()

const partner = [authenticate, requireRole('PARTNER')]
const student = [authenticate, requireRole('STUDENT')]
const professor = [authenticate, requireRole('PROFESSOR')]

// showcase (flow 3)
projectsRoutes.get('/', projectsController.list)

// demand (flow 4)
projectsRoutes.post('/', partner, projectsController.create)
projectsRoutes.get('/mine', partner, projectsController.mine)
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

// after /mine and /pending, so they are not read as ids
projectsRoutes.get('/:id', authenticateOptional, projectsController.getById)
