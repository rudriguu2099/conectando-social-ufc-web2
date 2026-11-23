import express from 'express'
import swaggerUi from 'swagger-ui-express'
import { errorHandler } from './lib/http-error.ts'
import { prisma } from './lib/prisma.ts'
import { openApiSpec } from './lib/swagger.ts'
import { authRoutes } from './modules/auth/auth.routes.ts'
import { projectsRoutes } from './modules/projects/projects.routes.ts'
import { usersRoutes } from './modules/users/users.routes.ts'

export const app = express()
app.use(express.json())

app.get('/api/health', async (req, res) => {
  await prisma.$queryRaw`SELECT 1`
  res.json({ ok: true })
})

app.use('/api/auth', authRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/projects', projectsRoutes)

// docs
if (process.env.NODE_ENV !== 'production') {
  app.get('/api/docs.json', (req, res) => res.json(openApiSpec))
  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(openApiSpec, { swaggerOptions: { persistAuthorization: true } }),
  )
}

app.use(errorHandler)

if (import.meta.main) app.listen(3000, () => console.log('backend on :3000'))
