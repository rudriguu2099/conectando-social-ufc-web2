import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { getLoginErrorMessage, login } from '@/features/auth/auth.service'
import type { LoginPayload } from '@/features/auth/types'

const formEntrarSchema = z.object({
  email: z.email('Informe um e-mail válido.'),
  password: z.string().min(1, 'Informe sua senha.'),
})

const initialForm: LoginPayload = {
  email: '',
  password: '',
}

export function useFormEntrar() {
  const navigate = useNavigate()
  const [form, setForm] = useState<LoginPayload>(initialForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  function updateField<K extends keyof LoginPayload>(field: K, value: LoginPayload[K]) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit() {
    const result = formEntrarSchema.safeParse(form)
    if (!result.success) {
      setErrors(
        Object.fromEntries(
          result.error.issues.map((issue) => [issue.path.join('.'), issue.message]),
        ),
      )
      return
    }

    setErrors({})
    setSubmitError(null)
    setIsSubmitting(true)

    try {
      await login(result.data)
      navigate('/home')
    } catch (error) {
      setSubmitError(getLoginErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    form,
    errors,
    isSubmitting,
    submitError,
    updateField,
    handleSubmit,
  }
}
