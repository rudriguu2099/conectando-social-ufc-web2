import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import AuthField from '@/features/auth/components/AuthField'
import AuthFormNotice from '@/features/auth/components/AuthFormNotice'

export default function EsqueciSenhaPage() {
  const [notice, setNotice] = useState<string | null>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setNotice('A recuperação de senha ainda não está conectada ao backend.')
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">
          Esqueci minha senha
        </h2>
        <p className="text-sm leading-5 text-neutral-500">
          Informe o e-mail associado à sua conta.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <AuthField id="email" label="E-mail">
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="seu.email@ufc.br"
            required
            className="h-10 rounded-sm border-neutral-400 px-3 text-sm shadow-none focus-visible:border-sky-800 focus-visible:ring-sky-800/20"
          />
        </AuthField>

        <Button
          type="submit"
          className="h-10 w-full rounded-sm bg-sky-800 text-sm font-medium text-white hover:bg-sky-900"
        >
          Recuperar senha
        </Button>

        {notice && <AuthFormNotice>{notice}</AuthFormNotice>}
      </form>

      <p className="text-center text-sm">
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
