import { useState } from 'react'
import { z } from 'zod'

export const TIPOS_PARCEIRO = [
  'ONG',
  'Associação',
  'Coletivo',
  'Cooperativa',
  'Escola',
  'Pequeno negócio',
  'Empresa',
  'Setor da UFC',
  'Órgão público',
  'Outro',
] as const

export type TipoParceiro = (typeof TIPOS_PARCEIRO)[number]

export interface FormParceiroData {
  role: 'PARTNER'
  name: string
  email: string
  password: string
  organization: string
  partnerType: TipoParceiro | ''
  phone: string
  termsAccepted: boolean
}

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
  const [form, setForm] = useState<FormParceiroData>(initialForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [payload, setPayload] = useState<FormParceiroData | null>(null)

  function updateField<K extends keyof FormParceiroData>(
    field: K,
    value: FormParceiroData[K],
  ) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function handleSubmit() {
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
    setPayload(result.data)
  }

  return {
    form,
    errors,
    payload,
    updateField,
    handleSubmit,
  }
}
