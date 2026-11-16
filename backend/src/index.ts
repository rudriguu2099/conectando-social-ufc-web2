import express from 'express'
import { prisma } from './lib/prisma.ts'
import { errorHandler } from './lib/http-error.ts'
import { authRoutes } from './modules/auth/auth.routes.ts'
import { usersRoutes } from './modules/users/users.routes.ts'

export const app = express()
app.use(express.json())

app.get('/api/health', async (req, res) => {
  await prisma.$queryRaw`SELECT 1`
  res.json({ ok: true })
})

app.use('/api/auth', authRoutes)
app.use('/api/users', usersRoutes)

app.use(errorHandler)

if (import.meta.main) app.listen(3000, () => console.log('backend on :3000'))
