// Example accounts and projects for development. Can run again: what already exists is kept as it is.
import type { Prisma } from '@prisma/client'
import { prisma } from '../src/lib/prisma.ts'
import { hashPassword } from '../src/modules/auth/password.ts'

if (process.env.NODE_ENV === 'production') throw new Error('seed:demo é só para desenvolvimento.')

const passwordHash = await hashPassword('senha1234')

const user = (data: Omit<Prisma.UserCreateInput, 'passwordHash'>) =>
  prisma.user.upsert({
    where: { email: data.email },
    update: {},
    create: { ...data, passwordHash },
  })
const professor = (name: string, email: string) => user({ name, email, role: 'PROFESSOR' })
const student = (name: string, email: string, course: string) =>
  user({ name, email, role: 'STUDENT', course })
const partner = (
  name: string,
  email: string,
  organization: string,
  partnerType: string,
  phone: string | null = null,
) =>
  user({
    name,
    email,
    role: 'PARTNER',
    organization,
    partnerType,
    phone,
    termsAcceptedAt: new Date(),
  })

const carla = await professor('Prof. Carla Mendes', 'carla@ufc.br')
await professor('Prof. Daniel Freitas', 'daniel@ufc.br')

const ana = await student('Ana Ribeiro', 'ana.ribeiro@alu.ufc.br', 'Design Digital')
const bruno = await student('Bruno Costa', 'bruno.costa@alu.ufc.br', 'Engenharia de Software')
const fernanda = await student(
  'Fernanda Alves',
  'fernanda.alves@alu.ufc.br',
  'Ciência da Computação',
)
const gustavo = await student('Gustavo Lima', 'gustavo.lima@alu.ufc.br', 'Sistemas de Informação')

const maria = await partner(
  'Maria Souza',
  'maria@vidanova.org',
  'Associação Vida Nova',
  'ONG',
  '(85) 90000-0000',
)
const joana = await partner(
  'Joana Prado',
  'joana@maosquecriam.com',
  'Cooperativa Mãos que Criam',
  'Cooperativa',
)
const paulo = await partner(
  'Paulo Melo',
  'paulo@raiodesol.edu.br',
  'Escola Municipal Raio de Sol',
  'Escola',
)

const team = {
  create: [
    { userId: ana.id, teamRole: 'PO' },
    { userId: bruno.id, teamRole: 'Front-end' },
    { userId: fernanda.id, teamRole: 'Back-end' },
    { userId: gustavo.id, teamRole: 'UX/UI' },
  ],
}
const assigned = {
  professorId: carla.id,
  applicantId: ana.id,
  appliedAt: new Date(),
  discipline: 'Projeto Integrado I',
  members: team,
}

const projects: Prisma.ProjectUncheckedCreateInput[] = [
  {
    title: 'Cadastro de voluntários',
    problem: 'Os voluntários se inscrevem pelo WhatsApp e a lista se perde.',
    affected: 'Cerca de 40 voluntários e a coordenação da associação.',
    expectedOutcome: 'Um cadastro com os dias e as oficinas em que cada um pode ajudar.',
    availability: 'Segundas pela manhã',
    partnerId: maria.id,
    status: 'IN_REVIEW',
  },
  {
    title: 'App de delivery para a feira do bairro',
    problem: 'Os feirantes só vendem para quem vai até a feira.',
    affected: 'Os feirantes e os moradores do bairro.',
    expectedOutcome: 'Um aplicativo de pedidos com entrega.',
    partnerId: maria.id,
    status: 'REJECTED',
    statusReason: 'Escopo grande demais para um semestre',
  },
  {
    title: 'Site para divulgar as oficinas da Associação Vida Nova',
    problem: 'As oficinas só são divulgadas no boca a boca, e muitas vagas ficam vazias.',
    affected: 'Cerca de 120 famílias do bairro atendidas pela associação.',
    currentSituation: 'Cartazes na sede e mensagens no WhatsApp.',
    expectedOutcome: 'Um site simples com a agenda das oficinas e um formulário de inscrição.',
    availability: 'Terças e quintas à tarde',
    partnerId: maria.id,
    status: 'AVAILABLE',
  },
  {
    title: 'Agenda online para a biblioteca da escola',
    problem: 'As visitas são marcadas num caderno e os horários se repetem.',
    affected: 'Alunos e professores da escola.',
    expectedOutcome: 'Uma agenda em que cada turma reserva o horário.',
    partnerId: paulo.id,
    status: 'AWAITING_APPROVAL',
    ...assigned,
    semester: '2026.2',
  },
  {
    title: 'Controle de estoque para a cooperativa de costura',
    problem: 'A cooperativa controla tecidos e peças num caderno e perde vendas.',
    affected: 'As 18 costureiras da cooperativa e os clientes das feiras.',
    expectedOutcome: 'Um sistema simples para registrar entradas e saídas pelo celular.',
    partnerId: joana.id,
    status: 'IN_PROGRESS',
    phase: 'DESIGN',
    ...assigned,
    semester: '2026.2',
  },
  {
    title: 'Cardápio digital da cantina da escola',
    problem: 'O cardápio muda toda semana e as famílias não ficam sabendo.',
    affected: 'As famílias dos 300 alunos.',
    expectedOutcome: 'Uma página com o cardápio da semana.',
    partnerId: paulo.id,
    status: 'COMPLETED',
    ...assigned,
    semester: '2026.1',
    repoUrl: 'https://github.com/carlamendes/cardapio-cantina',
    figmaUrl: 'https://www.figma.com/design/cardapio-cantina',
  },
]

for (const data of projects) {
  const existing = await prisma.project.findFirst({
    where: { title: data.title, partnerId: data.partnerId },
  })
  if (!existing) await prisma.project.create({ data })
}
console.log('Contas e projetos de exemplo prontos.')
await prisma.$disconnect()
