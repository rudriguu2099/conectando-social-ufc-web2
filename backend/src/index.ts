import express from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const app = express()
app.use(express.json())

app.get('/api/health', async (req, res) => {
  await prisma.$queryRaw`SELECT 1`
  res.json({ ok: true })
})

app.get('/api/users', async (req, res) => {
  res.json(await prisma.user.findMany())
})

app.listen(3000, () => console.log('backend on :3000'))
