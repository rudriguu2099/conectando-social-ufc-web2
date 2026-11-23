import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { signup, getSignupErrorMessage } from '@/features/auth/auth.service'
import { TIPOS_PARCEIRO, type FormParceiroData } from './types'

const formParceiroSchema = z.object({
  role: z.literal('PARTNER'),
  name: z.string().trim().min(3, 'Informe o nome do responsável.'),
  email: z.email('Informe um e-mail válido.'),
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres.'),
  organization: z.string().trim().min(2, 'Informe a organização.'),
  partnerType: z.enum(TIPOS_PARCEIRO),
  phone: z.string().trim(),
  termsAccepted: z.literal(true, {
    error: 'Você precisa aceitar o termo de ciência.',
  }),
})

const initialForm: FormParceiroData = {
  role: 'PARTNER',
  name: '',
  email: '',
  password: '',
  organization: '',
  partnerType: '',
  phone: '',
  termsAccepted: false,
}

export function useFormParceiro() {
  const navigate = useNavigate()
  const [form, setForm] = useState<FormParceiroData>(initialForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [payload, setPayload] = useState<FormParceiroData | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  function updateField<K extends keyof FormParceiroData>(
    field: K,
    value: FormParceiroData[K],
  ) {
    setForm((current) => ({ ...current, [field]: value }))
  }
  
  async function handleSubmit() {
    const result = formParceiroSchema.safeParse(form)
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
      await signup({
        ...result.data,
        termsAccepted: true,
      })
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
