import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { signup, getSignupErrorMessage } from '@/features/auth/auth.service'

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

const formAlunoSchema = z.object({
  role: z.literal('STUDENT'),
  name: z.string().trim().min(3, 'Informe seu nome completo.'),
  email: z.email('Informe um e-mail válido.'),
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres.'),
  course: z.enum(CURSOS, 'Selecione seu curso.'),
})

const initialForm: FormAlunoData = {
  role: 'STUDENT',
  name: '',
  email: '',
  password: '',
  course: '',
}

export function useFormAluno() {
  const navigate = useNavigate()
  const [form, setForm] = useState<FormAlunoData>(initialForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [payload, setPayload] = useState<FormAlunoData | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  function updateField<K extends keyof FormAlunoData>(
    field: K,
    value: FormAlunoData[K],
  ) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit() {
    const result = formAlunoSchema.safeParse(form)
    if (!result.success) {
      setErrors(
        Object.fromEntries(
          result.error.issues.map((issue) => [
            issue.path.join('.'),
            issue.message,
          ]),
        ),
      )
      return
    }

    setErrors({})
    setSubmitError(null)
    setPayload(result.data)
    setIsSubmitting(true)

    try {
      await signup(result.data)
      navigate('/home');
    } catch (error) {
      setSubmitError(getSignupErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    form,
    errors,
    payload,
    isSubmitting,
    submitError,
    updateField,
    handleSubmit,
  }
}