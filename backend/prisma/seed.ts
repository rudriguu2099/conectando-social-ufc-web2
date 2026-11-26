// Creates or updates a professor account (professors don't sign up).
//   npm run seed                                  -> dev professor
//   npm run seed -- "Nome" email@ufc.br senha     -> real professor
import { prisma } from '../src/lib/prisma.ts'
import { hashPassword } from '../src/modules/auth/password.ts'

const [name = 'Prof. Carla Mendes', rawEmail = 'carla@ufc.br', password = 'senha1234'] =
  process.argv.slice(2)
const email = rawEmail.trim().toLowerCase()
if (password.length < 8) throw new Error('A senha precisa ter pelo menos 8 caracteres.')

const passwordHash = await hashPassword(password)
await prisma.user.upsert({
  where: { email },
  update: { name, passwordHash, role: 'PROFESSOR' },
  create: { name, email, passwordHash, role: 'PROFESSOR' },
})
console.log(`Professor ${email} pronto.`)
await prisma.$disconnect()
