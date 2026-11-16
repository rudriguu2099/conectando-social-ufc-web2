import { Router } from 'express'
import { authenticate } from '../auth/auth.middleware.ts'
import * as usersController from './users.controller.ts'

export const usersRoutes = Router()

usersRoutes.get('/me', authenticate, usersController.me)
