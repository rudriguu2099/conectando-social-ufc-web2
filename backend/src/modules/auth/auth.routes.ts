import { Router } from 'express'
import * as authController from './auth.controller.ts'

export const authRoutes = Router()

authRoutes.post('/signup', authController.signup)
authRoutes.post('/login', authController.login)
authRoutes.post('/refresh', authController.refresh)
authRoutes.post('/logout', authController.logout)
authRoutes.post('/forgot-password', authController.forgotPassword)
authRoutes.post('/reset-password', authController.resetPassword)
