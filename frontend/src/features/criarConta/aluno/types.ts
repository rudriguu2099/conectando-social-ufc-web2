export const CURSOS = [
  'Engenharia de Software',
  'Design Digital',
  'Ciência da Computação',
  'Engenharia de Computação',
  'Inteligência Artificial',
  'Sistemas de Informação',
  'Redes de Computadores',
  'Cibersegurança',
] as const

export type Curso = (typeof CURSOS)[number]

export interface FormAlunoData {
  role: 'STUDENT'
  name: string
  email: string
  password: string
  course: Curso | ''
}
