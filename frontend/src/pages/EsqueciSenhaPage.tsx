import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthSubmitButton from '@/features/auth/components/AuthSubmitButton'
import AuthField from '@/features/auth/components/AuthField'
import AuthFormNotice from '@/features/auth/components/AuthFormNotice'
import AuthInput from '@/features/auth/components/AuthInput'

export default function EsqueciSenhaPage() {
  const [notice, setNotice] = useState<string | null>(null)

  function handleSubmit() {
    setNotice('A recuperação de senha ainda não está conectada ao backend.')
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="font-serif text-[30px] font-bold leading-tight">
          Recuperar senha
        </h2>
        <p className="font-serif text-xl leading-7 text-neutral-950">
          Digite o e-mail da sua conta. Vamos enviar um link para você criar uma senha nova.
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

        <AuthSubmitButton
          type="submit"
          >
          Enviar link
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
