import { Router } from 'express'
import { authenticate, requireRole } from '../auth/auth.middleware.ts'
import * as usersController from './users.controller.ts'

export const usersRoutes = Router()

usersRoutes.get('/me', authenticate, usersController.me)
usersRoutes.get('/professors', authenticate, usersController.professors)
usersRoutes.get('/students', authenticate, requireRole('STUDENT'), usersController.findStudent)
