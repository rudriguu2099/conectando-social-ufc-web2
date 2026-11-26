import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthSubmitButton from '@/features/auth/components/AuthSubmitButton'
import AuthField from '@/features/auth/components/AuthField'
import AuthFormNotice from '@/features/auth/components/AuthFormNotice'
import AuthInput from '@/features/auth/components/AuthInput'
import { forgotPassword } from '@/features/auth/auth.service'

export default function EsqueciSenhaPage() {
  const [notice, setNotice] = useState<string | null>(null)

  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(formData: FormData) {
    if (isSubmitting) return

    const email = String(formData.get('email') ?? '').trim()
    setNotice(null)
    setIsSubmitting(true)

    try {
      await forgotPassword(email)
      setNotice(
        'Se existir uma conta com esse e-mail, enviaremos um link para recuperar a senha.',
      )
    } catch {
      setNotice('Não foi possível solicitar o link. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="font-serif text-[30px] font-bold leading-tight">
          Recuperar senha
        </h2>
        <p className="font-serif text-xl leading-7 text-neutral-950">
          Informe seu e-mail para recuperar a senha.
        </p>
      </div>

      <form className="space-y-4" action={handleSubmit}>
        <AuthField id="email" label="E-mail">
          <AuthInput
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="seu.email@ufc.br"
            required
          />
        </AuthField>

        <AuthSubmitButton disabled={isSubmitting}>
          {isSubmitting ? 'Enviando...' : 'Enviar link'}
        </AuthSubmitButton>

        {notice && <AuthFormNotice>{notice}</AuthFormNotice>}
      </form>

      <p className="text-center text-base">
        <Link
          to="/"
          className="font-medium text-neutral-900 underline underline-offset-2 hover:text-sky-800"
        >
          Voltar para entrar
        </Link>
      </p>
    </div>
  )
}
